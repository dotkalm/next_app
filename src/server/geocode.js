import { getLogin } from './firebaseNode'
import { queryLocal } from './sqlite'

export const geocode = async ({ address, quantity }, request, db) => {
	const idToken = request.headers.authorization
	const user = await getLogin(idToken)
	const result = new Promise((resolve, reject) => {
    const textString = `
		SELECT g.rating, 
			(addy).address As stno, 
			(addy).streetname As street, 
			(addy).streettypeabbrev As styp, 
			(addy).location As city, 
			(addy).stateabbrev As st,
			(addy).zip, addy 
		FROM geocode($1, $2) As g`
		console.log(textString, [address, quantity], 8)
		db.query(textString, [address, quantity], (err, res) => {
			if(err){
				console.log(err, 11)
				reject(err)
			}else{
				resolve(res)
			}
		})
	})
	const { admin, guest } = user 
	if(admin || guest){
		const p = await result 
		return p.rows
	}else{
		return []
	}
}


export const getState = name => {
	return queryLocal('states', 'statefp', 'WHERE name = ?', [ name ])
}
export const getCounty = async args => {
	const { county , state } = args
	const [ { statefp } ] = await getState(state)
	console.log(statefp)
	const fieldsArray = [ 'statefp', 'countyfp', 'intptlat', 'intptlon', 'the_geom' ]	
	const fields = `${fieldsArray.join(', ')}` 

	let where = ''
	const params = [ statefp, county ]
	const paramsKey = [ 'statefp', 'name' ]
	for(let i = 0; i < params.length; i++){
		if(where === ''){
			where = `WHERE ${paramsKey[i]} = ?`
		}else{
			where = `${where} AND ${paramsKey[i]} = ?`
		}
	}
	console.log('counties', fields, where, params)

	const counties = await queryLocal('counties', fields, where, params) 
	return counties[0]
}
