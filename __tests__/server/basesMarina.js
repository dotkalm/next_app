import { allBasesAndMarinas } from '../../src/server/services/sedna'
import { gisGeocoder } from '../../src/server/services/arcgis'

let data 
beforeAll(() => {
	return allBasesAndMarinas().then(d => {
		data = d
		return d
	})
})
test('all marinas/bases have baseIds', () => {
	for(let i = 0; i < data.length; i++){
		const dock = data[i]
		expect(dock.baseId).not.toBe(undefined)
		expect(dock.countryId).not.toBe(undefined)
		expect(dock.regionId).not.toBe(undefined)
	}
})

test('all marinas/bases have countryIds', () => {
	for(let i = 0; i < data.length; i++){
		const dock = data[i]
	}
})
test('all marinas/bases have regionIds', () => {
	for(let i = 0; i < data.length; i++){
		const dock = data[i]
	}
})
test('all marinas/bases have locationStrings', () => {
	for(let i = 0; i < data.length; i++){
		const dock = data[i]
		expect(dock.locationString).not.toBe(undefined)
	}
})
test('a locationString can return coordinates', async () => {
	const [ dock ] = data 
	const { locationString } = dock
	const place = await gisGeocoder(locationString)
	console.log(place)
	expect(place).not.toBe(undefined)
})
