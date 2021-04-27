export const makeMutation = object => {
	const { hmac, shop, timestamp } = object
	
	const mutation = `
		mutation{
			addStore(
				shop:
					{
						name:"${shop}"
						timestamp: ${timestamp} 
						hmac: "${hmac}"
					}
			){
				name
				redirectURL
			}
		}
	`
	return mutation
}