module.exports = async (i2c) => {
	const schedule = require('node-schedule')

	let on
	let off

	async function init(lamp) {
		if (on) on.cancel()
		if (off) off.cancel()

		on = schedule.scheduleJob(lamp.lampOn.cron, async () => {
			await i2c.write('lampOn', 1)
		})

		off = schedule.scheduleJob(lamp.lampO.cron, async () => {
			await i2c.write('lampOn', 0)
		})

		let d = new Date()
		let hour = d.getHours() + (d.getMinutes() * 0.016667) + (d.getSeconds() * 0.0016667)
		let write = (hour >= lamp.lampOn.hour && hour <= lampOff.hour) ? 1 : 0
		await i2c.write('lampOn', write)
	}

	return init
}