const stamp = 1575240607224
const date = new Date(stamp)
const y = date.getFullYear()
const m = date.getMonth()
const d = date.getDay()
console.log(((new Date(stamp).toString()).replace(/\ GMT.*$/, '')))
console.log(((new Date(y, m, d + 1).toString()).replace(/\ GMT.*$/, '')))
