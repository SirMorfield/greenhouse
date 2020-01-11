const i2c = require('./server/i2c');

(async () => {
	await i2c.init()
	const r = await i2c.read()
	console.log(r)
})()