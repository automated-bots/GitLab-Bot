const LBC_PRICE_FRACTION_DIGITS = 5
const DOLLAR_PRICE_FRACTION_DIGITS = 8

const FAQ_URL = 'https://lbry.com/faq'
const LBRY_TV_URL = 'https://beta.lbry.tv'
const OPEN_URL = 'https://open.lbry.com'
const COINMARKET_URL = 'https://coinmarketcap.com/currencies/library-credit'
const EXPLORER_URL = 'https://explorer.lbry.com'

class Telegram {
  constructor (bot, lbry) {
    this.bot = bot
    this.lbry = lbry
  }

  /**
   * Telegram commands
   */
  setCommands () {
    // help command - show available commands
    this.bot.onText(/[/|!]help/, msg => {
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
/block <hash> - Get block info
/lastblocks - Get the last 10 blocks
/top5 - Get top 5 biggest transactions, get top 10 highest amount channels

/why - Why LBRY?
/what - What is LBRY?
/how - How does LBRY work?
/age - How long does LBRY exists?
/faq - Frequality Asked Questions`
      this.bot.sendMessage(chatId, helpText)
    })

    // Give FAQ Link
    this.bot.onText(/^[/|!]faq\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, '[Read FAQ](' + FAQ_URL + ')', { parse_mode: 'markdown' })
    })

    // Why is LBRY created?
    this.bot.onText(/^[/|!]why\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, `
LBRY is created to have an open-source and decentralized place to store videos, images, e-books, games or any other content!
LBRY makes use of the blockchain technology to store the meta data, and use peer-to-peer network to retrieve the actual content.

The content creator can upload the content free to watch or add a certain LBC amount in order to view the content (although most of the content on LBRY is free to watch).
Alternatively, you can tip the content creator with any LBC amount you like.

Basically LBRY is an alternative for YouTube, Vimeo and others, but free, open-source, decentralized and run by the community.`)
    })

    // What is LBRY?
    this.bot.onText(/^[/|!]what\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'LBRY is a decentralized digital content platform, so anyone can share and view the content (for free or for payment). An alternative to YouTube but not limited to videos only, and fully open-source and decentralized!')
    })

    // How does LBRY work?
    this.bot.onText(/^[/|!]how\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, `
Foundation is the LBRY protocol by using blockchain technology. LBRY extended the Bitcoin proof-of-work concept and added address name that points to the metadata.
Such an address can be put in a LBRY URL: eg. lbry://mycustomname.
To make the blockchain more useful extra technolgies like ChainQuery was introduced to search through the blockchain in a much faster and advanced way.

Also there are wallet servers running so the clients can use a so-called SPV wallet client, without the need of downloading the full blockhchain.

When new content is uploaded to LBRY, the data is encryped, hashed and distributed in pieces through the network to other hosts.
Distributed Hash Table (DHT) is used as an effective way of creating such a distributed network, similar to the BitTorrent protocol.

Last but not least, desktop clients/module apps, websites and more can use the LBRY protocol/SDK in order to actually use LBRY. The main application is the LBRY Desktop app:
https://github.com/lbryio/lbry-desktop/releases`)
    })

    // Age, since when does LBRY exists (first block)
    // Source: https://explorer.lbry.com/blocks/1
    this.bot.onText(/^[/|!]age\S*$/, msg => {
      const chatId = msg.chat.id
      const age = Date.now() - 1466646592000 // timestamp ms since creation after genesis block
      let seconds = Math.floor(age / 1000)
      let minutes = Math.floor(seconds / 60)
      seconds = seconds % 60
      let hours = Math.floor(minutes / 60)
      minutes = minutes % 60
      let days = Math.floor(hours / 24)
      hours = hours % 24
      let months = Math.floor(days / 30)
      days = days % 30
      const years = Math.floor(months / 12)
      months = months % 12
      this.bot.sendMessage(chatId, `LBRY age: ${years} years, ${months} months, ${days} days, ${hours}h ${minutes}m ${seconds}s, since the first mined block exist.`)
    })

    // status command (detailed status report)
    this.bot.onText(/[/|!]status/, msg => {
      const lbry = this.lbry
      const bot = this.bot
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
          text += 'Error: Could not LBRYnet (SDK) info!\n'
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

    this.bot.onText(/^[/|!]file\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /file <uri>')
    })

    // fileinfo command (/file <uri>)
    this.bot.onText(/[/|!]file@?\S* (.+)/, (msg, match) => {
      const uri = match[1].trim()
      this.lbry.getMetaFileData(uri)
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
          const publicURL = LBRY_TV_URL + '/' + uriWithoutProtocol
          const textMsg = `
*Title:* ${title}
*Channel name:* ${result.channel_name}
*Media Type:* ${result.metadata.source.media_type}
*Duration:* ${duration}
*Size:* ${fileSize} MB
[Watch Online!](${publicURL})
[Watch via LBRY App](${OPEN_URL}/${uriWithoutProtocol})`
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
          if (thumbnail) { this.bot.sendPhoto(chatId, thumbnail, { caption: 'Thumbnail: ' + title }) }
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/[/|!]networkinfo/, msg => {
      const chatId = msg.chat.id
      this.lbry.getNetworkInfo()
        .then(result => {
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
          this.bot.sendMessage(chatId, text)
        })
        .catch(error => {
          console.error(error)
          this.bot.sendMessage(chatId, 'Could not fetch network info, still verifying blocks....')
        })
    })

    this.bot.onText(/[/|!]stats/, msg => {
      const chatId = msg.chat.id
      this.lbry.getBlockChainInfo()
        .then(result => {
          this.lbry.getMiningInfo()
            .then(miningResult => {
              const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
              this.lbry.getExchangeInfo()
                .then(exchangeResult => {
                  const medianTime = new Date(result.mediantime * 1000)
                  const marketCap = exchangeResult.market_cap.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  const difficulty = parseFloat(result.difficulty).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty24h = parseFloat(exchangeResult.difficulty24).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty3d = parseFloat(exchangeResult.difficulty3).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty7d = parseFloat(exchangeResult.difficulty7).toLocaleString('en', { maximumFractionDigits: 3 })
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
                  this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
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

    // price command (/price)
    this.bot.onText(/[/|!]price@?\S*/, msg => {
      this.lbry.getLatestPrices()
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
Rank on CoinMarketCap: [#${result.cmc_rank}](${COINMARKET_URL})
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
Last 7 days: ${quote.percent_change_7d}%`
          this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // address command (/address <address>)
    this.bot.onText(/[/|!]address@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.lbry.getAddressInfo(address)
        .then(result => {
          const chatId = msg.chat.id
          if (result.length > 0) {
            const balance = parseFloat(result[0].balance).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
            const text = `
*Created at:* ${result[0].created_at}
*Modified at:* ${result[0].modified_at}
*Balance:* ${balance} LBC
[View online](${EXPLORER_URL}/explorer/${address})`
            this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
          } else {
            this.bot.sendMessage(chatId, 'Address is not (yet) used.')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    // transactions command (/transactions <address>)
    this.bot.onText(/[/|!]transactions@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      const chatId = msg.chat.id
      this.lbry.getAddressInfo(address)
        .then(result => {
          if (result.length > 0) {
            this.lbry.getTransactions(result[0].id)
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
    [View transaction](${EXPLORER_URL}/tx/${list[i].hash}?address=${address}#${address})
    -----------------------------`
                  }
                  this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
                } else {
                  this.bot.sendMessage(chatId, 'No transactions found (yet)')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Address not found')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    // block command (/block <hash>)
    this.bot.onText(/[/|!]block@?\S* (.+)/, (msg, match) => {
      const hash = match[1].trim()
      const chatId = msg.chat.id
      this.lbry.getBlockInfo(hash)
        .then(result => {
          if (result.length > 0) {
            const blockTime = new Date(result[0].block_time * 1000)
            const difficulty = parseFloat(result[0].difficulty).toLocaleString('en', { maximumFractionDigits: 2 })
            const textMsg = `
*Height:* ${result[0].height}
*Confirmations:* ${result[0].confirmations}
*Size:* ${result[0].block_size} bytes
*Bits:* ${result[0].bits}
*Nonce:* ${result[0].nonce}
*Block Time:* ${blockTime}
*Version:* ${result[0].version}
*Difficulty:* ${difficulty}
*Chainwork:* ${result[0].chainwork}
*MerkleRoot:* ${result[0].merkle_root}
[View Block](${EXPLORER_URL}/blocks/${result[0].height})`
            this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
          } else {
            this.bot.sendMessage(chatId, 'Block not found')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    // lastblocks command (/lastblocks)
    this.bot.onText(/[/|!]lastblocks/, msg => {
      const chatId = msg.chat.id
      this.lbry.getLastBlocks()
        .then(result => {
          let textMsg = '*Last 10 blocks*'
          for (let i = 0; i < result.length; i++) {
            const blockTime = new Date(result[i].block_time * 1000)
            const difficulty = parseFloat(result[i].difficulty).toLocaleString('en', { maximumFractionDigits: 3 })
            textMsg += `
    *Height:* ${result[i].height}
    *Time:* ${blockTime}
    *Size:* ${result[i].block_size} bytes
    *Confirmations:* ${result[i].confirmations}
    *Difficulty:* ${difficulty}
    [View Block](${EXPLORER_URL}/blocks/${result[i].height})
    ------------------------------------------`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // top5 command (/top5)
    this.bot.onText(/[/|!]top5/, msg => {
      const chatId = msg.chat.id
      this.lbry.getBiggestTransactions()
        .then(result => {
          let textMsg = '*Biggest 4 transactions of this year*'
          for (let i = 0; i < result.length; i++) {
            const amount = parseFloat(result[i].value).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })            
            textMsg += `
    *Value:* ${amount} LBC
    *Input count:* ${result[i].output_count}
    *Output count:* ${result[i].output_count}
    *Created at:* ${result[i].created_time}
    *Height:* ${result[i].height}
    [View Transaction](${EXPLORER_URL}/tx/${result[i].hash})
    ------------------------------------------`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // Other stuff
    this.bot.on('message', msg => {
      if (msg.text) {
        const name = msg.from.first_name
        if (msg.text.toString() === '!' || msg.text.toString() === '/') {
          this.bot.sendMessage(msg.chat.id, 'Please use /help or !help to get more info.')
        } else if (msg.text.toString().toLowerCase().includes('hello')) {
          this.bot.sendMessage(msg.chat.id, 'Welcome ' + name + '!')
        } else if (msg.text.toString().toLowerCase().includes('bye')) {
          this.bot.sendMessage(msg.chat.id, 'Hope to see you around again, *Bye ' + name + '*!', { parse_mode: 'markdown' })
        }
      }
    })
  }
}

module.exports = Telegram
