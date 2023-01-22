require('dotenv').config()
// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const botUrl = process.env.URL || 'https://gitlabbot.melroy.org'
const chatId = process.env.TELEGRAM_CHAT_ID || '@libreweb'
const port = process.env.PORT || 3013
const isTelegramEnabled = process.env.TELEGRAM_ENABLED || 'true'

const createError = require('http-errors')
const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const routes = require('./routes')
global.ErrorState = false

// Create the Express app
const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

if (isTelegramEnabled === 'true') {
  if (!TELEGRAM_TOKEN) {
    console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
    process.exit(1)
  } else {
    console.log('INFO: Telegram bot will be enabled.')
  }
  const bot = new TelegramBot(TELEGRAM_TOKEN)
  bot.on('error', (error) => {
    console.error(error)
    global.ErrorState = true
  })
  // This informs the Telegram servers of the new webhook.
  bot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`).catch((error) => {
    console.error(error)
    global.ErrorState = true
  })
  app.set('telegram_bot', bot)
  app.set('chat_id', chatId)
}

app.use('/', routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((error, req, res, next) => {
  // Only print errors in development
  if (req.app.get('env') === 'development') {
    console.error(error)
  }
  // Render the error page
  res.status(error.status || 500).json()
})

// Start server
app.listen(port, () => {
  console.log(`INFO: GitLab-Telegram Bot service is now listening at http://localhost:${port}`)
})
