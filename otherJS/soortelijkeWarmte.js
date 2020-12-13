

function duration(x1, x2, x3, power, dT, airTight = false) {
	// ~ 25 c
	// todo intergrade temperature compensation
	const Cv = 0.718e3
	const Cp = 1.003e3
	const Pair = 1.1839

	const V = x1 * x2 * x3
	const weight = V * Pair

	const joule = (airTight ? Cv : Cp) * weight * dT
	const time = joule / power

	return time
}

console.log(duration(1.45, 1.45, 1.95, 1000, 1, true))
console.log(duration(1.45, 1.45, 1.95, 1000, 1, false))
console.log(duration(1.45, 1.45, 1.95, 1000, 1))
