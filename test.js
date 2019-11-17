const i2c = require('i2c-bus')
const arduinoAddress = 0x08

let i2cArduino
async function write(num) {
	if (!i2cArduino) i2cArduino = await i2c.openPromisified(1)
	// for (const byte of [2, 3, 4]) {
	const wbuf = Buffer.from([5]);
	await i2cArduino.i2cWrite(arduinoAddress, 1, Buffer.from([]))
	// }
	console.log("done", num)

}
write(69)