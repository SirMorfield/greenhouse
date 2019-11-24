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