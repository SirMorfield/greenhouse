function get(i) {
	let runs = 0
	while (true) {
		if (runs++ == i) {
			console.log('ja')
			return i
			// break
		}
	}
	console.log('nee')
}
console.log(

	get(-20)
)