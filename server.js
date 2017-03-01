var express    = require('express')
var logger     = require('morgan')

var app = express()
app.use(logger('dev'))
app.use(require('./controllers'))

var server = app.listen(3000, function () {
  console.log('Server successfully started at port %d', server.address().port)
})