const express = require('express')
const router = express.Router()
const app = express()

// We are receiving updates at the route below
router.post(`/bot${TelegramSecretHash}`, (req, res) => {
  app.get('telegram_bot').processUpdate(req.body)
  res.sendStatus(200)
})

module.exports = router
