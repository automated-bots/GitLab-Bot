const axios = require('axios')
const qs = require('qs')

class LBRY {
  constructor (lbrynetHost, lbrynetPort, lbrycrdHost, lbrycrdPort, RPCUser, RPCPass) {
    this.lbrynet = axios.create({
      baseURL: 'http://' + lbrynetHost + ':' + lbrynetPort,
      timeout: 10000
    })
    this.lbrycrd = axios.create({
      baseURL: 'http://' + lbrycrdHost + ':' + lbrycrdPort,
      timeout: 10000,
      auth: {
        username: RPCUser,
        password: RPCPass
      }
    })
    this.chainquery_api = 'https://chainquery.lbry.com/api/sql'
  }

  /**
   * Retrieve LBRYNET deamon information
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
        return qs.stringify(params) // { encode: false }
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }

  /*
   * Get transactions from address (limit by last 15 transactions)
   * @return {Promise} Axios promise (credit_amount, debit_amount, hash, created_time)
   */
  getTransactions (address) {
    const query = 'SELECT credit_amount, debit_amount, hash, created_time FROM transaction_address ' +
    'LEFT JOIN transaction ON transaction_address.transaction_id=transaction.id WHERE ' +
    'transaction_address.address_id = ' + address + ' ORDER BY transaction_time DESC LIMIT 15'
    return axios.get(this.chainquery_api, {
      params: {
        query: query
      },
      paramsSerializer: params => {
        return qs.stringify(params) // { encode: false }
      }
    })
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }
}
module.exports = LBRY
