const axios = require('axios')

class LBRY {
  constructor (lbrynetHost, lbrynetPort) {
    this.lbrynet = axios.create({
      baseURL: 'http://' + lbrynetHost + ':' + lbrynetPort,
      timeout: 1000
    })
  }

  /**
   * Retrieve LBRYNET deamon information
   *
   * @return {Promise} Axios promise
   */
  getStatus () {
    return this.lbrynet.post('/', {
      method: 'status',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get account balance amount from provided account_id
   *
   * @param {string} id - Account ID
   * @return {Promise} Axios promise
   */
  getAmount (id) {
    return this.lbrynet.post('/', {
      method: 'account_balance',
      params: {
        account_id: id,
        reserved_subtotals: false
      }
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Validate if this is your addresss
   *
   * @param {string} id - Account ID
   * @param {string} address - Account ID
   * @return {Promise} Axios promise
   */
  isMyAddress (id, addr) {
    return this.lbrynet.post('/', {
      method: 'address_is_mine',
      params: {
        account_id: id,
        address: addr
      }
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }
}
module.exports = LBRY
