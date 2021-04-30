import crypto from 'crypto' 
import timingSafeCompare from 'tsscmp'
import jwt from 'jsonwebtoken'
import { 
	deleteFields,
	updateDoc,
	getCollection,
	getDoc, 
	createUser, 
	setClaims, 
	setDoc, 
	mintToken, 
	addDoc 
} from './firebaseNode'
import { makeQueryString } from '../shared/utils/queryString'
import { shopRegex, httpsRegex } from '../shared/utils/shopifyValidation'
import { oAuthRequest } from './oAuth'

export const verifyHmac = shopData => {
	try{
		const { name } = shopData
		const sansHmac = { ...shopData }  
		delete sansHmac['hmac']
		delete sansHmac['name']
		sansHmac['shop'] = !name ? shopData['shop'] : name
		const unsortedKeys = Object.keys(sansHmac)
		const keys = unsortedKeys.sort()
		const newArray = new Array(keys.length).fill({key: null, value: null})
		for(let i = 0; i < keys.length; i++){
			const key = keys[i] 
			newArray[i] = { key: keys[i], value: sansHmac[key] }
		}
		const qS = makeQueryString(newArray)
		const hmac = Buffer.from(crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET)
			.update(qS)
			.digest("hex"), 'utf-8')
		const providedHmac = Buffer.from(shopData.hmac, 'utf-8')
		const truth = timingSafeCompare(hmac.toString(), providedHmac.toString())
		return truth
	}catch(err){
		console.log(err)
		throw new Error(err)
	}
}


const parseNonce = request => {
	const array = request.headers.referer.split('&')
	const regex = new RegExp('^state=')
	const nonceComponent = array.find(e => e.match(regex))
	return decodeURIComponent(nonceComponent.replace(regex, ''))
}

const compareTimes = (previous, current) => {
	const a = Date(previous).split(" GMT")
	const b = Date(current).split(" GMT")
	const differences = new Array
	return { a : a[0], b : b[0] }
}
export const retrieveJwt = async (args, request) => {
	try{
		const validHmac = verifyHmac(args)
		if(!validHmac){
			throw new Error('invalid hmac')
		}
		const { name, timestamp, host, session } = args
		const qArr = [{
			field: 'session',
			opperator: '==',
			value: session 
		}]
		const [ match ] = await getCollection('sessions', qArr, 1)
		if(match){
			match['valid'] = true
			match['installed'] = true
			console.log('match from session id', 'now take refresh token and send new jwt')
			return match
		}
		const queryArray = [{ 
			field: 'name',
			opperator: '==',
			value: name
		},{
			field: 'timestamp',
			sort: 'desc' 
		}]
		const [ mRS ] = await getCollection('sessions', queryArray, 1)
		if(!mRS){
			throw new Error('no sessions for this shop')
		}
		const msDiff = (timestamp * 1000) - mRS.timestamp 
		console.log({ msDiff })
		if((msDiff * .00001) > 1){
			throw new Error("long handshaek")
		}
		const rh = request.headers
		const { user } = mRS
		const b = Buffer.from(host, 'base64') 
		const sesh = { msDiff, session, referer: rh.referer, host: b.toString() }
		const jwt = await mintToken(user, sesh)
		await updateDoc('sessions', sesh, mRS.uid)
		return { jwt, valid: true, installed: true }
	}catch(err){
		console.log(err)
		return err
	}
}
export const oAuthExchange = async (shop, request) => {
	try{
		if(!shop.state){
			throw new Error('no state')
		}else{
			const nonce = parseNonce(request)
			const object = { field: 'nonce', opperator: '==', value: nonce }
			const [ session ] = await getCollection('sessions', [ object ])
			const hmacCompare = verifyHmac(shop)
			if(!hmacCompare){
				throw new Error('hmac mismatch')
			}
			if(!session.user){
				throw new Error('no user in session')
			}
			const { user } = session
			if(!session.nonce){
				throw new Error('no nonce in session')
			}
			const compareNonce = timingSafeCompare(session.nonce, nonce)
			if(!compareNonce){
				throw new Error('nonce mismatch')
			}
			const { name } = shop
			const shopRegExp = name.match(shopRegex)
			if(!shopRegExp){
				console.log('wut', name, shopRegex)
				if(name.match(/^http/)){
					const httpsRegExp = name.match(httpsRegex)
					if(!httpsRegExp){
						throw new Error('bad shopname')
					}
				}else{
					throw new Error('bad shopname')
				}
			}
			const json = await oAuthRequest(name, shop.code)
			const { access_token, scope } = json 
			if(!access_token){
				throw new Error('no access token')
			}
			await updateDoc('merchants', {
				scope,
				accessToken: access_token,
				lastUpdate: Date.now(),
			}, user)
			await deleteFields('sessions', ['nonce'], session.uid)
			return { name }
		}
	}catch(err){
		return err
	}
}
export const makeRedirectUrl = (name, nonce) => {
	return `https://${name}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_API_SCOPES}&redirect_uri=${process.env.SHOPIFY_APP_URL}/auth/callback&state=${nonce}`
}
export const decodeSession = async (parent, shop, request) => {
	try{
		if(!verifyHmac(shop)){
			throw new Error('invalid hmac')
		}else{
			const { host } = shop
			const b = Buffer.from(host, 'base64')
			const shopHost = b.toString()
			console.log(shopHost)
		}
	}catch(err){
		console.log(err)
		return err
	}
}
export const beginUser = async (name, valid) => {
	if(!valid){
		throw new Error("invalid hmac")
	}else{
		const uid = await createUser({ name })
		const nonce = crypto.randomBytes(16).toString('base64') 
		const redirectUrl = makeRedirectUrl(name, nonce)
		const sessionId = await addDoc('sessions', { nonce, name, timestamp: Date.now(), user: uid })
		await setDoc('merchants', { name, timestamp: Date.now() }, uid)
		return { nonce, redirectUrl, name, valid }
	}
}
export const checkShop = async (parent, shop, request) => {
	const { name, timestamp, hmac } = shop 
	const merchant = await getDoc('merchants', name)
	if(merchant && !merchant.error){
		const { referer } =  request.header
		console.log(merchant, args.shop, referer, 101)
		return merchant 
	}else if(merchant && merchant.error){
		console.log(shop)
	}
}
