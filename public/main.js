const socket = io()
socket.emit('reqReadings')
socket.on('resReadings', updateData)

function showVars(read) {
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
}

socket.emit('reqRead')
socket.on('resRead', showVars)

function writeArduino() {
	const varName = document.getElementById('select').value
	const int = parseInt(document.getElementById('int').value)

	socket.emit('reqWrite', { varName, int })
}

socket.on('resWrite', async (out) => {
	document.getElementById('console').innerText += `$ ${JSON.stringify(out, null, 1)}\n`
	showVars(out)
})