var a = [5, 5, 5, 2, 2, 2, 2, 2, 9, 4].reduce((acc, curr) => {
	acc[curr] ? acc[curr]++ : acc[curr] = 1
	return acc;
}, {})

// var a = [5, 5, 5, 2, 2, 2, 2, 2, 9, 4].reduce((acc, curr) => acc[curr] ? acc[curr]++ : acc[curr] = 1, {});

console.log(a)