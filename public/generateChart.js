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
					return `${val}${unit} - ${date}`
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
					minRotation: 45
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
					fontSize: 14
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
					fontSize: 14
				}

			}]
		}
	}
}
function timestampToHuman(timestamp) {
	return ((new Date(timestamp)).toString()).replace(/\ GMT.*$/, '')
}

let scatterChart
window.onload = function () {
	Chart.defaults.global.defaultFontColor = 'white'
	let ctx = document.getElementById('canvas')
	ctx.style.backgroundColor = 'rgb(32, 30, 30)'

	scatterChart = new Chart(ctx, cfg)
};

function updateData({ temps, hums }) {
	console.log('temps:', temps)
	console.log('hums', hums)
	cfg.data.datasets[0].data = temps
	cfg.data.datasets[1].data = hums
	scatterChart.update();
}
