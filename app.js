(async () => {
	console.clear()
	const isProduction = process.env.NODE_ENV == 'production'
	const path = require('path')
	const express = require('express')
	const app = express()
	const http = require('http').createServer(app)

	app.use(express.static(path.join(__dirname, 'public/')))

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'public/index.html'))
	})

	const log = require('./server/log.js')
	const env = require('./config/settings.json')

	const isPi = require('detect-rpi')()
	let i2c
	if (isPi) {
		i2c = require('./server/i2c.js')
		await i2c.init()

		const logic = require('./server/logic.js')(i2c, log)
		// await logic.defaultArduinoVars(env.defaultArduinoVars)
		// await logic.lamp(env.lamp.lampOn, env.lamp.lampOff)
		// await logic.humidity(env.humidity)
		// await logic.temperature(env.temperature)
		// await logic.saveReading(env.saveReading.interval)
	}

	require('./server/socketing.js')(http, i2c, isPi, log)

	http.listen(env.port)
})()