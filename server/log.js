const fs = require('fs').promises
const i2c = require('./i2c.js')
const path = require('path')

async function add() {
	const bytes = await i2c.read()
	const date = (new Date()).toLocaleString('en-GB', { hour12: false })
	let toWrite = [date, bytes.success]

	if (bytes.success) {
		toWrite.push(bytes.translated.temp)
		toWrite.push(bytes.translated.hum)
	}
	toWrite = toWrite.map((value) => `"${value}"`)

	toWrite = toWrite.join(',') + '\n'
	await fs.appendFile(path.join(__dirname, 'log.csv'), toWrite);
	await new Promise((resolve) => setTimeout(resolve, 5 * 1000))
	add()
}
add()