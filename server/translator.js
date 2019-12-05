module.exports = {
	names: [
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
	],
	varSizes: [
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
	],
	numVars: names.length,
	numBytesToRead: this.numVars + 1, // 1 byte checksum
	bitRead: (byte, pos) => {
		let bitArray = byte.toString(2)

		if (pos < bitArray.length - 1) return 0
		return bitArray[bitArray.length - 1 - pos] === '0' ? 0 : 1
	},
	deserializeBytes: (bytes) => {
		let deserialized = []
		let bitInBytePos = 7
		let byteToReadPos = 0

		for (const varSize of this.varSizes) {
			let bitArray = ''
			for (let i = 0; i < varSize; i++) {
				bitArray += this.bitRead(bytes[byteToReadPos], bitInBytePos)
				if (bitInBytePos == 0) {
					bitInBytePos = 7
					byteToReadPos++
				}
				else bitInBytePos--
			}
			deserialized.push(bitArray)
		}
		deserialized.push(bytes[bytes.length - 1]) // checksum
		deserialized.map(int => parseInt(int, 2))

		deserialized[6] *= 0.1 // temp
		deserialized[7] *= 0.1 // hum

		return deserialized
	},
	intsToObj: (bytes) => {
		let human = {}
		for (let i = 0; i < this.names.length; i++) {
			human[this.names[i]] = bytes[i]
		}
		return human
	},
	generateChecksum: (bytes) => {
		let sum = 0;
		for (const byte of bytes) sum += byte
		sum = sum % 256
		sum = 255 - sum;
		return sum;
	},
	isValidChecksum: (bytes) => {
		const checksum = bytes[bytes.length - 1]
		bytes = bytes.splice(-1, 1)
		const correctChecksum = this.generateChecksum(bytes)

		return checksum === correctChecksum
	},
	translate: (bytes) => {
		try {
			let deserialized = this.deserializeBytes(bytes)
			if (!this.isValidChecksum(deserialized)) return { error: 'Checksum failed' }

			let obj = intsToObj(deserialized)
			obj = applyTransformation(obj)

			return {
				bytes,
				deserialized,
				translated: obj
			}
		} catch (err) { return { error: err } }
	},
	serialize: (varName, int) => {
		const varI = names.findIndex((name) => name === varName)
		if (varI === -1) return { error: `variable ${varName} not found` }

		const checksum = this.generateChecksum([varI, int])
		return [varI, int, checksum]
	}
}