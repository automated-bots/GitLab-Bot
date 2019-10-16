const Misc = require('./miscellaneous')

// Constants
const LBC_PRICE_FRACTION_DIGITS = 5
const DOLLAR_PRICE_FRACTION_DIGITS = 8
const FAQ_URL = 'https://lbry.com/faq'
const LBRY_TV_URL = 'https://beta.lbry.tv'
const OPEN_URL = 'https://open.lbry.com'
const COINMARKET_URL = 'https://coinmarketcap.com/currencies/library-credit'
const EXPLORER_URL = 'https://explorer.lbry.com'

class Telegram {
  constructor (bot, lbry, exchange) {
    this.bot = bot
    this.lbry = lbry
    this.exchange = exchange
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
/networkinfo - Get LBRY Network info
/stats - Get blockchain, mining and exchange stats
/price - Get market (price) info

/lastcontent - Get the last uploaded content
/lastchannels - Get the last created channels
/lastblocks - Get the last 10 blocks
/top10 - Top 10 biggest transactions & top 10 most subscribed channels

/file <uri> - Get meta file content
/tips <name> - Get the top 10 tips of given name (channel or content)
/contenttips <content URI> - Get the top 10 tips of given content URI
/transaction <hash> - Get transaction info
/address <address> - Get address info
/transactions <address> - Get last 10 transactions from an address
/block <hash or block height> - Get block info

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
      const age = Misc.timestampToDate(Date.now() - 1466646592000) // timestamp ms since creation after genesis block
      this.bot.sendMessage(chatId, `LBRY age: ${age.year} years, ${age.month} months, ${age.day} days, ${age.hour}h ${age.minute}m ${age.second}s, since the first mined block.`)
    })

    // status command (detailed status report)
    this.bot.onText(/[/|!]status/, msg => {
      const lbry = this.lbry
      const bot = this.bot
      const chatId = msg.chat.id
      let text = ''
      lbry.getLbryNetStatus()
        .then(result => {
          text += `*General* 🖥
Lbrynet Daemon Running: ${result.is_running}
Lbrynet Connection status: ${result.connection_status.code}
Lbrynet Block Headers status: ${result.result.startup_status.blockchain_headers}
Lbrynet DHT status: ${result.result.startup_status.dht}
Lbrynet Hash Announcer Status: ${result.result.startup_status.hash_announcer}
Lbrynet P2P server status: ${result.result.startup_status.peer_protocol_server}
Lbrynet DB status: ${result.result.startup_status.database}`
        })
        .catch(error => {
          console.error(error)
          text += 'Error: Could not retrieve LBRYnet (SDK) status!\n'
        })
        .then(function () {
          // always executed
          lbry.getLbryNetVersion()
            .then(lbryNetVersion => {
              text += `
Lbrynet version: ${lbryNetVersion}`
            })
            .catch(error => {
              console.error(error)
              text += 'Error: Could not retrieve LBRYnet version!\n'
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
                        const sendTime = Misc.printDate(new Date(peerResult[0].lastsend * 1000))
                        const recieveTime = Misc.printDate(new Date(peerResult[0].lastrecv * 1000))
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
                          const oldestKeyTime = Misc.printDate(new Date(walletResult.keypoololdest * 1000))
                          text += `
\n*Wallet info* 👛
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
    })

    this.bot.onText(/^[/|!]file\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /file <uri>')
    })

    // file command (/file <uri>)
    this.bot.onText(/[/|!]file@?\S* (.+)/, (msg, match) => {
      const uri = match[1].trim()
      this.lbry.getMetaFileData(uri)
        .then(result => {
          // Retrieve the channel name as well
          this.lbry.getChannelNameString(result.channel_claim_id)
            .then(channelResult => {
              const chatId = msg.chat.id
              const title = result.metadata.title
              const channelName = channelResult[0].name
              let duration = ''
              if (result.metadata.video) {
                const durationMin = Math.floor(parseFloat(result.metadata.video.duration) / 60)
                const durationSec = (((parseFloat(result.metadata.video.duration) / 60) % 2) * 60).toFixed(0)
                duration = `\n*Duration:* ${durationMin}m ${durationSec}s`
              }
              const fileSize = parseFloat(result.metadata.source.size / Math.pow(1024, 2)).toFixed(2) // To Megabyte
              const uriWithoutProtocol = uri.replace(/(^\w+:|^)\/\//, '')
              const publicURL = LBRY_TV_URL + '/' + uriWithoutProtocol
              const textMsg = `
*Title:* ${title}
*Channel name:* [${channelName}](${OPEN_URL}/${channelName})
*Media Type:* ${result.metadata.source.media_type}${duration}
*Size:* ${fileSize} MB
[Watch Online!](${publicURL})
[Watch via LBRY App](${OPEN_URL}/${uriWithoutProtocol})`
              this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
              // Disable thumbnail: if (thumbnail) { this.bot.sendPhoto(chatId, result.metadata.thumbnail.url, { caption: 'Thumbnail: ' + title }) }
            })
            .catch(error => {
              console.error(error)
            })
            .catch(error => {
              console.error(error)
            })
        })
    })

    this.bot.onText(/[/|!]networkinfo/, msg => {
      const chatId = msg.chat.id
      this.lbry.getNetworkInfo()
        .then(result => {
          var text = `
*Network* ℹ️
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
          this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
          this.bot.sendMessage(chatId, 'Could not fetch network info, still verifying blocks... Or can\'t connect to core deamon API.')
        })
    })

    this.bot.onText(/[/|!]stats/, msg => {
      const chatId = msg.chat.id
      this.lbry.getBlockChainInfo()
        .then(result => {
          this.lbry.getMiningInfo()
            .then(miningResult => {
              const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
              this.exchange.getExchangeInfo()
                .then(exchangeResult => {
                  const medianTime = Misc.printDate(new Date(result.mediantime * 1000))
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
                  const text = `*General* 🖥
Last block: ${medianTime}
Median time current best block: ${result.mediantime}
Hash best block: ${result.bestblockhash}
Net Hashrate: ${hashrateth} Thash/s
Mempool size: ${miningResult.pooledtx}
Market capital: ${marketCap}

*Difficulty* 🤯
Difficulty: ${difficulty}
Difficulty 24 hours avg: ${difficulty24h}
Difficulty 3 days avg: ${difficulty3d}
Difficulty 7 days avg: ${difficulty7d}

*Reward* 🤑
Block time: ${blockTimeMin}m ${blockTimeSec}s
Block reward: ${exchangeResult.block_reward} LBC
Block reward 24 hours avg: ${exchangeResult.block_reward24} LBC
Block reward 3 days avg: ${exchangeResult.block_reward3} LBC

*Exchange* 💱
Exchange rate: ${exchangeRate} BTC-LBC
Exchange rate 24 hours avg: ${exchangeRate24h} BTC-LBC
Exchange rate 3 days avg: ${exchangeRate3d} BTC-LBC
Exchange rate 7 days avg: ${exchangeRate7d} BTC-LBC`
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
      this.exchange.getLatestPrices()
        .then(result => {
          this.exchange.getExchangeInfo()
            .then(exchangeResult => {
              const chatId = msg.chat.id
              const bitcoinPrice = parseFloat(exchangeResult.exchange_rate).toFixed(10)
              const bitcoinPriceDateTime = Misc.printDate(new Date(exchangeResult.timestamp * 1000))
              const quote = result.quote.USD
              const maxSupply = result.max_supply.toLocaleString('en')
              const totalSupply = result.total_supply.toLocaleString('en')
              const circulating = result.circulating_supply.toLocaleString('en', { maximumFractionDigits: 0 })
              const dollarPrice = quote.price.toLocaleString('en', { maximumFractionDigits: DOLLAR_PRICE_FRACTION_DIGITS })
              const dollarPriceLastUpdated = quote.last_updated
              const volume24h = parseFloat(quote.volume_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const volume7d = parseFloat(quote.volume_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const volume30d = parseFloat(quote.volume_30d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const marketCap = parseFloat(quote.market_cap).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const hourChangeIcon = (Math.sign(quote.percent_change_1h) === 1) ? '👍' : '👎'
              const hour24ChangeIcon = (Math.sign(quote.percent_change_24h) === 1) ? '👍' : '👎'
              const days7ChangeIcon = (Math.sign(quote.percent_change_7d) === 1) ? '👍' : '👎'
              const text = `*General* 📈
Rank on CoinMarketCap: [#${result.cmc_rank}](${COINMARKET_URL})
Max. available coins: ${maxSupply} LBCs
Current amount coins: ${totalSupply} LBCs
Number of coins circulating: ${circulating} LBCs

*Price* 💸
Price: $${dollarPrice}/LBC
Last updated dollar: ${dollarPriceLastUpdated}
Price: 1 LBC = ${bitcoinPrice} BTC 
Last updated BTC: ${bitcoinPriceDateTime}
Volume 24 hour avg: $${volume24h}
Volume 7 days avg: $${volume7d}
Volume 30 days avg: $${volume30d}
Market capital: $${marketCap}

*% Change*
Last hour: ${quote.percent_change_1h}% ${hourChangeIcon}
Last 24 hours: ${quote.percent_change_24h}% ${hour24ChangeIcon}
Last 7 days: ${quote.percent_change_7d}% ${days7ChangeIcon}`
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

    // address command (/address <address>)
    this.bot.onText(/[/|!]address@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.lbry.getAddressInfo(address)
        .then(result => {
          const chatId = msg.chat.id
          if (result.length > 0) {
            const currentAddress = result[0]
            const balance = parseFloat(currentAddress.balance).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
            const text = `
*Created at:* ${currentAddress.created_at}
*Modified at:* ${currentAddress.modified_at}
*Balance:* ${balance} LBC
[View online](${EXPLORER_URL}/address/${address})`
            this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
          } else {
            this.bot.sendMessage(chatId, 'Address is not (yet) used.')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/^[/|!]transaction\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the transaction hash as argument: /transaction <hash>')
    })

    this.bot.onText(/[/|!]transaction@?\S* (.+)/, (msg, match) => {
      const hash = match[1].trim()
      const chatId = msg.chat.id
      this.lbry.getTransaction(hash)
        .then(result => {
          const currentTransaction = result[0]
          let text = `
*Amount:* ${currentTransaction.value} LBC (input count: ${currentTransaction.input_count}, output count:${currentTransaction.output_count})
*🧱 Height:* ${currentTransaction.height}
*Created at:* ${currentTransaction.created_at}
*Size:* ${currentTransaction.transaction_size} bytes
[View transaction online](${EXPLORER_URL}/tx/${hash})`
          if (currentTransaction.title) {
            text += `\n
*Claim Title:* ${currentTransaction.title}
[View connected claim](${OPEN_URL}/${currentTransaction.name})`
          }
          this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
          // Why not, just send the thumbnail as well!
          if (currentTransaction.thumbnail_url) { this.bot.sendPhoto(chatId, currentTransaction.thumbnail_url, { caption: 'Thumbnail: ' + currentTransaction.title }) }
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

    this.bot.onText(/^[/|!]block\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the block hash or block height as argument: /block <hash or block height>')
    })

    // block command (/block <hash or block height>)
    this.bot.onText(/[/|!]block@?\S* (.+)/, (msg, match) => {
      function printBlockInfo (block) {
        const blockTime = Misc.printDate(new Date(block.block_time * 1000))
        const difficulty = parseFloat(block.difficulty).toLocaleString('en', { maximumFractionDigits: 2 })
        const textMsg = `
*🧱 Height:* ${block.height}
*Hash:* ${block.hash}
*Confirmations:* ${block.confirmations}
*Size:* ${block.block_size} bytes
*Bits:* ${block.bits}
*Nonce:* ${block.nonce}
*Time:* ${blockTime}
*Version:* ${block.version}
*Difficulty:* ${difficulty}
*Chainwork:* ${block.chainwork}
*MerkleRoot:* ${block.merkle_root}
[View Block](${EXPLORER_URL}/blocks/${block.height})`
        return textMsg
      }
      const hashOrHeight = match[1].trim()
      const chatId = msg.chat.id
      if (Misc.isSha256(hashOrHeight)) {
        // Retrieved block by hash (sha256)
        this.lbry.getBlockInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.bot.sendMessage(chatId, printBlockInfo(result[0]), { parse_mode: 'markdown' })
            } else {
              this.bot.sendMessage(chatId, 'Block not found')
            }
          })
          .catch(error => {
            console.error(error)
          })
      } else {
        // Retrieved block by block height
        this.lbry.getBlockHeightInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.bot.sendMessage(chatId, printBlockInfo(result[0]), { parse_mode: 'markdown' })
            } else {
              this.bot.sendMessage(chatId, 'Block not found')
            }
          })
      }
    })

    // lastcontent command
    this.bot.onText(/[/|!]lastcontent/, msg => {
      const chatId = msg.chat.id
      this.lbry.getLastContentClaims()
        .then(result => {
          let textMsg = '*Last 10 uploaded content*\n'
          for (let i = 0; i < result.length; i++) {
            const content = result[i]
            const type = content.content_type.split('/')[0]
            textMsg += `${content.created_at} - [${content.title}](${OPEN_URL}/${content.name}) (${type})\n`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // lastchannels command
    this.bot.onText(/[/|!]lastchannels/, msg => {
      const chatId = msg.chat.id
      this.lbry.getLastChannelsClaims()
        .then(result => {
          let textMsg = '*Last 10 new channels*\n'
          for (let i = 0; i < result.length; i++) {
            const channel = result[i]
            textMsg += `${channel.created_at} - [${channel.name}](${OPEN_URL}/${channel.name})\n`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
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
          let textMsg = '*Last 10 blocks* 🧱'
          for (let i = 0; i < result.length; i++) {
            const block = result[i]
            const blockTime = Misc.printDate(new Date(block.block_time * 1000))
            const difficulty = parseFloat(block.difficulty).toLocaleString('en', { maximumFractionDigits: 3 })
            textMsg += `
    *Height:* ${block.height}
    *Time:* ${blockTime}
    *Size:* ${block.block_size} bytes
    *Difficulty:* ${difficulty}
    [View Block](${EXPLORER_URL}/blocks/${block.height})
    ------------------------------------------`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // top10 command (/top10)
    this.bot.onText(/[/|!]top10/, msg => {
      const chatId = msg.chat.id
      this.lbry.getTop10BiggestTransactions()
        .then(result => {
          let textMsg = '*Top 10 biggest transactions of this year* 💰\n'
          for (let i = 0; i < result.length; i++) {
            const amount = parseFloat(result[i].value).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
            textMsg += `[${amount} LBC](${EXPLORER_URL}/tx/${result[i].hash}) (in: ${result[i].output_count}, out: ${result[i].output_count}) - ${result[i].created_time}\n`
          }
          this.lbry.getTop100Channels()
            .then(channelResult => {
              // Retrieve the top 10 only
              if (channelResult.vanity_names && channelResult.vanity_names.length >= 5) {
                textMsg += '\n*Top 10 most subscribed channels*\n'
                let medalIcon = null
                for (let i = 0; i < 10; i++) {
                  if (i === 0) {
                    medalIcon = '🥇'
                  } else if (i === 1) {
                    medalIcon = '🥈'
                  } else if (i === 2) {
                    medalIcon = '🥉'
                  } else {
                    medalIcon = ''
                  }
                  textMsg += `${medalIcon} [${channelResult.vanity_names[i]}](${OPEN_URL}/${channelResult.vanity_names[i]}) (${channelResult.subscribers[i]} subscribers)\n`
                }
              }
              this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
            })
            .catch(error => {
              console.error(error)
            })
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/^[/|!]tips\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the name (like @channelname) as argument: /tips <name>')
    })

    // tips command
    this.bot.onText(/[/|!]tips@?\S* (.+)/, (msg, match) => {
      const name = match[1].trim()
      const chatId = msg.chat.id
      this.lbry.resolve(name)
        .then(resolve => {
          if (name in resolve) {
            const channelOrContent = resolve[name]
            this.lbry.getTop10Tips(channelOrContent.claim_id)
              .then(tipsResult => {
                if (tipsResult.length > 0) {
                  let textMsg = '*Effective amount:* ' + channelOrContent.meta.effective_amount + ' LBC\n'
                  textMsg += '*Top 10 highest tips*\n'
                  for (let i = 0; i < tipsResult.length; i++) {
                    const amount = parseFloat(tipsResult[i].amount).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
                    textMsg += `[${amount} LBC](${EXPLORER_URL}/tx/${tipsResult[i].hash}) - ${tipsResult[i].created_at} - ${tipsResult[i].name}\n`
                  }
                  this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
                } else if ('error' in channelOrContent) {
                  this.bot.sendMessage(chatId, 'Could not resolve the request 😢 (be-sure you start the channel name with @-sign)')
                } else {
                  this.bot.sendMessage(chatId, 'No tips received yet 😢')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Something went wrong with resolving 😢')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })
    // TODO: Last channel tips?

    this.bot.onText(/^[/|!]contenttips\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the LBRY URI as argument: /contenttips <URI>')
    })

    // contenttips command
    this.bot.onText(/[/|!]contenttips@?\S* (.+)/, (msg, match) => {
      const contentName = match[1].trim()
      const chatId = msg.chat.id
      this.lbry.resolve(contentName)
        .then(resolve => {
          if (contentName in resolve) {
            const content = resolve[contentName]
            this.lbry.getTopContentTips(content.claim_id)
              .then(tipsResult => {
                if (tipsResult.length > 0) {
                  this.lbry.getChannelNameString(tipsResult[0].publisher_id)
                    .then(channelResult => {
                      const channelName = channelResult[0].name
                      let textMsg = `*Top 10 highest content tips* (channel: [${channelName}](${OPEN_URL}/${channelName}))\n`
                      for (let i = 0; i < tipsResult.length; i++) {
                        const amount = parseFloat(tipsResult[i].amount).toLocaleString('en', { maximumFractionDigits: LBC_PRICE_FRACTION_DIGITS })
                        textMsg += `[${amount} LBC](${EXPLORER_URL}/tx/${tipsResult[i].hash}) - ${tipsResult[i].created_at} \n`
                      }
                      textMsg += `[View content](${OPEN_URL}/${content.permanent_url.replace(/(^\w+:|^)\/\//, '')})`
                      this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
                    })
                    .catch(error => {
                      console.error(error)
                    })
                } else {
                  this.bot.sendMessage(chatId, 'No tips received yet 😢')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Something went wrong with resolving 😢')
          }
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
        } else if (msg.text.toString().toLowerCase().startsWith('hello') || msg.text.toString().toLowerCase().startsWith('hi')) {
          this.bot.sendMessage(msg.chat.id, 'Welcome ' + name + ' 🤟!')
        } else if (msg.text.toString().toLowerCase().startsWith('bye')) {
          this.bot.sendMessage(msg.chat.id, 'Hope to see you around again, 👋 *Bye ' + name + '* 👋!', { parse_mode: 'markdown' })
        }
      }
    })
  }
}

module.exports = Telegram
