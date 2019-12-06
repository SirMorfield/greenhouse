console.clear()
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const i2c = require('./server/i2c.js')
const isPi = require('detect-rpi')()
const production = process.env.NODE_ENV == 'production'

app.use(express.static(path.join(__dirname, 'public/')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})
const log = require(path.join(__dirname, 'server/log.js'))(i2c)

if (isPi && production) {
	console.log('is pi')
	log.add(true, 2 * 60 * 1000)
	require(path.join(__dirname, 'server/lamp.js'))(i2c)
}

io.on('connection', async (socket) => {
	const readings = await log.getReadingsFrontend()
	socket.emit('readings', readings)
	socket.on('read', async () => {

	})
})

http.listen(production ? 433 : 8080)
