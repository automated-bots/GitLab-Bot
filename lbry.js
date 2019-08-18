const axios = require('axios')

class LBRY {
  constructor (lbrynetHost, lbrynetPort) {
    this.lbrynet = axios.create({
      baseURL: 'http://' + lbrynetHost + ':' + lbrynetPort,
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
}
module.exports = LBRY
