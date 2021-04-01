// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const botUrl = process.env.URL || 'https://gitlabbot.melroy.org'
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3013
const isTelegramEnabled = process.env.TELEGRAM_ENABLED || 'true'

const createError = require('http-errors')
const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const indexRouter = require('./routes/index')
const telegramRouter = require('./routes/telegram')
const gitlabRouter = require('./routes/gitlab')

// Create the Express app
const app = express()

if (isTelegramEnabled === 'true') {
  if (!TELEGRAM_TOKEN) {
    console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
    process.exit(1)
  } else {
    console.log('Info: Telegram bot will be enabled.')
  }
  const bot = new TelegramBot(TELEGRAM_TOKEN)
  // This informs the Telegram servers of the new webhook.
  bot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`)
  app.set('telegram_bot', bot)
  /* bot.getChat('@LibreWeb', function (msg) {
    console.log(msg)
  }) */
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', indexRouter)
app.use('/telegram', telegramRouter)
app.use('/gitlab', gitlabRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// Start server
app.listen(port, host, () => {
  console.log(`GitLab-Telegram Bot service is listening on ${port}`)
})
