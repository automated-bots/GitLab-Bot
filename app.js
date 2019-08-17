process.env['NTBA_FIX_319'] = 1
const TOKEN = process.env.TELEGRAM_TOKEN
const url = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
// const axios = require('axios') // Promise bassed HTTP client (eg. for sending post reqs)
const bodyParser = require('body-parser')

// No need to pass any parameters as we will handle the updates with Express
// TODO: Only create a TelegramBot object, when bot server is enabled for serving Telegram requests
if (TOKEN === undefined) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}
const bot = new TelegramBot(TOKEN)

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`)

// Create the Express app
const app = express()

// parse the updates to JSON
app.use(bodyParser.json())

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start server
app.listen(port, () => {
  console.log(`LBRY Bot service is listening on ${port}`)
})

//// Telegram bot commands ////

// status command
bot.onText(/\/status/, msg => {
  const chatId = msg.chat.id;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, "latest status!");
});

// echo command (/echo [whatever])
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Other stuff
bot.on('message', msg => {
  if (msg.text.toString().toLowerCase().includes("bye")) {
    bot.sendMessage(msg.chat.id, "Hope to see you around again, Bye!")
  }
})
