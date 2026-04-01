export default class Misc {
  /**
   * Convert a string to a safe markdown string for Telegram markdown
   * @param {String} str string input
   * @returns String output, safe for markdown in Telegram
   */
  static makeSafeMarkdownString(str) {
    return str
      .replaceAll('.', '\\.')
      .replaceAll('-', '\\-')
      .replaceAll('!', '\\!')
      .replaceAll('+', '\\+')
      .replaceAll('#', '\\#')
      .replaceAll('*', '\\*')
      .replaceAll('_', '\\_')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
      .replaceAll('~', '\\~')
      .replaceAll('`', '\\`')
      .replaceAll('|', '\\|')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll('<', '\\<')
      .replaceAll('>', '\\>')
      .replaceAll('=', '\\=')
      .replaceAll('{', '\\{')
      .replaceAll('}', '\\}')
      .replaceAll('=', '\\=')
      .replaceAll('=', '\\=')
  }
}
