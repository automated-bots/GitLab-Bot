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
    this.chainquery = axios.create({
      baseURL: 'https://chainquery.lbry.com/api/sql?',
      timeout: 10000
    })
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
   * Get network info
   * @return {Promise} Axios promise
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
   * Get address info
   * @return {Promise} Axios promise (id & balance)
   */
  getAddressInfo (address) {
    const query = 'SELECT id, balance FROM address WHERE address= "' + address + '" LIMIT 1'
    return this.chainquery.get(qs.stringify({ 'query': query }))
      .then(response => {
        return Promise.resolve(response.data.data)
      })
  }
}
module.exports = LBRY
