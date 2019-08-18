process.env['NTBA_FIX_319'] = 1
process.env['NTBA_FIX_350'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const LBRYNET_HOST = 'localhost'
const LBRYNET_PORT = 5279
const botUrl = 'https://lbry.melroy.org'
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
bot.setWebHook(`${botUrl}/bot${TELEGRAM_TOKEN}`)

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
/fileinfo <uri> - Get meta file content
`
  bot.sendMessage(chatId, helpText)
})

// status command
bot.onText(/\/status/, msg => {
  const chatId = msg.chat.id

  lbry.getLbryNetStatus()
    .then(result => {
      if (result) {
        // const textMsg = JSON.stringify(result)
        const textMsg = `
Lbrynet deamon running: ${result.is_running}
Connection: ${result.connection_status.code}`
        bot.sendMessage(chatId, textMsg)
      }
    })
    .catch(error => {
      console.error(error)
      bot.sendMessage(chatId, 'Error: Can\'t connect to Lbrynet server!')
    })
})

bot.onText(/^\/fileinfo\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /fileinfo <uri>')
})

// fileinfo command (/fileinfo <uri>)
bot.onText(/\/fileinfo@?\S* (.+)/, (msg, match) => {
  const uri = match[1]
  lbry.getMetaFileData(uri)
    .then(result => {
      const chatId = msg.chat.id
      const title = result.metadata.title
      const thumbnail = result.metadata.thumbnail.url
      const fileSize = parseFloat(result.metadata.source.size / Math.pow(1024, 2)).toFixed(2) // To Megabyte
      const uriWithoutProtocol = uri.replace(/(^\w+:|^)\/\//, '')
      const publicURL = 'https://beta.lbry.tv/' + uriWithoutProtocol
      const textMsg = `
Title: ${title}
Channel name: ${result.channel_name}
Media Type: ${result.metadata.source.media_type}
Size: ${fileSize} MB
Watch Online: ${publicURL}`
      bot.sendMessage(chatId, textMsg)
      if (thumbnail) { bot.sendPhoto(chatId, thumbnail, { caption: 'Thumbnail: ' + title }) }
    })
    .catch(error => {
      console.error(error)
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
