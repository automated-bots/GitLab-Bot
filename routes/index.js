const express = require('express')
const app = express()
const aboutRoute = require('./about')
const telegramRoute = require('./telegram')

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LBRY bot' })
})
  .use('/about', aboutRoute)
  .use('/telegram', telegramRoute)

module.exports = app
