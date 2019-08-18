const axios = require('axios')

class LBRY {

  constructor(lbrynet_host, lbrynet_port) {
    this.lbrynet = axios.create({
      baseURL: 'http://' + lbrynet_host + ':' + lbrynet_port,
      timeout: 1000
    })
  }

  status() {
    return this.lbrynet.post('/', {
      method: 'status',
      params: {}
    })
    .then(response => {
      return Promise.resolve(response.data.result)
    })
  }

  amount(id) {
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

  myaddress(id, addr) {
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
module.exports = LBRY;