
const i2c = require('i2c-bus');

async function read() {
	let i2c1
	try {
		i2c1 = await i2c.openPromisified(1)
	} catch (err) {
		console.error('opening failed \n', err)
	}
	// let send = await i2c1.writeByte(0x08, 1, 0x07)
	// send = await i2c1.writeByte(0x08, 1, 0x07)

	for (let i = 0; i < 7 + 8; i++) {
		let res = await i2c1.readByte(0x08, 1)
		console.log(res)
	}

}
read()