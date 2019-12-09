const socket = io()
socket.on('readings', updateData)

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
