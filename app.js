// NTBA = node-telegram-bot-api fixes
process.env['NTBA_FIX_319'] = 1
process.env['NTBA_FIX_350'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
// const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const COINMARKETCAP_API_TOKEN = process.env.COINMARKETCAP_API_TOKEN
const LBRYNET_HOST = 'localhost'
const LBRYNET_PORT = process.env.LBRYNET_PORT || 5279
const LBRYCRD_HOST = 'localhost'
const LBRYCRD_PORT = process.env.LBRYCRD_PORT || 9245
const LBRYCRD_RPC_USER = 'lbry'
const LBRYCRD_RPC_PASS = process.env.RPC_PASSWORD || 'xyz'
const botUrl = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005

const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const LBRY = require('./src/lbry')
const Exchange = require('./src/exchange')
const Telegram = require('./src/telegram')
const routes = require('./routes')

if (!TELEGRAM_TOKEN) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}

// Create helper objects
const lbry = new LBRY(LBRYNET_HOST, LBRYNET_PORT,
  LBRYCRD_HOST, LBRYCRD_PORT, LBRYCRD_RPC_USER, LBRYCRD_RPC_PASS)
const exchange = new Exchange(COINMARKETCAP_API_TOKEN)

// TODO: Only create a TelegramBot object, when bot server is enabled for serving Telegram requests

const telegramBot = new TelegramBot(TELEGRAM_TOKEN)
// This informs the Telegram servers of the new webhook.
telegramBot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`)

const tel = new Telegram(telegramBot, lbry, exchange)

// Create the Express app
const app = express()
app.set('telegram_bot', telegramBot)
// parse the updates to JSON
app.use(bodyParser.json())

// Set routes
app.use('/', routes)

// Set Telegram commands
tel.setCommands()

// Start server
app.listen(port, () => {
  console.log(`LBRY Bot service is listening on ${port}`)
})
