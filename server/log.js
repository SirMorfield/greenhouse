const fs = require('fs').promises
const i2c = require('./i2c.js')
const path = require('path')
const savePath = path.join(__dirname, 'log.csv')

async function add(loop = true, interval = 5 * 60 * 1000) {
	const bytes = await i2c.read()
	const date = (new Date()).toLocaleString('en-GB', { hour12: false })
	let toWrite = {
		date,
		success: bytes.success,
		temp: bytes.success ? bytes.translated.temp : 0,
		hum: bytes.success ? bytes.translated.hum : 0,
	}
	toWrite = JSON.stringify(toWrite) + '\n'

	await fs.appendFile(savePath, toWrite)
	if (loop) {
		await new Promise((resolve) => setTimeout(resolve, interval))
		add()
	}
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
			hums: []
		}
		for (const reading of readings) {
			newReadings.dates.push(reading.date)
			newReadings.temps.push(reading.temp)
			newReadings.hums.push(reading.hum)
		}
		return newReadings
	}

	return readings
}

module.exports = {
	add,
	getReadings
}
