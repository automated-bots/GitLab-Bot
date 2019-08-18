process.env['NTBA_FIX_319'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const LBRYNET_HOST = "localhost"
const LBRYNET_PORT = 5279
const bot_url = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const LBRY = require('./lbry')

const lbry = new LBRY(LBRYNET_HOST, LBRYNET_PORT)

// No need to pass any parameters as we will handle the updates with Express
// TODO: Only create a TelegramBot object, when bot server is enabled for serving Telegram requests
if (TELEGRAM_TOKEN === undefined) {
  console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN enviroment variable first! See README.md.\nExit.\x1b[0m')
  process.exit(1)
}
const bot = new TelegramBot(TELEGRAM_TOKEN)

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${bot_url}/bot${TELEGRAM_TOKEN}`)

// Create the Express app
const app = express()

// parse the updates to JSON
app.use(bodyParser.json())

// We are receiving updates at the route below!
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start server
app.listen(port, () => {
  console.log(`LBRY Bot service is listening on ${port}`)
})

/// / Telegram bot commands ////

// help command - show available commands
bot.onText(/\/help/, msg => {
  const chatId = msg.chat.id
  const helpText = `
/help - Return this help output
/status - Retrieve Lbrynet status
/amount <account_id> - Get your wallet balance by providing your account ID as argument
/myaddress <account_id> <address> - Check if given adddress belongs to you
`
  bot.sendMessage(chatId, helpText)
})

// status command
bot.onText(/\/status/, msg => {
  lbry.status()
  .then(result => {
    if(result)
    {
      const chatId = msg.chat.id
      // const textMsg = JSON.stringify(result)
      const textMsg = `
Lbrynet deamon running: ${result.is_running}
Connection: ${result.connection_status.code}`
      bot.sendMessage(chatId, textMsg)
    }
  })
  .catch(error => {
    console.log(error)
  })
})

// bad-weather amount command (only /amount or /amount@bot_name without parameters)
bot.onText(/^\/amount\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Error: Provide atleast your account ID as argument: /amount <account_id>")
})

// amount command (/amount <account_id>)
// TODO: "\@?\S*" should only match /amount or /amount@bot_name and *NOT* match /amountblabla for example
bot.onText(/\/amount\@?\S* (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const account_id = match[1]
  lbry.amount(account_id)
  .then(result => {
    if(result)
    {
      const chatId = msg.chat.id
      const available = parseFloat(result.available).toFixed(4)
      const total = parseFloat(result.total).toFixed(4)
      const textMsg = `
Available amount: ${available} LBC
Total amount (incl. reserved): ${total} LBC`
      bot.sendMessage(chatId, textMsg)
    }
    else
    {
      bot.sendMessage(chatId, "Account ID not found, provide a valid account ID. Try again.")
    }
  })
  .catch(error => {
    console.log(error)
  })
})

// bad-weather myadress command (only /myadress or /myadress@bot_name without parameters)
bot.onText(/^\/myaddress\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Error: Provide atleast the following two parameters: /myaddress <account_id> <address>")
})

// myadress command (/myaddress <account_id> <address>)
bot.onText(/\/myaddress\@?\S* (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const account_id = match[1]
  const address = match[2]
  lbry.myaddress(account_id, address)
  .then(result => {
    const chatId = msg.chat.id
    if(result)
    {
      bot.sendMessage(chatId, "Address is yours!")
    }
    else
    {
      bot.sendMessage(chatId, "Nope, this address belongs not to you")
    }
  })
  .catch(error => {
    console.log(error)
  })
})

// Other stuff (requires 'Disable' privacy in Telegram bot by botfather when bot is in group)
bot.on('message', msg => {
  if (msg.text) {
    if (msg.text.toString().toLowerCase().includes('bye')) {
      const name = msg.from.first_name
      bot.sendMessage(msg.chat.id, 'Hope to see you around again, <b>Bye ' + name + '</b>!', { parse_mode: 'HTML' })
    }
  }
})
