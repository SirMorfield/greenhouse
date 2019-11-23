console.clear()
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static(path.join(__dirname, 'public/')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'))
})
const log = require(path.join(__dirname, 'server/log.js'))
// log.add()

io.on('connection', async (socket) => {
	const readings = await log.getReadings(true)
	socket.emit('readings', readings)
})

http.listen(8080, () => {
	console.log(`Running`)
})
