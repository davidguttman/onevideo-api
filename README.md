# onevideo-api #

A simple module for accessing ONE by AOL: Video report data.

## Example ##

```js
var ov = require('onevideo-api')

var creds = {
  "username": "xxx",
  "password": "yyy"
}

var date = '2015-10-10'

ov(creds, date, function (err, rows) {
  if (err) return console.error(err)

  console.log('revenue data', rows)
})

```

# License #

MIT
