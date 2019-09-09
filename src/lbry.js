const axios = require('axios')
const qs = require('qs')

class LBRY {
  /**
   * Constructor
   * @param {string} lbrynetHost
   * @param {integer} lbrynetPort
   * @param {string} lbrycrdHost
   * @param {integer} lbrycrdPort
   * @param {string} lbrycrdRPCUser
   * @param {string} lbrycrdRPCPass
   * @param {string} coinMarketAPI
   */
  constructor (lbrynetHost, lbrynetPort, lbrycrdHost, lbrycrdPort, lbrycrdRPCUser, lbrycrdRPCPass, coinMarketAPI) {
    // Local Lbrynet (SDK api)
    this.lbrynet = axios.create({
      baseURL: 'http://' + lbrynetHost + ':' + lbrynetPort,
      timeout: 10000
    })
    // Local lbry core deamon API
    this.lbrycrd = axios.create({
      baseURL: 'http://' + lbrycrdHost + ':' + lbrycrdPort,
      timeout: 10000,
      auth: {
        username: lbrycrdRPCUser,
        password: lbrycrdRPCPass
      }
    })
    // Public ChainQuery API
    this.chainquery_api = 'https://chainquery.lbry.com/api/sql'
    // Internal-API (not-used atm)
    // this.lbry_auth_token = auth_token
    // this.lbry_api = 'https://api.lbry.com'
    // Unofficial Brendon API
    this.subscriber_count_api = 'https://www.brendonbrewer.com/lbrynomics/subscriber_counts.json'
    // Official CoinMarketCap
    this.coinmarket_id = 1298 // 1298 = LBC
    this.coinmarket = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      timeout: 10000,
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketAPI
      }
    })
  }

  /***********************************************
  * Promise Getters                              *
  ***********************************************/

  /**
   * Retrieve LBRYnet deamon information
   *
   * @return {Promise} Axios promise
   */
  getLbryNetStatus () {
    return this.lbrynet.post('/', {
      method: 'status',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get peer node info from LBRY core
   *
   * @return {Promise} Axios promise
   */
  getPeerInfo () {
    return this.lbrycrd.post('/', {
      method: 'getpeerinfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get wallet info info from LBRY core
   *
   * @return {Promise} Axios promise
   */
  getWalletInfo () {
    return this.lbrycrd.post('/', {
      method: 'getwalletinfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get content information by providing the uri
   *
   * @param {string} uri_address - uri
   * @return {Promise} Axios promise
   */
  getMetaFileData (uriAddress) {
    return this.lbrynet.post('/', {
      method: 'get',
      params: {
        uri: uriAddress,
        save_file: false
      }
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get blockchain info
   * @return {Promise} Axios promise
   */
  getBlockChainInfo () {
    return this.lbrycrd.post('/', {
      jsonrpc: '1.0',
      id: 'LBRY Bot',
      method: 'getblockchaininfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get network info from the core itself
   *
   * @return {Promise} Axios promise (blocks, headers, bestblockhash, difficulty, mediantime, softforks)
   */
  getNetworkInfo () {
    return this.lbrycrd.post('/', {
      jsonrpc: '1.0',
      id: 'LBRY Bot',
      method: 'getnetworkinfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get mining info from the core itself
   *
   * @return {Promise} Axios promise (blocks, difficulty, networkhashps)
   */
  getMiningInfo () {
    return this.lbrycrd.post('/', {
      jsonrpc: '1.0',
      id: 'LBRY Bot',
      method: 'getmininginfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get exchange info from Whattomine.com
   *
   * @return {Promise} Axios promise (block_time, block_reward, difficulty24, exchange_rate, exchange_rate24, market_cap)
   */
  getExchangeInfo () {
    return axios.get('https://whattomine.com/coins/164.json')
      .then(response => {
        return Promise.resolve(response.data)
      })
  }

  /**
   * Get lastest prices (quotes) from CoinMarketCap
   *
   * @return {Promise} Axios promise
   */
  getLatestPrices () {
    return this.coinmarket.get('/cryptocurrency/quotes/latest', {
      params: {
        id: this.coinmarket_id,
        aux: 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,' +
        'volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported'
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data[this.coinmarket_id])
      })
  }

  /*
   * Get address info
   * @return {Promise} Axios promise (id & balance)
   */
  getAddressInfo (address) {
    const query = 'SELECT id, balance, created_at, modified_at FROM address WHERE address= "' + address + '" LIMIT 1'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get transaction info from hash
   * @return {Promise} Axios promise (input_count, output_count, hash, created_at, value, fee, height, transaction_size)
   */
  getTransaction (hash) {
    const query = 'SELECT input_count, output_count, transaction.hash, transaction.created_at, value, block.height, transaction_size, claim.name, claim.title, claim.thumbnail_url ' +
    'FROM transaction LEFT JOIN block ON transaction.block_hash_id = block.hash LEFT JOIN claim ON claim.transaction_hash_id = transaction.hash ' +
    'WHERE transaction.hash = "' + hash + '"'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get transactions from address (limit by last 10 transactions)
   * @return {Promise} Axios promise (credit_amount, debit_amount, hash, created_time)
   */
  getTransactions (address) {
    const query = 'SELECT credit_amount, debit_amount, hash, created_time FROM transaction_address ' +
    'LEFT JOIN transaction ON transaction_address.transaction_id=transaction.id WHERE ' +
    'transaction_address.address_id = ' + address + ' ORDER BY transaction_time DESC LIMIT 10'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get block info using hash
   * @return {Promise} Axios promise (block_size, height, block_time, difficulty, merkle_root, ...)
   */
  getBlockInfo (hash) {
    const query = 'SELECT bits, block_size, height, version, nonce, block_time, confirmations, difficulty, chainwork, merkle_root ' +
    'FROM block WHERE hash = "' + hash + '" LIMIT 1'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get block info using block height
   * @return {Promise} Axios promise (block_size, height, block_time, difficulty, merkle_root, ...)
   */
  getBlockHeightInfo (blockHeight) {
    const query = 'SELECT bits, block_size, height, hash, version, nonce, block_time, confirmations, difficulty, chainwork, merkle_root ' +
    'FROM block WHERE height = "' + blockHeight + '" LIMIT 1'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get last blocks (max. 10)
   * @return {Promise} Axios promise (block_time, block_size, height, difficulty)
   */
  getLastBlocks () {
    const query = 'SELECT block_time, block_size, height, difficulty ' +
    'FROM block ORDER BY height DESC LIMIT 10'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get last content claims (max. 10)
   * @return {Promise} Axios promise (name, title, thumbnail_url, created_at)
   */
  getLastContentClaims () {
    const query = 'SELECT name, title, thumbnail_url, created_at, content_type FROM claim WHERE claim_type = 1 ORDER BY id DESC LIMIT 10'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get last channels claims (max. 10)
   * @return {Promise} Axios promise (name => Channel name, created_at)
   */
  getLastChannelsClaims () {
    const query = 'SELECT name, created_at FROM claim WHERE claim_type = 2 ORDER BY id DESC LIMIT 10'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /**
   * Get the top 10 biggest transactions of this year (value in LBC)
   * @return {Promise} Axios promise (hash, created_time, input_count, output_count, value, height)
   */
  getTop10BiggestTransactions () {
    const query = 'SELECT transaction.hash, value, created_time, input_count, output_count, height from transaction LEFT JOIN block ON block.hash = transaction.block_hash_id WHERE year(created_time) = YEAR(CURDATE()) ORDER BY value DESC LIMIT 10'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /**
   * Get the top 100 channels (claim_type = 2) in respect to the subscribers depending on Brendon Brewer API for now until #127 issue is fixed in ChainQuery
   * @return {Promise} Axios promise with JSON result (including vanity_names[] and subscribers[])
   */
  getTop100Channels () {
    return axios.get(this.subscriber_count_api)
      .then(response => {
        return Promise.resolve(response.data)
      })
  }

  /*
   * Get channel name from claim ID
   * @return Promose (name)
   */
  async getChannelNameString (claimID) {
    const query = 'SELECT name FROM claim WHERE claim_type = 2 AND claim_id = "' + claimID + '" LIMIT 1'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }
}

module.exports = LBRY
