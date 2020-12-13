let cfg = {
	type: 'scatter',
	data: {
		datasets: [{
			unit: 'C',
			label: 'Temperature C',
			pointBackgroundColor: 'rgb(255, 99, 132)',
			data: [],
			yAxisID: 'temp',
			backgroundColor: 'rgb(255, 99, 132)'
		},
		{
			unit: '%',
			label: 'Humidity %',
			pointBackgroundColor: 'rgb(54, 162, 235)',
			data: [],
			yAxisID: 'hum',
			backgroundColor: 'rgb(54, 162, 235)'
		}]
	},
	options: {
		tooltips: {
			callbacks: {
				label: function (item, data, values) {
					const val = item.yLabel
					const unit = cfg.data.datasets[item.datasetIndex].unit
					const date = timestampToHuman(item.xLabel)
					return `${val}${unit} - ${date} - ${getTimeAgo(item.xLabel)}`
				}
			}
		},
		scales: {
			xAxes: [{
				type: 'linear',
				position: 'bottom',
				ticks: {
					type: 'linear',
					position: 'bottom',
					userCallback: (label, index, labels) => {
						return timestampToHuman(label)
					},
					maxRotation: 45,
					minRotation: 45,
					stepSize: 24 * 60 * 60 * 1000
				},
				gridLines: {
					// display: false,
					color: 'rgba(255,255,255, 0.15)'
				}
			}],
			yAxes: [{
				id: 'hum',
				type: 'linear',
				gridLines: {
					display: false,
					zeroLineColor: "rgba(0,0,0,0)",
					color: 'rgba(255,255,255, 0.15)'
				},
				position: 'left',
				ticks: {
					fontColor: "rgb(54, 162, 235)",
					fontSize: 14,
					min: 0,
					max: 100
				}
			},
			{
				id: 'temp',
				type: 'linear',
				gridLines: {
					display: false,
					zeroLineColor: "rgba(0,0,0,0)",
					color: 'rgba(255,255,255, 0.15)'
				},
				position: 'right',
				ticks: {
					fontColor: "rgb(255, 99, 132)",
					fontSize: 14,
					min: 0,
					max: 50
				}

			}]
		}
	}
}

function setFirstDay() {
	let dataSets = []
	for (const dataset of cfg.data.datasets) {
		let firstReading = dataset.data.sort((a, b) => a.x - b.x)
		firstReading = firstReading[0]
		dataSets.push(firstReading)
	}
	let veryFirstReading = dataSets.sort((a, b) => a.x - b.x)

	const date = new Date(veryFirstReading[0].x)
	const y = date.getFullYear()
	const m = date.getMonth()
	const d = date.getDay()
	const dayStart = (new Date(y, m, d + 1)).getTime()

	console.log(timestampToHuman(veryFirstReading[0].x))
	console.log(timestampToHuman(dayStart))
	cfg.options.scales.xAxes[0].min = dayStart
}

function getTimeAgo(msIn) {
	msIn = Date.now() - msIn
	let d = Math.floor(msIn / 86400000)
	msIn = msIn % 86400000
	let hr = Math.floor(msIn / 3600000)
	msIn = msIn % 3600000
	let min = Math.floor(msIn / 60000)
	msIn = msIn % 60000
	let s = Math.floor(msIn / 1000)
	msIn = msIn % 1000

	// d =  String(d).padStart(2, '0')
	hr = String(hr).padStart(2, '0')
	min = String(min).padStart(2, '0')
	s = String(s).padStart(2, '0')
	// msIn = String(msIn).padStart(3, '0')
	return `${d} days, ${hr}:${min}:${s} ago`
}

function timestampToHuman(timestamp) {
	return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
}

let scatterChart
window.onload = () => {
	Chart.defaults.global.defaultFontColor = 'white'
	let ctx = document.getElementById('canvas')
	ctx.style.backgroundColor = 'rgb(32, 30, 30)'

	scatterChart = new Chart(ctx, cfg)
}

function updateData({ temps, hums }) {
	console.log('temps:', temps)
	console.log('hums', hums)
	cfg.data.datasets[0].data = temps
	cfg.data.datasets[1].data = hums
	// setFirstDay()
	scatterChart.update()
}
