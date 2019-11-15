
const i2c = require('i2c-bus');
const numConsts = 6
const numVars = 8

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
	if (!i2cArduino) i2cArduino = await i2c.openPromisified(1)
	let reads = []
	for (let i = 0; i < numConsts + numVars; i++) {
		let byte = await i2cArduino.readByte(0x08, 1)
		reads.push(byte)
	}
	return reads
}

function bytesToHumanReadable(bytes) {
	if (bytes.length !== numConsts + numVars) {
		return {
			error: `received wrong amount of bytes ${bytes.length}, got ${numConsts + numVars}`
		}
	}

	bytes[2] = bytes[2] * 5
	bytes[8] = bytes[8] ? true : false
	bytes[9] = bytes[9] ? true : false
	bytes[10] = bytes[10] ? true : false
	bytes[11] = bytes[11] ? true : false
	bytes[12] = bytes[12] ? true : false
	bytes[13] = bytes[13] ? true : false

	let human = {}
	for (let i = 0; i < bytes.length; i++) {
		human[names[i]] = bytes[i]
	}
	return human
}

function write(varName, number) {
	let index = names.findIndex

}
(async () => {
	const bytes = await read()
	console.log(bytesToHumanReadable(bytes))
})()
// send = await i2c1.writeByte(0x08, 1, 0x07)