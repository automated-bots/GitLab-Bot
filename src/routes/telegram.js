const express = require('express')
const router = express.Router()

// We are receiving updates at the route below
router.post(`/bot${TelegramSecretHash}`, (req, res) => {
  console.log('Process update: ' + JSON.stringify(req.body))
  req.app.get('telegram_bot').processUpdate(req.body)
  res.sendStatus(200)
})

module.exports = router
