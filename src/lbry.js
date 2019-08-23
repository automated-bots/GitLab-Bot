const axios = require('axios')
const qs = require('qs')

class LBRY {
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
    // CoinMarketCap
    this.coinmarket_id = 1298 // 1298 = LBC
    this.coinmarket = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      timeout: 10000,
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketAPI
      }
    })
  }

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
   * Get block info
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
   * Get last blocks (max. 10)
   * @return {Promise} Axios promise (block_time, block_size, height, confirmations, difficulty)
   */
  getLastBlocks () {
    const query = 'SELECT block_time, block_size, height, confirmations, difficulty ' +
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
}

module.exports = LBRY
