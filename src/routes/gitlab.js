const express = require('express')
const router = express.Router()
const app = express()

function isEmptyObject (obj) {
  return !Object.keys(obj).length
}

// Handle GitLab web hook POST calls
router.post('/', (req, res) => {
  res.sendStatus(200)

  const body = req.body
  if (Object.prototype.hasOwnProperty.call(body, 'object_kind')) {
    switch (body.object_kind) {
      case 'issue': {
        // Only new open issues will be reported
        const item = body.object_attributes
        const user = body.user
        if (Object.prototype.hasOwnProperty.call(item, 'action')) {
          let msg = ''
          switch (item.action) {
            case 'open':
              msg += '🐞 New issue created by: ' + user.name
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
            case 'reopen':
              msg += '🐞 Issue re-opened by: ' + user.name
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
            case 'close':
              msg += '🐞 Issue closed by: ' + user.name
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
          }
        }
      }
        break
      case 'merge_request': {
        // Only new & merged MRs will be reported
        const item = body.object_attributes
        const user = body.user
        if (Object.prototype.hasOwnProperty.call(item, 'action')) { // I hope?
          let msg = ''
          switch (item.action) {
            case 'open':
              msg += '🍒 New merge request opened by: ' + user.name
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
            case 'reopen':
              msg += '🍒 Merge request is re-opened again by: ' + user.name
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
            case 'merge':
              msg += '🍒 Merge request is merged successfully'
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
            case 'close':
              msg += '🍒 Merge request is closed'
              msg += ' - [' + item.title + '](' + item.url + ')'
              console.log(msg)
              break
          }
        }
      }
        break
      case 'pipeline': {
        // Only show failed pipelines
        const item = body.object_attributes
        const user = body.user
        const commit = body.commit
        if (Object.prototype.hasOwnProperty.call(item, 'status')) {
          let msg = ''
          switch (item.status) {
            case 'failed': // failed or success?
              msg += '❌ Pipeline [#' + item.id + '](https://gitlab.melroy.org/libreweb/browser/-/pipelines/' + item.id + ') failed! '
              msg += 'From user: ' + user.name
              msg += ', with commit: ' + commit.title
              if (body.merge_request != null && !isEmptyObject(body.merge_request)) {
                msg += '. Part of MR [' + body.merge_request.iid + '](' + body.merge_request.url + ')'
              }
              console.log(msg)
              break
          }
        }
      }
        break
      case 'release':
        {
          // Only show new releases!
          let msg = ''
          switch (body.action) {
            case 'create':
              msg += '📢🚀🎂 New release is out! LibreWeb Browser version ' + body.tag + ' - [Download now](' + body.url + ')'
              console.log(msg)
              break
          }
        }
        break
    }
  }
  // const bot = req.app.get('telegram_bot')
  // const chatId = bot.getChat('@libreweb')..
  // bot.sendMessage(chatId, "Hello!",  { parse_mode: 'markdown' })
})

module.exports = router
