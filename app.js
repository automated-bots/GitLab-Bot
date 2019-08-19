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
bot.onText(/[\/|!]help/, msg => {
  const chatId = msg.chat.id
  const helpText = `
/help - Return this help output
/status - Retrieve Lbrynet status
/file <uri> - Get meta file content
/networkinfo - Get LBRY Network info
/stats - Get blockchain, mining and exchange stats
/address <address> - Get address info
/transactions <address> - Get transactions from a specific address
`
  bot.sendMessage(chatId, helpText)
})

// status command
bot.onText(/[\/|!]status/, msg => {
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

bot.onText(/^[\/|!]file\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /fileinfo <uri>')
})

// fileinfo command (/file <uri>)
bot.onText(/[\/|!]file@?\S* (.+)/, (msg, match) => {
  const uri = match[1].trim()
  lbry.getMetaFileData(uri)
    .then(result => {
      const chatId = msg.chat.id
      const title = result.metadata.title
      let duration = 'N/A'
      if(result.metadata.video.duration) {
        const duration_mins = Math.floor(parseFloat(result.metadata.video.duration)/60)
        const duration_secs = (((parseFloat(result.metadata.video.duration)/60) % 2) * 60).toFixed(0)
        duration = `${duration_mins}m ${duration_secs}s`
      }
      const thumbnail = result.metadata.thumbnail.url
      const fileSize = parseFloat(result.metadata.source.size / Math.pow(1024, 2)).toFixed(2) // To Megabyte
      const uriWithoutProtocol = uri.replace(/(^\w+:|^)\/\//, '')
      const publicURL = 'https://beta.lbry.tv/' + uriWithoutProtocol
      const textMsg = `
Title: ${title}
Channel name: ${result.channel_name}
Media Type: ${result.metadata.source.media_type}
Duration: ${duration}
Size: ${fileSize} MB
Watch Online: ${publicURL}`
      bot.sendMessage(chatId, textMsg)
      if (thumbnail) { bot.sendPhoto(chatId, thumbnail, { caption: 'Thumbnail: ' + title }) }
    })
    .catch(error => {
      console.error(error)
    })
})

bot.onText(/[\/|!]networkinfo/, msg => {
  lbry.getNetworkInfo()
    .then(result => {
      const chatId = msg.chat.id
      var text = `
LBRY server version: ${result.version}
Protocol version: ${result.protocolversion}
Connections: ${result.connections}
P2P active: ${result.networkactive}
Minimum relay fee:  ${result.relayfee} LBC/kB
Minimum incremental fee: ${result.incrementalfee} LBC/kB
Networks:`
      const networks = result.networks
      for (let i = 0; i < networks.length; i++) {
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

bot.onText(/[\/|!]stats/, msg => {
  const chatId = msg.chat.id
  lbry.getBlockChainInfo()
    .then(result => {
      lbry.getMiningInfo()
      .then(mining_result => {
        const hashrateth = (parseFloat(mining_result.networkhashps)/1000.0/1000.0/1000.0/1000.0).toFixed(2)
        lbry.getExchangeInfo()
        .then(exchange_result => {
          const block_time_mins = Math.floor(parseFloat(exchange_result.block_time)/60)
          const block_time_secs = (((parseFloat(exchange_result.block_time)/60) % 2) * 60).toFixed(0)
          const exchange_rate24 = parseFloat(exchange_result.exchange_rate24).toFixed(10)
          const text = `
Last block: ${result.blocks}
Median time current best block: ${result.mediantime}
Hash best block: ${result.bestblockhash}
Hashrate: ${hashrateth} Thash/s
Mempool size: ${mining_result.pooledtx}
Difficulty: ${result.difficulty}
Difficulty 24 hours avg: ${exchange_result.difficulty24}
--------------------------------------------------------------------
Block time: ${block_time_mins}m ${block_time_secs}s
Block reward: ${exchange_result.block_reward} LBC
Block reward 24 hours avg: ${exchange_result.block_reward24} LBC
Exchange rate: ${exchange_result.exchange_rate} BTC-LTC
Exchange rate 24 hours avg: ${exchange_rate24} BTC-LTC
Market cap: ${exchange_result.market_cap}
          `
          bot.sendMessage(chatId, text)
        })
        .catch(error => {
          console.error(error)
        })  
      })
      .catch(error => {
        console.error(error)
      })      
    })
    .catch(error => {
      console.error(error)
    })
})

// address command (/address <address>)
bot.onText(/[\/|!]address@?\S* (.+)/, (msg, match) => {
  const address = match[1].trim()
  lbry.getAddressInfo(address)
    .then(result => {
      const chatId = msg.chat.id
      if (result.length > 0) {
        const balance = parseFloat(result[0].balance).toFixed(8)
        const text = `
Created at: ${result[0].created_at}
Modified at: ${result[0].modified_at}
Balance: ${balance} LBC`
        bot.sendMessage(chatId, text)
      }
      else
      {
        bot.sendMessage(chatId, 'Address is not (yet) used.')
      }
    })
    .catch(error => {
      console.error(error)
    })
})

// transactions command (/transactions <address>)
bot.onText(/[\/|!]transactions@?\S* (.+)/, (msg, match) => {
  const address = match[1].trim()
  lbry.getAddressInfo(address)
    .then(result => {
      if(result.length > 0)
      {
        lbry.getTransactions(result[0].id)
          .then(list => {
            const chatId = msg.chat.id
            let text = 'Last 15 transactions:\n'
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                let amount = ''
                if (list[i].credit_amount !== '0.00000000') {
                  amount = parseFloat(list[i].credit_amount).toFixed(8)
                } else {
                  amount = '-' + parseFloat(list[i].debit_amount).toFixed(8)
                }
                text += `
    Hash: ${list[i].hash}
    Amount: ${amount} LBC
    Timestamp: ${list[i].created_time}
    Transaction link: https://explorer.lbry.com/tx/${list[i].hash}?address=${address}#${address}
    ----------------------`
              }
              bot.sendMessage(chatId, text)
            } else {
              bot.sendMessage(chatId, 'No transactions found (yet)')
            }
          })
          .catch(error => {
            console.error(error)
          })
      }
      else
      {
        bot.sendMessage(chatId, 'Address not found')
      }
    })
    .catch(error => {
      console.error(error)
    })
})

// Other stuff
bot.on('message', msg => {
  if (msg.text) {
    const name = msg.from.first_name
    if (msg.text.toString() === '!' || msg.text.toString() === '/') {
      bot.sendMessage(msg.chat.id, 'Please use /help or !help to get more info.')
    }
    else if (msg.text.toString().toLowerCase().includes('hello')) {
      bot.sendMessage(msg.chat.id, 'Welcome ' + name + '!')
    }
    else if (msg.text.toString().toLowerCase().includes('bye')) {
      bot.sendMessage(msg.chat.id, 'Hope to see you around again, <b>Bye ' + name + '</b>!', { parse_mode: 'HTML' })
    }
  }
})
