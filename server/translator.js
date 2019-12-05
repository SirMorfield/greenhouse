class Translator {
	constructor() {
		this.names = [
			'dehumidifierOn',
			'lampOn',
			'heaterOn',
			'fanInPWM',
			'fanOutPWM',
			'ledPWM',
			'temp',
			'hum',
			'fanInOn',
			'fanOutOn',
			'ledOn'
		]
		this.varSizes = [
			1,  // dehumidifierOn
			1,  // lampOn
			1,  // heaterOn
			8,  // fanInPWM
			8,  // fanOutPWM
			8,  // ledPWM
			10, // temp
			10, // hum
			1,  // fanInOn
			1,  // fanOutOn
			1   // ledOn
		]
		this.numVars = this.names.length
		this.numBytesToRead = 8
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

		// console.log(nums)
		let nums = bits.map(str => parseInt(str, 2))

		// deserialized[6] *= parseFloat((deserialized[6] * 0.1).toFixed(2)) // temp
		// deserialized[7] *= parseFloat((deserialized[6] * 0.1).toFixed(2)) // hum
		return {
			bits,
			nums
		}
	}
	intsToObj(nums) {
		let human = {}
		for (let i = 0; i < this.names.length; i++) {
			human[this.names[i]] = nums[i]
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

			if (checksum !== correctChecksum) {
				return { error: `checksum: ${checksum} correctChecksum: ${correctChecksum}` }
			}

			let deserialized = this.deserializeBytes(bytesWithoutChecksum)
			let obj = this.intsToObj(deserialized.nums)

			return {
				bytes: bytes,
				bytesAsBitStr: bytes.map((byte) => (byte.toString(2)).padStart(8, '0')),
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