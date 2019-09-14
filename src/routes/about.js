const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.json({ version: '1.0', name: 'LBRY Bot', devs: [{ name: 'Melroy van den Berg', email: 'melroy@melroy.org' }] })
})

module.exports = app
