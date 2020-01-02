const i2c = require('./server/i2c')
i2c.read().then((res) => {
	console.log(res)
})
