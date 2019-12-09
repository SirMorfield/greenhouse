(async () => {
	console.clear()
	const path = require('path')
	const express = require('express')
	const app = express()
	const http = require('http').createServer(app)

	app.use(express.static(path.join(__dirname, 'public/')))

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'public/index.html'))
	})

	const isProduction = process.env.NODE_ENV == 'production'
	const log = require('./server/log.js')
	const env = require('./server/settings.json')
	const i2c = require('./server/i2c.js')

	const isPi = require('detect-rpi')()
	if (isPi && isProduction) {
		const logic = require('./server/logic.js')(i2c)
		await logic.defaultArduinoVars(env.defaultArduinoVars)
		await logic.lamp(env.lamp.lampOn, env.lamp.lampOff)
		await logic.humidity(env.humidity.target, env.humidity.interval)
		await logic.temperature(env.temperature.target, env.temperature.interval)
		await logic.saveReading(env.saveReading.interval)
	}

	const io = require('socket.io')(http)
	io.on('connection', (socket) => {
		log.getReadingsFrontend()
			.then((r) => socket.emit('readings', r))
		socket.on('reqRead', async () => {
			if (!isPi) {
				socket.emit('resRead', { error: 'not running on pi' })
				return
			}
			const read = await i2c.read()
			socket.emit('resRead', read)
		})
	})

	http.listen(env.port)
})()