process.env['NTBA_FIX_319'] = 1
process.env['NTBA_FIX_350'] = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const COINMARKETCAP_API_TOKEN = process.env.COINMARKETCAP_API_TOKEN
const LBRYNET_HOST = 'localhost'
const LBRYNET_PORT = 5279
const LBRYCRD_HOST = 'localhost'
const LBRYCRD_PORT = 9245
const RPC_USER = 'lbry'
const RPC_PASS = 'xyz'
const botUrl = 'https://lbry.melroy.org'
const port = process.env.PORT || 3005
const LBC_PRICE_FRACTION_DIGITS = 5
const DOLLAR_PRICE_FRACTION_DIGITS = 8

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const bodyParser = require('body-parser')
const LBRY = require('./lbry')

const lbry = new LBRY(LBRYNET_HOST, LBRYNET_PORT,
  LBRYCRD_HOST, LBRYCRD_PORT, RPC_USER, RPC_PASS,
  COINMARKETCAP_API_TOKEN)

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
bot.onText(/[/|!]help/, msg => {
  const chatId = msg.chat.id
  const helpText = `
/help - Return this help output
/status - Retrieve Lbrynet, Lbrycrd, Chainquery status
/file <uri> - Get meta file content
/networkinfo - Get LBRY Network info
/stats - Get blockchain, mining and exchange stats
/price - Get market (price) info
/address <address> - Get address info
/transactions <address> - Get transactions from a specific address
`
  bot.sendMessage(chatId, helpText)
})

// Give FAQ Link
bot.onText(/^[/|!]faq\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Visit: https://lbry.com/faq')
})

// Why is LBRY created?
bot.onText(/^[/|!]why\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'TODO!')
})

// What is LBRY?
bot.onText(/^[/|!]what\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'TODO!')
})

// Since when does LBRY exists (age)
bot.onText(/^[/|!]when\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'TODO!')
})

// status command (detailed status report)
bot.onText(/[/|!]status/, msg => {
  const chatId = msg.chat.id
  let text = ''
  lbry.getLbryNetStatus()
    .then(result => {
      text += `*General*
Lbrynet daemon running: ${result.is_running}
Lbrynet connection: ${result.connection_status.code}`
    })
    .catch(error => {
      console.error(error)
      text += 'Error: Could not fetch peer info!\n'
    })
    .then(function () {
      // always executed
      lbry.getNetworkInfo()
        .then(networkResult => {
          text += `
Lbrycrd version: ${networkResult.subversion}
Protocol version: ${networkResult.protocolversion}
\n*Peer info*
Peers connected: ${networkResult.connections}`
        })
        .catch(error => {
          console.error(error)
          text += 'Error: Could not fetch network info!\n'
        })
        .then(function () {
          // always executed
          lbry.getPeerInfo()
            .then(peerResult => {
              text += '\nFirst peer details:'
              if (peerResult.length > 0) {
                const sendTime = new Date(peerResult[0].lastsend * 1000)
                const recieveTime = new Date(peerResult[0].lastrecv * 1000)
                const ping = parseFloat(peerResult[0].pingtime * 1000).toFixed(2)
                text += `
      Ping: ${ping} ms
      Last send: ${sendTime}
      Last receive: ${recieveTime}`
              } else {
                text += 'Warning: No peers connected...'
              }
            })
            .catch(error => {
              console.error(error)
              text += 'Error: Could not fetch peer info!\n'
            })
            .then(function () {
              // always executed
              lbry.getWalletInfo()
                .then(walletResult => {
                  const oldestKeyTime = new Date(walletResult.keypoololdest * 1000)
                  text += `
\n*Wallet info*
Oldest address in keypool: ${oldestKeyTime}
# of reserved addresses: ${walletResult.keypoolsize}`
                })
                .catch(error => {
                  console.error(error)
                  text += 'Error: Could not fetch wallet info!\n'
                })
                .then(function () {
                  // always executed, finally we send the info back!
                  bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
                })
            })
        })
    })
})

bot.onText(/^[/|!]file\S*$/, msg => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /fileinfo <uri>')
})

