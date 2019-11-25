const schedule = require('node-schedule')

module.exports = async () => {
	const on = schedule.scheduleJob('* * 4 * * *', async () => {
		await i2c.write('lampOn', 1)
		await i2c.write('heaterOn', 1)
	})

	const off = schedule.scheduleJob('* * 22 * * *', async () => {
		await i2c.write('lampOn', 0)
		await i2c.write('heaterOn', 0)
	})

	let d = new Date()
	let hour = d.getHours() + (d.getMinutes() * 0.016667) + (d.getSeconds() * 0.0016667)
	let write = (hour >= 4 && hour <= 22) ? 1 : 0
	await i2c.write('lampOn', write)
	await i2c.write('heaterOn', write)

	return { on, off }
}