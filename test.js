const i2c = require('./server/i2c');

(async () => {
	await i2c.init()
	// for (let i = 0; i < 1023; i++) {
	const r = await i2c.read()
	console.log(r)
	// }
})()