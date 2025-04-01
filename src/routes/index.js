import express from 'express'
import telegramRoute from './telegram.js'
import gitlabRoute from './gitlab.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the GitLab Webhooks to Telegram bot' })
})
  .use('/gitlab', gitlabRoute)
  .use('/telegram', telegramRoute)

router.get('/health', (req, res) => {
  const errorCode = (global.ErrorState) ? 500 : 200
  const result = (global.ErrorState) ? 'NOK' : 'OK'
  res.status(errorCode).json({ result })
})

export default router
