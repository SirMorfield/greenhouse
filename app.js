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
	let i2c

	const isPi = require('detect-rpi')()
	if (isPi && isProduction) {
		i2c = require('./server/i2c.js')
		const logic = require('./server/logic.js')(i2c)
		await logic.defaultArduinoVars(env.defaultArduinoVars)
		await logic.lamp(env.lamp.lampOn, env.lamp.lampOff)
		await logic.humidity(env.humidity)
		await logic.temperature(env.temperature)
		await logic.saveReading(env.saveReading.interval)
	}

	const io = require('socket.io')(http)
	io.on('connection', (socket) => {

		socket.on('reqReadings', async () => {
			const readings = await log.getReadingsFrontend()
			socket.emit('resReadings', readings)
		})

		socket.on('reqRead', async () => {
			if (!isPi) {
				socket.emit('resRead', { error: 'not running on pi' })
				return
			}
			const read = await i2c.read()
			socket.emit('resRead', read)
		})

		socket.on('reqWrite', async ({ varName, int }) => {
			if (!isPi) {
				socket.emit('resWrite', { error: 'not running on pi' })
				return
			}

			let write
			try {
				write = await i2c.write(varName, int)
			} catch (err) {
				write = err
			}
			socket.emit('resWrite', write)
		})
	})

	http.listen(env.port)
})()