const express = require('express');
const router = express.Router();

// We are receiving updates at the route below
app.post(`/bot${TelegramSecretHash}`, (req, res) => {
    app.get('telegram_bot').processUpdate(req.body)
    res.sendStatus(200)
  })

module.exports = router;