// fileinfo command (/file <uri>)
bot.onText(/[/|!]file@?\S* (.+)/, (msg, match) => {
  const uri = match[1].trim()
  lbry.getMetaFileData(uri)
    .then(result => {
      const chatId = msg.chat.id
      const title = result.metadata.title
      let duration = 'N/A'
      if (result.metadata.video.duration) {
        const durationMin = Math.floor(parseFloat(result.metadata.video.duration) / 60)
        const durationSec = (((parseFloat(result.metadata.video.duration) / 60) % 2) * 60).toFixed(0)
        duration = `${durationMin}m ${durationSec}s`
      }
      const thumbnail = result.metadata.thumbnail.url
      const fileSize = parseFloat(result.metadata.source.size / Math.pow(1024, 2)).toFixed(2) // To Megabyte
      const uriWithoutProtocol = uri.replace(/(^\w+:|^)\/\//, '')
      const publicURL = 'https://beta.lbry.tv/' + uriWithoutProtocol
      const textMsg = `
*Title:* ${title}
*Channel name:* ${result.channel_name}
*Media Type:* ${result.metadata.source.media_type}
*Duration:* ${duration}
*Size:* ${fileSize} MB
[Watch Online!](${publicURL})
[Watch via LBRY App](https://open.lbry.com/${uriWithoutProtocol})`
      bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
      if (thumbnail) { bot.sendPhoto(chatId, thumbnail, { caption: 'Thumbnail: ' + title }) }
    })
    .catch(error => {
      console.error(error)
    })
})

bot.onText(/[/|!]networkinfo/, msg => {
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

bot.onText(/[/|!]stats/, msg => {
  const chatId = msg.chat.id
  lbry.getBlockChainInfo()
    .then(result => {
      lbry.getMiningInfo()
        .then(miningResult => {
          const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
          lbry.getExchangeInfo()
            .then(exchangeResult => {
              const medianTime = new Date(result.mediantime * 1000)
              const marketCap = exchangeResult.market_cap.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const difficulty = result.difficulty.toLocaleString('en', { maximumFractionDigits: 3 })
              const difficulty24h = exchangeResult.difficulty24.toLocaleString('en', { maximumFractionDigits: 3 })
              const difficulty3d = exchangeResult.difficulty3.toLocaleString('en', { maximumFractionDigits: 3 })
              const difficulty7d = exchangeResult.difficulty7.toLocaleString('en', { maximumFractionDigits: 3 })
              const blockTimeMin = Math.floor(parseFloat(exchangeResult.block_time) / 60)
              const blockTimeSec = (((parseFloat(exchangeResult.block_time) / 60) % 2) * 60).toFixed(0)
              const exchangeRate = parseFloat(exchangeResult.exchange_rate).toFixed(10)
              const exchangeRate24h = parseFloat(exchangeResult.exchange_rate24).toFixed(10)
              const exchangeRate3d = parseFloat(exchangeResult.exchange_rate3).toFixed(10)
              const exchangeRate7d = parseFloat(exchangeResult.exchange_rate7).toFixed(10)
              const text = `*General*
Last block: ${medianTime}
Median time current best block: ${result.mediantime}
Hash best block: ${result.bestblockhash}
Net Hashrate: ${hashrateth} Thash/s
Mempool size: ${miningResult.pooledtx}
Market capital: ${marketCap}

*Difficulty*
Difficulty: ${difficulty}
Difficulty 24 hours avg: ${difficulty24h}
Difficulty 3 days avg: ${difficulty3d}
Difficulty 7 days avg: ${difficulty7d}

*Reward*
Block time: ${blockTimeMin}m ${blockTimeSec}s
Block reward: ${exchangeResult.block_reward} LBC
Block reward 24 hours avg: ${exchangeResult.block_reward24} LBC
Block reward 3 days avg: ${exchangeResult.block_reward3} LBC

*Exchange*
Exchange rate: ${exchangeRate} BTC-LTC
Exchange rate 24 hours avg: ${exchangeRate24h} BTC-LTC
Exchange rate 3 days avg: ${exchangeRate3d} BTC-LTC
Exchange rate 7 days avg: ${exchangeRate7d} BTC-LTC`
              bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
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
bot.onText(/[/|!]address@?\S* (.+)/, (msg, match) => {
  const address = match[1].trim()
  lbry.getAddressInfo(address)
    .then(result => {
      const chatId = msg.chat.id
      if (result.length > 0) {
        const balance = parseFloat(result[0].balance).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
        const text = `
*Created at:* ${result[0].created_at}
*Modified at:* ${result[0].modified_at}
*Balance:* ${balance} LBC
[View online](https://explorer.lbry.com/address/${address})`
        bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
      } else {
        bot.sendMessage(chatId, 'Address is not (yet) used.')
      }
    })
    .catch(error => {
      console.error(error)
    })
})

// transactions command (/transactions <address>)
bot.onText(/[/|!]transactions@?\S* (.+)/, (msg, match) => {
  const address = match[1].trim()
  const chatId = msg.chat.id
  lbry.getAddressInfo(address)
    .then(result => {
      if (result.length > 0) {
        lbry.getTransactions(result[0].id)
          .then(list => {
            let text = '*Last 10 transactions*'
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                let amount = ''
                if (list[i].credit_amount !== '0.00000000') {
                  amount = parseFloat(list[i].credit_amount).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
                } else {
                  amount = '-' + parseFloat(list[i].debit_amount).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
                }
                text += `
    Hash: ${list[i].hash}
    Amount: ${amount} LBC
    Timestamp: ${list[i].created_time}
    [View transaction](https://explorer.lbry.com/tx/${list[i].hash}?address=${address}#${address})
    -----------------------------`
              }
              bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
            } else {
              bot.sendMessage(chatId, 'No transactions found (yet)')
            }
          })
          .catch(error => {
            console.error(error)
          })
      } else {
        bot.sendMessage(chatId, 'Address not found')
      }
    })
    .catch(error => {
      console.error(error)
    })
})

// price command (/price)
bot.onText(/[/|!]price@?\S*/, msg => {
  lbry.getLatestPrices()
    .then(result => {
      const chatId = msg.chat.id
      const quote = result.quote.USD
      const maxSupply = result.max_supply.toLocaleString('en')
      const totalSupply = result.total_supply.toLocaleString('en')
      const circulating = result.circulating_supply.toLocaleString('en', { maximumFractionDigits: 0 })
      const price = quote.price.toLocaleString('en', { maximumFractionDigits: DOLLAR_PRICE_FRACTION_DIGITS })
      const volume24h = parseFloat(quote.volume_24h).toLocaleString('en', { maximumFractionDigits: 5 })
      const volume7d = parseFloat(quote.volume_7d).toLocaleString('en', { maximumFractionDigits: 5 })
      const volume30d = parseFloat(quote.volume_30d).toLocaleString('en', { maximumFractionDigits: 5 })
      const marketCap = parseFloat(quote.market_cap).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const text = `*General*
Rank: #${result.cmc_rank}
Max. available coins: ${maxSupply} LBCs
Current amount coins: ${totalSupply} LBCs
Number of coins circulating: ${circulating} LBCs

*Price*
Price: $${price}/LBC
Volume 24 hour avg: ${volume24h} LBC
Volume 7 days avg: ${volume7d} LBC
Volume 30 days avg: ${volume30d} LBC
Market capital: $${marketCap}

*% Change*
Last hour: ${quote.percent_change_1h}%
Last 24 hours: ${quote.percent_change_24h}%
Last 7 days: ${quote.percent_change_7d}%
`
      bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
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
    } else if (msg.text.toString().toLowerCase().includes('hello')) {
      bot.sendMessage(msg.chat.id, 'Welcome ' + name + '!')
    } else if (msg.text.toString().toLowerCase().includes('bye')) {
      bot.sendMessage(msg.chat.id, 'Hope to see you around again, *Bye ' + name + '*!', { parse_mode: 'markdown' })
    }
  }
})
