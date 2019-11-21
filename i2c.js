
const i2c = require('i2c-bus')
const numVars = 14
const arduinoAddress = 0x08

const names = [
	'targetTemp',
	'targetHum',
	'updateInterval',
	'fanInPWM',
	'fanOutPWM',
	'ledStripPWM',
	'temp',
	'hum',
	'fanInOn',
	'fanOutOn',
	'ledOn',
	'dehumidifierOn',
	'lampOn',
	'heaterOn'
]

let i2cArduino
async function read() {
	// TODO implement checksum

	if (!i2cArduino) i2cArduino = await i2c.openPromisified(1)
	let reads = []
	for (let i = 0; i < numVars; i++) {
		const byte = await i2cArduino.readByte(arduinoAddress, 1)
		reads.push(byte)
	}
	return reads
}

function bytesToHumanReadable(bytes) {
	if (bytes.length !== names.length) return 'wrong amount of bytes'

	bytes[2] = bytes[2] * 5

	for (let i = 8; i < 14; i++) {
		bytes[i] = bytes[i] ? true : false
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
	sum = 255 - sum;
	sum = sum % 256
	return sum;
}

async function writeByte(byte) {
	try {
		await i2cArduino.i2cWrite(arduinoAddress, 1, Buffer.from([byte]))
		return 0
	} catch (err) {
		return 1
	}
}

let fails = 0
async function write(varName, number, firstCall = true) {
	if (!i2cArduino) i2cArduino = await i2c.openPromisified(1)
	if (firstCall) fails = 0

	const i = names.findIndex((name) => name === varName)
	const checkSum = generateChecksum([i, number])
	for (const byte of [i, number, checkSum]) await writeByte(byte)

	let reads = await read()
	if (reads[i] === number) return `success for ${varName} = ${number}, with ${fails} fails`

	if (fails % 2 == 0) {
		await writeByte(42)
		await writeByte(42)
	}

	let message
	if (++fails < 20) message = await write(varName, number, false)
	else return `failed for ${varName} = ${number}, with ${fails} fails`

	return message
}

async function getValues() {
	const bytes = await read()
	return bytesToHumanReadable(bytes)
}
async function run() {
	let first = await getValues()
	console.log(first)

	let msg = await write('fanOutPWM', 100)
	console.log(msg)

	let last = await getValues()
	console.log(last)
}

run()
// module.exports = {
// 	read,
// 	write,
// 	bytesToHumanReadable,
// 	getValues
// }
