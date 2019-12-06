const schedule = require('node-schedule')

module.exports = async (i2c) => {
	const on = schedule.scheduleJob('* * 4 * * *', async () => {
		await i2c.write('lampOn', 1)
		await i2c.write('heaterOn', 1)
	})

	const off = schedule.scheduleJob('* * 22 * * *', async () => {
		await i2c.write('lampOn', 0)
		await i2c.write('heaterOn', 0)
	})

	let d = new Date()
	let hour = d.getHours() - 1 + (d.getMinutes() * 1.6667e-2) + (d.getSeconds() * 1.6667e-3)
	let write = (hour >= 4 && hour <= 22) ? 1 : 0
	await i2c.write('lampOn', write)
	await i2c.write('heaterOn', write)

	return { on, off }
}