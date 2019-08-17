const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN'
const url = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
// const axios = require('axios') // Promise bassed HTTP client (eg. for sending post reqs)
const bodyParser = require('body-parser')

// No need to pass any parameters as we will handle the updates with Express
// TODO: Only create a TelegramBot object, when bot server is enabled for serving Telegram requests
const bot = new TelegramBot(TOKEN)

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`)

const app = express()

// parse the updates to JSON
app.use(bodyParser.json())

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`)
})

// Just to ping!
bot.on('message', msg => {
  bot.sendMessage(msg.chat.id, 'I am alive!')
})
