// console.clear()
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const i2c = require('./server/i2c.js')

app.use(express.static(path.join(__dirname, 'public/')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})
const log = require(path.join(__dirname, 'server/log.js'))(i2c)
log.add(true, 2 * 60 * 1000)

const lamp = require('server/lamp.js')(i2c)

io.on('connection', async (socket) => {
	const readings = await log.getReadingsFrontend()
	socket.emit('readings', readings)
	socket.on('read', async () => {

	})
})

http.listen(8080, () => {
	console.log(`Running`)
})
