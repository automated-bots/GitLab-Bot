// NTBA = node-telegram-bot-api fixes
process.env['NTBA_FIX_319'] = 1
process.env['NTBA_FIX_350'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const botUrl = 'https://gitlabbot.melroy.org'
const port = process.env.PORT || 3005

const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const routes = require('./routes')

/*
if (!TELEGRAM_TOKEN) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}

const telegramBot = new TelegramBot(TELEGRAM_TOKEN)
// This informs the Telegram servers of the new webhook.
telegramBot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`)
*/
// Create the Express app
const app = express()
// Globally available
//app.set('telegram_bot', telegramBot)
app.use(express.json());

// Set routes
app.use('/', routes)

// Start server
app.listen(port, () => {
  console.log(`LBRY Bot service is listening on ${port}`)
})
