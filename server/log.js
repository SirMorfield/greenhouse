const fs = require('fs').promises
const path = require('path')
const savePath = path.join(__dirname, 'log.txt')
const translator = require('./translator.js')

function timestampToHuman(timestamp) {
	return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
}

async function saveReading(reading) {
	if (reading.error) return
	reading.bytes.push(Date.now())
	let str = `${reading.bytes}\n`

	await fs.appendFile(savePath, str)
}

async function getReadings() {
	let readings = await fs.readFile(savePath)
	readings = readings.toString()
	readings = readings.split('\n')
	readings = readings.filter((string) => string.length >= 13)

	readings = readings.map((reading) => {
		reading = reading.split(',')
		reading = reading.map(parseFloat)

		const timestamp = reading.pop()
		return {
			timestamp,
			date: timestampToHuman(timestamp),
			...translator.translate(reading)
		}
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

	formated.hums = formated.hums.sort((a, b) => a.y - b.y)
	formated.temps = formated.temps.sort((a, b) => a.y - b.y)

	return formated
}

module.exports = {
	saveReading,
	getReadings,
	getReadingsFrontend,
}
