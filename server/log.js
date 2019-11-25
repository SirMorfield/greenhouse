module.exports = (i2c) => {
	const fs = require('fs').promises
	const path = require('path')
	const savePath = path.join(__dirname, 'log.csv')
	let timeout

	async function add(loop = true, interval = 5 * 60 * 1000) {
		if (timeout) clearTimeout(timeout)

		let toWrite = await i2c.read()
		console.log('saving', toWrite)
		if (toWrite.success) {
			toWrite = JSON.stringify(toWrite) + '\n'
			await fs.appendFile(savePath, toWrite)
		}

		if (loop) timeout = setTimeout(add, interval)
	}

	async function getReadings() {
		let readings = await fs.readFile(savePath)
		readings = readings.toString()
		readings = readings.split('\n')
		readings = readings.filter((string) => string.length > 1)
		readings = readings.map((reading) => JSON.parse(reading))
		readings = readings.filter((reading) => reading.success === true)
		return readings
	}

	async function getReadingsFrontend() {
		const readings = await getReadings()

		let formated = {
			hums: [],
			temps: []
		}

		for (const reading of readings) {
			formated.temps.push({
				x: reading.timestamp,
				y: reading.translated.temp
			})
			formated.hums.push({
				x: reading.timestamp,
				y: reading.translated.hum
			})
		}
		return formated
	}



	return {
		add,
		getReadings,
		getReadingsFrontend
	}
}
