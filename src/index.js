// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const botUrl = process.env.URL || 'https://gitlabbot.melroy.org'
const port = process.env.PORT || 3005

const createError = require('http-errors')
const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const indexRouter = require('./routes/index')
const telegramRouter = require('./routes/telegram')
const gitlabRouter = require('./routes/gitlab')

/*
if (!TELEGRAM_TOKEN) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}

const bot = new TelegramBot(TELEGRAM_TOKEN)
// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`)

*/
// Create the Express app
const app = express()
// Globally available
// app.set('telegram_bot', bot)
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
app.listen(port, () => {
  console.log(`GitLab-Telegram Bot service is listening on ${port}`)
})
