const EventEmitter = require('events')
const i2c = require('i2c-bus')
const arduinoAddress = 0x08
let Arduino

const names = [
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
const numVars = names.length

function translate(bytes) {
	if (bytes.length !== names.length) {
		console.error('wrong amount of bytes')
	}

	let human = {}
	for (let i = 0; i < bytes.length; i++) {
		human[names[i]] = bytes[i]
	}
	return human
}

function generateChecksum(bytes) {
	let sum = 0;
	for (const byte of bytes) sum += byte
	sum = sum % 256
	sum = 255 - sum;
	return sum;
}

async function readByte() {
	try {
		return await Arduino.readByte(arduinoAddress, 1)
	} catch (err) { console.error(err) }
}

let isReading = false
class Reader extends EventEmitter { }
const reader = new Reader()

async function read() {
	if (isReading) {
		await new Promise((resolve) => {
			reader.on('newRead', resolve)
		})
		const reads = await read()
		return reads
	}

	isReading = true
	if (!Arduino) Arduino = await i2c.openPromisified(1)

	let fails = 0
	while (fails < 20) {
		let bytes = []
		for (let i = 0; i < numVars; i++) {
			const byte = await readByte()
			bytes.push(byte)
		}

		const checkSum = await readByte()
		const correctCheckSum = generateChecksum(bytes)
		if (checkSum === correctCheckSum) {
			let res = {
				success: true,
				bytes,
			}
			isReading = false
			reader.emit('newRead', res);
			return res
		}

		if (fails++ % 2 == 0) {
			await readByte()
			await readByte()
		}
	}
	return { success: false, message: `all ${fails} tries failed` }
}

async function writeByte(byte) {
	try {
		await Arduino.i2cWrite(arduinoAddress, 1, Buffer.from([byte]))
	} catch (err) { console.error(err) }
}

let isWriting = false
class Writer extends EventEmitter { }
const writer = new Writer()

async function write(varName, number) {
	const varI = names.findIndex((name) => name === varName)
	if (varI < 0) return { success: false, message: `variable ${varName} not found` }
	const checkSum = generateChecksum([varI, number])

	if (isWriting) {
		await new Promise((resolve) => {
			writer.on('writeDone', resolve)
		})
		const msg = await write(varName, number)
		return msg
	}


	let fails = 0
	let toReturn

	isWriting = true
	if (!Arduino) Arduino = await i2c.openPromisified(1)

	while (true) {
		await writeByte(varI)
		await writeByte(number)
		await writeByte(checkSum)

		const reads = await read()

		if (reads.bytes[varI] === number) {
			isWriting = false
			toReturn = { success: true }
			break
		}

		if (reads.success == false) {
			toReturn = { success: false, message: `read failed with ${reads.message}` }
		}


		if (fails++ % 2 == 0) {
			await writeByte(42)
			await writeByte(42)
		}

		if (fails == 10) {
			toReturn = { success: false, message: `all ${fails} tries failed` }
			isWriting = false
			break
		}
	}

	isWriting = false
	writer.emit('writeDone')
	return toReturn
}

module.exports = {
	read,
	write,
	names,
	translate
}
