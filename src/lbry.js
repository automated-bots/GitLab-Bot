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
   */
  constructor (lbrynetHost, lbrynetPort, lbrycrdHost, lbrycrdPort, lbrycrdRPCUser, lbrycrdRPCPass) {
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
    // Unofficial Brendon API
    this.subscriber_count_api = 'https://www.brendonbrewer.com/lbrynomics/subscriber_counts.json'

    // Internal-API (not-used atm)
    // this.lbry_auth_token = auth_token
    // this.lbry_api = 'https://api.lbry.com'
  }

  /****************************
   * LbryNet methods          *
   ****************************/

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
   * Retrieve LBRYnet version
   *
   * @return {Number} LBRYnet version
   */
  getLbryNetVersion () {
    return this.lbrynet.post('/', {
      method: 'version',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result.lbrynet_version)
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

  /*
   * Resolve LBRY content file/channel from name
   * @return Promose (address, claim_id, canonical_url, confirmations, height, permanent_url, short_url, signed_channel {}, and so much more...)
   */
  resolve (name) {
    return this.lbrynet.post('/', {
      method: 'resolve',
      params: {
        urls: name
      }
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /****************************
   * LBRY Core Daemon methods *
   ****************************/

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

  /****************************
   * ChainQuery methods       *
   ****************************/

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
   * @return {Promise} Axios promise (input_count, output_count, hash, created_at, value, height, transaction_size, claim_id, title, name, thumbnail_url)
   */
  getTransaction (hash) {
    const query = 'SELECT input_count, output_count, transaction.hash, transaction.created_at, value, block.height, transaction_size, claim.claim_id, claim.name, claim.title, claim.thumbnail_url ' +
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
   * Get the top 10 tips [indirect or direct] (amount in LBC, name could be the channel or content of that channel)
   * Note: I still have the idea I also see support next to the tips
   * @return {Promise} Axios promise (amount, created_at, name)
   */
  getTop10Tips (claimID) {
    const query = 'SELECT support.support_amount amount, support.created_at, name, transaction.hash ' +
    'FROM claim INNER JOIN support ON support.supported_claim_id = claim.claim_id ' +
    'INNER JOIN transaction ON support.transaction_hash_id = transaction.hash ' +
    'INNER JOIN output ON transaction.hash = output.transaction_hash ' +
    'WHERE (support.supported_claim_id = "' + claimID + '" OR publisher_id = "' + claimID + '") ' +
    'AND output.address_list LIKE CONCAT("%", claim.claim_address, "%") ' +
    'GROUP BY support.id, support.support_amount, support.created_at ' +
    'ORDER BY support.support_amount DESC LIMIT 10'
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
   * Get the top 10 content tips (amount in LBC)
   * @return {Promise} Axios promise (amount, created_at, name, publisher_id)
   */
  getTopContentTips (claimID) {
    const query = 'SELECT support.support_amount amount, support.created_at, claim.name, claim.publisher_id, transaction.hash ' +
    'FROM support INNER JOIN claim ON support.supported_claim_id = claim.claim_id ' +
    'INNER JOIN transaction ON support.transaction_hash_id = transaction.hash ' +
    'INNER JOIN output ON transaction.hash = output.transaction_hash WHERE claim.claim_id = "' + claimID + '" ' +
    'AND claim.claim_type = 1 AND output.address_list LIKE CONCAT("%", claim.claim_address, "%") ' +
    'GROUP BY support.id, support.support_amount, support.created_at ' +
    'ORDER BY support.support_amount DESC LIMIT 10'
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
   * Get channel name from claim ID
   * @return Promose (name)
   */
  getChannelNameString (claimID) {
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

  /****************************
   * Un-official APIs         *
   ****************************/

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
}

module.exports = LBRY
