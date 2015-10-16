var ov = require('../')

var creds = require('./creds.json')

var date = '2015-10-14'

ov(creds, date, function (err, rows) {
  if (err) return console.error(err)
  console.log('rows', rows)
})
