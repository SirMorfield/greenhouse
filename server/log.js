module.exports = (i2c) => {
	const fs = require('fs').promises
	const path = require('path')
	const savePath = path.join(__dirname, 'log.txt')
	const translator = require('./translator.js')

	function timestampToHuman(timestamp) {
		return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
	}

	function serializeReading(read) {
		if (read.error) return `0,${Date.now()}\n`
		return `1,${read.deserialized},${Date.now()}\n`
	}

	function parseReading(string) {
		let arr = string.split(',')
		const error = arr.shift() == '1'

		const timestamp = parseInt(arr.pop())
		const date = timestampToHuman(timestamp)
		if (error) {
			return {
				error: 'reading failed',
				timestamp,
				date
			}
		}

		arr = arr.map((str) => parseInt(str))

		let obj
		try {
			obj = translator.intsToObj(arr)
		} catch (err) {
			return {
				error: 'cannot parse',
				deserialized: arr
			}
		}

		return {
			deserialized: arr,
			translated: obj,
			timestamp,
			date: timestampToHuman(timestamp)
		}
	}

	let timeout
	async function add(loop = true, interval = 5 * 60 * 1000) {
		if (timeout) clearTimeout(timeout)

		let read = await i2c.read()
		read = serializeReading(read)
		await fs.appendFile(savePath, read)

		if (loop) timeout = setTimeout(() => { add(true, interval) }, interval)
	}

	async function getReadings() {
		let readings = await fs.readFile(savePath)
		readings = readings.toString()
		readings = readings.split('\n')
		readings = readings.filter((string) => string.length > 1)

		readings = readings.map(parseReading)
		readings = readings.filter((reading) => reading.error === undefined)

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
