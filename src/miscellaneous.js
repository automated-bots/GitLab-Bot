class Misc {
  /**
   * Convert Date object to string
   * @param {Date} - date 
   * @return {string} formatted date string
   */
  static printDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options) + ' ' + date.toLocaleTimeString('en-US')
  }

  /**
   * Validate if hash is SHA256
   * @param {string} - hash string
   * @return {Boolean} True if SHA256 otherwise false
   */
  static isSha256(hash) {
    return hash.match(/^([a-f0-9]{64})$/) != null
  }

  /**
   * Convert timestamp to date (approximately)
   * @param {Date} timestamp 
   * @turn {Dict} structure of year, month, day, hour, minute, second
   */
  static timestampToDate(timestamp) {
    let seconds = Math.floor(timestamp / 1000)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds % 60
    let hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    let days = Math.floor(hours / 24)
    hours = hours % 24
    let months = Math.floor(days / 30)
    days = days % 30
    const years = Math.floor(months / 12)
    months = months % 12
    return {year: years, month: months, day: days, hour: hours, minute: minutes, second: seconds}
  }
}

module.exports = Misc