var lineChartData = {
	labels: [],
	datasets: [{
		label: 'Temperature C',
		borderColor: window.chartColors.red,
		backgroundColor: window.chartColors.red,
		fill: false,
		data: [],
		yAxisID: 'y-axis-1',
	}, {
		label: 'Humidity %',
		borderColor: window.chartColors.blue,
		backgroundColor: window.chartColors.blue,
		fill: false,
		data: [],
		yAxisID: 'y-axis-2',
	}]
};

window.onload = function () {
	// var ctx = document.getElementById('canvas').getContext('2d');
	Chart.defaults.global.defaultFontColor = 'white'
	var ctx = document.getElementById('canvas')

	ctx.style.backgroundColor = 'rgb(32, 30, 30)'

	window.myLine = Chart.Line(ctx, {
		data: lineChartData,
		options: {
			responsive: true,
			hoverMode: 'index',
			stacked: false,
			title: {
				display: true,
				text: 'Sensors',
			},
			scales: {
				yAxes: [{
					type: 'linear',
					display: true,
					position: 'left',
					id: 'y-axis-1',
					gridLines: {
						// display: false,
						color: "rgba(255,255,255,0.3)"
					},
				}, {
					type: 'linear',
					display: true,
					position: 'right',
					id: 'y-axis-2',

					gridLines: {
						drawOnChartArea: false,
					},
				}],
				xAxes: [{
					ticks: {
						autoSkip: false,
						maxRotation: 45,
						minRotation: 45
					}
				}]

			}
		}
	});
};

function updateData({ dates, temps, hums }) {
	lineChartData.labels = dates
	lineChartData.datasets[0].data = temps
	lineChartData.datasets[1].data = hums
	window.myLine.update();
}
