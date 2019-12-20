const fs = require('fs').promises
const path = require('path')
const savePath = path.join(__dirname, 'log.txt')
const translator = require('./translator.js')

function timestampToHuman(timestamp) {
	return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
}

function serializeReading(read) {
	if (read.error) return `1,${read.error},${Date.now()}\n`
	return `0,${read.vars},${Date.now()}\n`
}

async function saveReading(reading) {
	reading = serializeReading(reading)
	await fs.appendFile(savePath, reading)
}

function parseReading(string) {
	let vars = string.split(',')

	const timestamp = parseInt(vars.pop())
	const date = timestampToHuman(timestamp)

	const error = vars.shift() == '1'
	// if (error) {
	// 	return {
	// 		error,
	// 		timestamp,
	// 		date
	// 	}
	// }

	vars = vars.map((str) => parseInt(str))

	let obj
	try {
		obj = translator.intsToObj(vars)
	} catch (err) {
		return {
			error: err,
			date,
			timestamp,
			vars
		}
	}

	return {
		date: timestampToHuman(timestamp),
		timestamp,
		vars,
		translated: obj
	}
}

async function getReadings() {
	let readings = await fs.readFile(savePath)
	readings = readings.toString()
	readings = readings.split('\n')
	readings = readings.filter((string) => string.length > 1)

	readings = readings.map(parseReading)
	// readings = readings.filter((reading) => reading.error === undefined)

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
	getReadings,
	getReadingsFrontend,
	serializeReading,
	saveReading
}
