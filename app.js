process.env['NTBA_FIX_319'] = 1
process.env['NTBA_FIX_350'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const LBRYNET_HOST = 'localhost'
const LBRYNET_PORT = 5279
const LBRYCRD_HOST = 'localhost'
const LBRYCRD_PORT = 9245
const RPC_USER = 'lbry'
const RPC_PASS = 'xyz'
const botUrl = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const LBRY = require('./lbry')

const lbry = new LBRY(LBRYNET_HOST, LBRYNET_PORT,
  LBRYCRD_HOST, LBRYCRD_PORT, RPC_USER, RPC_PASS)

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
/networkinfo - Get LBRY Network info
/blockchaininfo - Get LBRY Blockchain info
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

bot.onText(/\/networkinfo/, msg => {
  lbry.getNetworkInfo()
    .then(result => {
      const chatId = msg.chat.id
      var text = `
Protocol version: ${result.protocolversion}
Connections: ${result.connections}
P2P active: ${result.networkactive}
Minimum relay fee:  ${result.relayfee} LBC/kB
Minimum incremental fee: ${result.incrementalfee} LBC/kB
Networks:`
      const networks = result.networks
      var i
      for (i = 0; i < networks.length; i++) {
        text += `
    Name: ${networks[i].name}
    Only net: ${networks[i].limited}
    Reachable: ${networks[i].reachable}
    -----------------------`
      }
      bot.sendMessage(chatId, text)
    })
    .catch(error => {
      console.error(error)
    })
})

bot.onText(/\/blockchaininfo/, msg => {
  lbry.getBlockChainInfo()
    .then(result => {
      const chatId = msg.chat.id
      const text = `
Difficulty: ${result.difficulty}
Bestblockhash: ${result.bestblockhash}
Median time current best block: ${result.mediantime}`
      bot.sendMessage(chatId, text)
    })
    .catch(error => {
      console.error(error)
    })
})

// Balance command (/balance <address>)
bot.onText(/\/balance@?\S* (.+)/, (msg, match) => {
  const address = match[1]
  lbry.getAddressInfo(address)
    .then(result => {
      const chatId = msg.chat.id
      const text = `
Balance: ${result.balance}}`
      bot.sendMessage(chatId, text)
    })
    .catch(error => {
      console.error(error)
    })
})

// Other stuff
bot.on('message', msg => {
  if (msg.text) {
    if (msg.text.toString().toLowerCase().includes('hello')) {
      const name = msg.from.first_name
      bot.sendMessage(msg.chat.id, 'Welcome ' + name + '!')
    } else if (msg.text.toString().toLowerCase().includes('bye')) {
      const name = msg.from.first_name
      bot.sendMessage(msg.chat.id, 'Hope to see you around again, <b>Bye ' + name + '</b>!', { parse_mode: 'HTML' })
    }
  }
})
