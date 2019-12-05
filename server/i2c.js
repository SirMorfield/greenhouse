const EventEmitter = require('events')
const i2c = require('i2c-bus')
const arduinoAddress = 0x08
const translator = require('./translator.js')
let Arduino

async function readByte() {
	try {
		return await Arduino.readByte(arduinoAddress, 1)
	} catch (err) { return { error: err } }
}

let isReading = false
class Reader extends EventEmitter { }
const reader = new Reader()

async function read() {
	if (isReading) {
		await new Promise(resolve => reader.on('readDone', resolve))
		const reads = await read()
		return reads
	}

	isReading = true
	if (!Arduino) Arduino = await i2c.openPromisified(1)

	let fails = 0
	while (fails < 20) {
		let bytes = []
		for (let i = 0; i < translator.numBytesToRead; i++) {
			const byte = await readByte()
			if (byte.error) return { error: byte.error }
			bytes.push(byte)
		}

		const res = translator.translate(bytes)
		if (res.error === undefined) {
			reader.emit('readDone')
			isReading = false
			return res
		}

		if (fails++ % 2 == 0) await readByte()
	}
	return { error: `all ${fails} tries failed` }
}

async function writeByte(byte) {
	try {
		await Arduino.i2cWrite(arduinoAddress, 1, Buffer.from([byte]))
	} catch (err) { return { error: err } }
}

let isWriting = false
class Writer extends EventEmitter { }
const writer = new Writer()

async function write(varName, int) {
	if (isWriting) {
		await new Promise((resolve) => writer.on('writeDone', resolve))
		const msg = await write(varName, int)
		return msg
	}

	let fails = 0
	let toReturn

	isWriting = true
	if (!Arduino) Arduino = await i2c.openPromisified(1)

	while (true) {
		const bytes = translator.serialize(varName, int)
		for (const byte of bytes) {
			let res = await writeByte(byte)
			if (res.error) {
				toReturn = res.error
				break
			}
		}

		const reads = await read()

		if (reads.error) {
			toReturn = { error: `read failed with ${reads.error}` }
			break
		}

		if (reads.deserialized[varName] === int) {
			toReturn = {}
			break
		}

		if (fails++ % 2 == 0) await writeByte(42)

		if (fails == 15) {
			toReturn = { error: `all ${fails} tries failed` }
			break
		}
	}

	isWriting = false
	writer.emit('writeDone')
	return toReturn
}

module.exports = {
	read,
	write
}
