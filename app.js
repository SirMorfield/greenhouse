
(async () => {
	console.clear()
	const path = require('path')
	const express = require('express')
	const app = express()
	const http = require('http').createServer(app)
	const io = require('socket.io')(http)
	const isPi = require('detect-rpi')()

	app.use(express.static(path.join(__dirname, 'public/')))

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'public/index.html'))
	})

	const env = require('./server/settings.json')
	const log = require('./server/log.js')
	const production = process.env.NODE_ENV == 'production'

	if (isPi && production) {
		console.log('is pi')
		const i2c = require('./server/i2c.js')

		log.add(i2c, true, env.logInterval)

		const error = await i2c.writeList(env.arduinoVars)
		if (error) console.error(error)

		const lamp = require('./server/lamp.js')(i2c)
		await lamp.init(env.lamp)
	}

	io.on('connection', async (socket) => {
		const readings = await log.getReadingsFrontend()
		socket.emit('readings', readings)
		socket.on('read', async () => {

		})
	})

	http.listen(production ? 433 : 8080)
})()
