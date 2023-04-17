const express = require('express')
const router = express.Router()
const telegramRoute = require('./telegram')
const gitlabRoute = require('./gitlab')

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the GitLab Webhooks to Telegram bot' })
})
  .use('/gitlab', gitlabRoute)
  .use('/telegram', telegramRoute)

router.get('/health', (req, res) => {
  const errorCode = (global.ErrorState) ? 500 : 200
  const result = (global.ErrorState) ? 'NOK' : 'OK'
  res.status(errorCode).json({ result: result })
})

module.exports = router
