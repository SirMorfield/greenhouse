module.exports = (http, i2c, isPi) => {
	const io = require('socket.io')(http)

	io.on('connection', (socket) => {
		socket.on('reqReadings', async () => {
			const readings = await log.getReadingsFrontend()
			socket.emit('resReadings', readings)
		})

		socket.on('reqRead', async () => {
			if (!isPi) return
			const read = await i2c.read()
			socket.emit('resRead', read)
		})

		socket.on('reqWrite', async ({ varName, int }) => {
			socket.emit('resWrite', 'starting write')
			if (!isPi) return

			const write = await i2c.write(varName, int)
			socket.emit('resWrite', write || 'no write output')
		})
	})
}