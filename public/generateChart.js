let cfg = {
	type: 'scatter',
	data: {
		datasets: [{
			label: 'Temperature C',
			pointBackgroundColor: 'rgb(255, 99, 132)',
			data: [],
		},
		{
			label: 'Humidity %',
			pointBackgroundColor: 'rgb(54, 162, 235)',
			data: [],
		}]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'linear',
				position: 'bottom',
				ticks: {
					type: 'linear',
					position: 'bottom',
					maxRotation: 45,
					minRotation: 45
				},
				gridLines: {
					display: false,
				}
			}],
			yAxes: [{
				gridLines: {
					// display: false,
					color: 'rgba(255,255,255, 0.15)'
				}
			}]
		}
	}
}

let scatterChart
window.onload = function () {
	Chart.defaults.global.defaultFontColor = 'white'
	let ctx = document.getElementById('canvas')
	ctx.style.backgroundColor = 'rgb(32, 30, 30)'

	scatterChart = new Chart(ctx, cfg)
};

function updateData({ temps, hums }) {
	lineChartData.labels = dates
	cfg.data.datasets[0].data = temps
	cfg.data.datasets[1].data = hums
	scatterChart.update();
}
