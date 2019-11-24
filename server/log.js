module.exports = (i2c) => {
	const fs = require('fs').promises
	const path = require('path')
	const savePath = path.join(__dirname, 'log.csv')
	let timeout

	async function add(loop = true, interval = 5 * 60 * 1000) {
		if (timeout) clearTimeout(timeout)

		let bytes = await i2c.read()
		if (bytes.success) {
			bytes = JSON.stringify(bytes) + '\n'
			await fs.appendFile(savePath, toWrite)
		}

		if (loop) timeout = setTimeout(add, interval)
	}

	async function getReadings(splitInVars = false) {
		let readings = await fs.readFile(savePath)
		readings = readings.toString()
		readings = readings.split('\n')
		readings = readings.filter((string) => string.length > 1)
		readings = readings.map((reading) => JSON.parse(reading))
		readings = readings.filter((reading) => reading.success === true)

		if (splitInVars) {
			let newReadings = {
				dates: [],
				temps: [],
				hums: [],
				timestamps: []
			}
			for (const reading of readings) {
				newReadings.dates.push(reading.translated.date)
				newReadings.temps.push(reading.translated.temp)
				newReadings.hums.push(reading.translated.hum)
				newReadings.timestamps.push(reading.timestamp)
			}
			return newReadings
		}

		return readings
	}



	return {
		add,
		getReadings
	}
}
