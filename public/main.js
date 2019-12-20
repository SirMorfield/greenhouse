const socket = io()
socket.emit('reqReadings')
socket.on('resReadings', updateData)

socket.emit('reqRead')
socket.on('resRead', (read) => {
	if (read.error) {
		document.getElementById('error').innerText = read.error
		document.getElementById('vars').innerHTML = ''
		return
	}

	let k = '<tbody>'
	for (const varName of Object.keys(read.translated)) {
		k += '<tr>'
		k += `<td>${varName}</td>`
		k += `<td>${read.translated[varName]}</td>`
		k += '</tr>'
	}
	k += '</tbody>'

	document.getElementById('vars').innerHTML = k
})

function writeArduino() {
	const varName = document.getElementById('select')
	const int = document.getElementById('int')

	socket.emit('reqWrite', { varName, int })
}

socket.on('resWrite', async (out) => {
	document.getElementById('console').innerText += `$ ${JSON.stringify(out, null, 4)}\n`
})