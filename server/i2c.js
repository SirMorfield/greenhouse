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
		Arduino.readByte(arduinoAddress, 1)
	} catch (err) { console.error(err) }
}

let lastRead = { timestamp: 0 }
let isReading = false
class Reader extends EventEmitter { }
const reader = new Reader()

async function read(firstCall = true) {
	if (Date.now() - lastRead.timestamp < 15000) return lastRead

	if (isReading) {
		return await new Promise((resolve) => {
			reader.on('newRead', (read) => resolve(read))
		})
	}

	isReading = true
	if (!Arduino) Arduino = await i2c.openPromisified(1)
	if (firstCall) readFails = 0

	for (let i = 0; i < 20; i++) {
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
				translated: translate(bytes),
				date: (new Date()).toLocaleString('en-GB', { hour12: false }),
				timestamp: Date.now()
			}
			isReading = false
			lastRead = res
			reader.emit('newRead', res);
			return res
		}

		if (i % 2 == 0) {
			await readByte()
			await readByte()
		}
	}
	process.exit()
}

async function writeByte(byte) {
	try {
		await Arduino.i2cWrite(arduinoAddress, 1, Buffer.from([byte]))
	} catch (err) { console.error(err) }
}

let isWriting = false
let toWrites = []
async function write(varName, number) {
	if (!Arduino) Arduino = await i2c.openPromisified(1)
	if (isWriting) {
		toWrites.push({ varName, number })
		return
	}

	const i = names.findIndex((name) => name === varName)
	const checkSum = generateChecksum([i, number])

	isWriting = true
	for (let i = 0; i < 20; i++) {
		for (const byte of [i, number, checkSum]) await writeByte(byte)

		let reads = await read()

		if (reads.bytes[i] === number) {
			isWriting = false
			if (toWrites.length > 0) {
				const toWrite = toWrites[toWrites.length - 1]
				toWrites.pop()
				write(toWrite.varName, toWrite.number)
			}
			return
		}

		if (i % 2 == 0) {
			await writeByte(42)
			await writeByte(42)
		}
	}
	process.exit()
}

module.exports = {
	read,
	write,
	names,
	translate
}
