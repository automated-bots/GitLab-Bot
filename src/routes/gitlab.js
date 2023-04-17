const secretToken = process.env.GITLAB_SECRET_TOKEN
const express = require('express')
const router = express.Router()

function isEmptyObject (obj) {
  return !Object.keys(obj).length
}

// Handle GitLab web hook POST calls
router.post('/', (req, res) => {
  res.sendStatus(200)

  // Check if the GitLab secret token matches our locally stored secret
  const gitlabToken = req.header('X-Gitlab-Token')
  if (gitlabToken && gitlabToken === secretToken) {
    const bot = req.app.get('telegram_bot')
    const gitlabTelegramMapping = req.app.get('gitlab_telegram_mapping')
    const body = req.body
    if (Object.prototype.hasOwnProperty.call(body, 'project')) {
      const projectId = parseInt(body.project.id)
      if (projectId in gitlabTelegramMapping) {
      // Retrieve Telegram chat ID (@...) from the GitLab/Telegram mapping config
        const chatId = gitlabTelegramMapping[projectId]

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
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                  case 'reopen':
                    msg += '🐞 Issue re-opened by: ' + user.name
                    msg += ' - [' + item.title + '](' + item.url + ')'
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                  case 'close':
                    msg += '🐞 Issue closed by: ' + user.name
                    msg += ' - [' + item.title + '](' + item.url + ')'
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
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
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                  case 'reopen':
                    msg += '🍒 Merge request is re-opened again by: ' + user.name
                    msg += ' - [' + item.title + '](' + item.url + ')'
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                  case 'merge':
                    msg += '🍒 Merge request is merged successfully'
                    msg += ' - [' + item.title + '](' + item.url + ')'
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                  case 'close':
                    msg += '🍒 Merge request is closed'
                    msg += ' - [' + item.title + '](' + item.url + ')'
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
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
                    msg += '❌ Pipeline [#' + item.id + '](https://gitlab.melroy.org/libreweb/browser/-/pipelines/' + item.id + ') on ' + item.ref + ' failed! '
                    msg += 'From user: ' + user.name
                    msg += ', with commit: ' + commit.title
                    if (body.merge_request != null && !isEmptyObject(body.merge_request)) {
                      msg += '. Part of MR [' + body.merge_request.iid + '](' + body.merge_request.url + ')'
                    }
                    bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                      console.error(error)
                      global.ErrorState = true
                    })
                    break
                }
              }
            }
              break
            case 'deployment':
              {
              // Only show when deployed successfully (= 'success' status)!
                const status = body.status
                if (status) {
                  switch (status) {
                    case 'success': {
                      const msg = '🚀📦 Deployment job is successful! Deployed to ' + body.environment + ' at: [' + body.environment_external_url + '](' + body.environment_external_url + ')'
                      bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                        console.error(error)
                        global.ErrorState = true
                      })
                      break
                    }
                  }
                } else {
                  console.error('Error: Missing deployment status?')
                }
              }
              break
            case 'release':
              {
              // Only show new releases (= 'create' action)!
                const action = body.action
                const projectName = body.project.name
                const tag = body.tag
                if (action && projectName && tag) {
                  switch (action) {
                    case 'create': {
                      const msg = '📢🚀🎂 New release is out! ' + projectName + ' version ' + tag + ' - [Download now](' + body.url + ')'
                      bot.sendMessage(chatId, msg, { parse_mode: 'markdown', disable_web_page_preview: true }).catch((error) => {
                        console.error(error)
                        global.ErrorState = true
                      })
                      break
                    }
                  }
                } else {
                  console.error('Error: Missing release event action, project name or git tag?')
                }
              }
              break
          }
        }
      } else {
        console.error('Error: Could not find project ID in the GitLab/Telegram mapping config. Skipping event: ' + JSON.stringify(body))
      }
    } else {
      console.error('Error: Could not find project ID for Webhook event. Skipping event: ' + JSON.stringify(body))
    }
  } else {
    console.log('WARN: GitLab Secret Token mismatch!')
  }
})

module.exports = router
