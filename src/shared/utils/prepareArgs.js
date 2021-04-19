const prepareArgs = params => {
	const argsArray = [] 
	for(const key in params){
		if(key === 'quantity'){
			argsArray.push(`${key}: ${params[key]}`)
		}else{
			argsArray.push(`${key}: "${params[key]}"`)
		}
	}
	return `(${argsArray.join(' ')})`
}

export default prepareArgs