class Translator {
	constructor() {
		this.names = [
			'temp',
			'hum',
			'heaterOn',
			'dehumidifierOn',
			'lampPWM',
			'inOutFanPWM',
			'pumpPWM',
			'sensorFanPWM'
		]
		this.varSizes = [
			10, // temp
			10, // hum
			1,  // heaterOn
			1,  // dehumidifierOn
			8,  // lampPWM
			8,  // inOutFanPWM
			8,  // pumpPWM
			8   // sensorFanPWM
		]
		this.numVars = 8
		// Math.ceil((10 + 10 + 1 + 1 + 8 + 8 + 8 + 8 ) / 8) = 7
		this.numBytesToRead = 7
	}
	toObject(names, values) {
		let result = {};
		for (let i = 0; i < names.length; i++)
			result[names[i]] = values[i]
		return result
	}
	deserializeBytes(bytes) {
		let toBits = bytes.map((byte) => (byte.toString(2)).padStart(8, '0'))
		toBits = toBits.join('')

		let bits = []
		let offset = 0
		for (const varSize of this.varSizes) {
			let x = toBits.slice(offset, offset + varSize)
			bits.push(x)

			offset += varSize
		}

		let vars = bits.map(str => parseInt(str, 2))
		let realVars = JSON.parse(JSON.stringify(vars))
		vars[0] = parseFloat((vars[0] * 0.1).toFixed(2)) // temp
		vars[1] = parseFloat((vars[1] * 0.1).toFixed(2)) // hum
		return {
			bits,
			vars,
			realVars
		}
	}
	intsToObj(vars) {
		let human = {}
		for (let i = 0; i < this.names.length; i++) {
			human[this.names[i]] = vars[i]
		}
		return human
	}
	generateChecksum(bytes) {
		let sum = 0;
		for (const byte of bytes) sum += byte
		sum = sum % 256
		sum = 255 - sum;
		return sum;
	}
	translate(bytes) {
		try {
			let bytesWithoutChecksum = JSON.parse(JSON.stringify(bytes))
			let checksum = bytesWithoutChecksum.pop()
			const correctChecksum = this.generateChecksum(bytesWithoutChecksum)

			// if (checksum !== correctChecksum) {
			// 	return { error: `checksum: ${checksum} correctChecksum: ${correctChecksum}` }
			// }

			let deserialized = this.deserializeBytes(bytesWithoutChecksum)
			let obj = this.intsToObj(deserialized.vars)

			return {
				bytes: bytes,
				...deserialized,
				translated: obj
			}
		} catch (err) { return { error: err } }
	}
	serialize(varName, int) {
		const varI = this.names.findIndex((name) => name === varName)
		if (varI === -1) return { error: `variable ${varName} not found` }

		const checksum = this.generateChecksum([varI, int])
		return [varI, int, checksum]
	}
}

// let a = new Translator()
// console.log(a.translate([192, 32, 32, 32, 0, 1, 128, 94]))
module.exports = new Translator()