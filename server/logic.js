module.exports = (i2c) => {
	const schedule = require('node-schedule')
	const log = require('./log.js')

	async function defaultArduinoVars(arduinoVars) {
		for (const varName in arduinoVars) {
			await i2c.write(varName, arduinoVars[varName])
		}
	}

	let lampSchedule = {}
	async function lamp(lampOn, lampOff) {

		if (lampSchedule.on) lampSchedule.on.cancel()
		if (lampSchedule.off) lampSchedule.off.cancel()

		lampSchedule.on = schedule.scheduleJob(lampOn, async () => {
			await i2c.write('lampOn', 1)
		})

		lampSchedule.off = schedule.scheduleJob(lampOff, async () => {
			await i2c.write('lampOn', 0)
		})

		const d = new Date()
		const intoDay = d.getSeconds() + (60 * (d.getMinutes() + (60 * d.getHours())))
		const goOn = 60 * (lampOn.minute + (60 * lampOn.hour))
		const goOff = 60 * (lampOff.minute + (60 * lampOff.hour))

		let write = (intoDay >= goOn && intoDay <= goOff) ? 1 : 0
		await i2c.write('lampOn', write)
	}

	let temperatureTimeout
	async function temperature({ target, interval, margin }) {
		if (temperatureTimeout) clearTimeout(temperatureTimeout)

		const read = await i2c.read()
		if (read.error) throw read.error

		if (read.translated.temp > target + margin) {
			await i2c.write('fanInOn', 1)
			await i2c.write('fanOutOn', 1)
			await i2c.write('heaterOn', 0)

		} else if (read.translated.temp + margin < target) {
			await i2c.write('fanInOn', 0)
			await i2c.write('fanOutOn', 0)
			await i2c.write('heaterOn', 1)
		} else {
			await i2c.write('fanInOn', 0)
			await i2c.write('fanOutOn', 0)
			await i2c.write('heaterOn', 0)
		}

		if (interval && interval > 0) {
			temperatureTimeout = setTimeout(() => {
				temperature(target, interval)
			}, interval)
		}
	}

	let humidityTimeout
	async function humidity({ target, interval, margin }) {
		if (humidityTimeout) clearTimeout(humidityTimeout)

		const read = await i2c.read()
		if (read.error) throw read.error

		const newVal = target > read.translated.hum + margin ? 1 : 0
		await i2c.write('dehumidifierOn', newVal)

		if (interval && interval > 0) {
			humidityTimeout = setTimeout(() => {
				humidity(target, interval)
			}, interval)
		}
	}

	let logTimeout
	async function saveReading(interval) {
		if (logTimeout) clearTimeout(logTimeout)

		const read = await i2c.read()
		if (read.error) throw read.error

		await log.saveReading(read)

		if (interval && interval > 0) {
			logTimeout = setTimeout(() => saveReading(interval), interval)
		}
	}

	return {
		defaultArduinoVars,
		lamp,
		temperature,
		humidity,
		saveReading
	}
}