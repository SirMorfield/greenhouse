// const EventEmitter = require('events');

// class Reader extends EventEmitter { }
// const reader = new Reader();




// async function log() {
// 	return await new Promise((resolve) => {
// 		reader.on('newRead', i => {
// 			resolve(i)
// 		})
// 	})

// }

// setTimeout(() => {

// 	reader.emit('newRead', 43);
// }, 1000);

function log() {
	for (let i = 0; i < 100; i++) {
		if (i == 4) {
			return i
		}
	}
}
console.log(log())

let res = {
	"success": true,
	"bytes": [0, 0, 0, 0, 0, 0, 19, 79, 0, 0, 0],
	"translated": {
		"dehumidifierOn": 0,
		"lampOn": 0,
		"heaterOn": 0,
		"fanInPWM": 0,
		"fanOutPWM": 0,
		"ledPWM": 0,
		"temp": 19,
		"hum": 79,
		"fanInOn": 0,
		"fanOutOn": 0,
		"ledOn": 0
	},
	"date": "11/25/2019, 00:18:00",
	"timestamp": 1574641080899
}
