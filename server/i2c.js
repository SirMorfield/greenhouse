
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

	// bytes[2] = bytes[2] * 5

	// for (let i = 8; i < 14; i++) {
	// 	bytes[i] = bytes[i] ? true : false
	// }

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

let readFails = 0
async function read(firstCall = true) {
	if (!Arduino) Arduino = await i2c.openPromisified(1)
	if (firstCall) readFails = 0

	let bytes = []
	for (let i = 0; i < numVars; i++) {
		const byte = await Arduino.readByte(arduinoAddress, 1)
		bytes.push(byte)
	}

	const checkSum = await Arduino.readByte(arduinoAddress, 1)
	const correctCheckSum = generateChecksum(bytes)
	if (checkSum === correctCheckSum) {
		return {
			success: true,
			fails: readFails,
			bytes,
			translated: translate(bytes)
		}
	}

	if (readFails % 2 == 0) {
		await Arduino.readByte(arduinoAddress, 1)
		await Arduino.readByte(arduinoAddress, 1)

	}

	if (++readFails > 20) return { success: false, fails: readFails }

	return await read(false)
}

async function writeByte(byte) {
	try {
		await Arduino.i2cWrite(arduinoAddress, 1, Buffer.from([byte]))
	} catch (err) { console.error(err) }
}

let writeFails = 0
async function write(varName, number, firstCall = true) {
	if (!Arduino) Arduino = await i2c.openPromisified(1)
	if (firstCall) writeFails = 0

	const i = names.findIndex((name) => name === varName)
	const checkSum = generateChecksum([i, number])
	for (const byte of [i, number, checkSum]) await writeByte(byte)

	let reads = (await read()).bytes
	if (reads[i] === number) return { success: true, fails: writeFails }

	if (writeFails % 2 == 0) {
		await writeByte(42)
		await writeByte(42)
	}

	if (++writeFails > 20) return { success: false, fails: writeFails }

	return await write(varName, number, false)
}

module.exports = {
	read,
	write,
	names
}
