module.exports = (i2c) => {
	const fs = require('fs').promises
	const path = require('path')
	const savePath = path.join(__dirname, 'log.txt')
	let timeout

	function timestampToHuman(timestamp) {
		return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
	}

	async function add(loop = true, interval = 5 * 60 * 1000) {
		if (timeout) clearTimeout(timeout)

		let toSave = await i2c.read()
		toSave.timestamp = Date.now()
		toSave = `${JSON.stringify(toSave)}\n`
		await fs.appendFile(savePath, toSave)

		if (loop) timeout = setTimeout(() => { add(true, interval) }, interval)
	}

	async function getReadings() {
		let readings = await fs.readFile(savePath)
		readings = readings.toString()
		readings = readings.split('\n')
		readings = readings.filter((string) => string.length > 1)
		readings = readings.map((reading) => JSON.parse(reading))
		readings = readings.filter((reading) => reading.success === true)

		readings.map((reading) => {
			reading.translated = i2c.translate(reading.bytes)
			reading.date = timestampToHuman(reading.timestamp)
			return reading
		})

		return readings
	}

	async function getReadingsFrontend() {
		let readings = await getReadings()

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
