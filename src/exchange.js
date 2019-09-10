const axios = require('axios')

class Exchange {
  /**
   * Constructor
   * @param {string} coinMarketAPI
   */
  constructor (coinMarketAPI) {
    // Exchange WhatToMine
    this.whattomine_api = 'https://whattomine.com/coins/164.json'
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

  /**
   * Get exchange info from Whattomine.com
   *
   * @return {Promise} Axios promise (block_time, block_reward, difficulty24, exchange_rate, exchange_rate24, market_cap)
   */
  getExchangeInfo () {
    return axios.get(this.whattomine_api)
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
}

module.exports = Exchange
