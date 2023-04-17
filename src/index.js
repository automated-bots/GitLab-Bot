require('dotenv').config()
// NTBA = node-telegram-bot-api fixes
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1
// constants
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const botUrl = process.env.URL || 'https://gitlabbot.melroy.org'
const gitlabTelegramMapping = process.env.GITLAB_TELEGRAM_CHAT_MAPPING
const port = process.env.PORT || 3013
const secretToken = process.env.GITLAB_SECRET_TOKEN
const isTelegramEnabled = process.env.TELEGRAM_ENABLED || 'true'

const createError = require('http-errors')
const crypto = require('crypto')
global.TelegramSecretHash = crypto.randomBytes(20).toString('hex')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const routes = require('./routes')
global.ErrorState = false

if ((typeof secretToken === 'undefined') || secretToken === null || secretToken === '') {
  console.error('ERROR: GitLab Secret Token not provided but is required. Setup an .env file!')
  process.exit(1)
}

if ((typeof gitlabTelegramMapping === 'undefined') || gitlabTelegramMapping === null || gitlabTelegramMapping === '') {
  console.error('ERROR: GitLab Telegram mapping object is empty. Setup an .env file!')
  process.exit(1)
}

// Create the Express app
const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

if (isTelegramEnabled === 'true') {
  if (!TELEGRAM_TOKEN) {
    console.error('\x1b[31mERROR: Provide your Telegram token, by setting the TELEGRAM_TOKEN environment variable first! See README.md.\nExit.\x1b[0m')
    process.exit(1)
  } else {
    console.log('INFO: Telegram bot will be enabled.')
  }
  try {
    const parsedMapping = JSON.parse(gitlabTelegramMapping)

    const bot = new TelegramBot(TELEGRAM_TOKEN)
    bot.on('error', (error) => {
      console.error(error)
      global.ErrorState = true
    })
    // This informs the Telegram servers of the new webhook.
    bot.setWebHook(`${botUrl}/telegram/bot${TelegramSecretHash}`).catch((error) => {
      console.error(error)
      global.ErrorState = true
    })
    app.set('telegram_bot', bot)
    app.set('gitlab_telegram_mapping', parsedMapping)
  } catch (e) {
    console.error('\x1b[31mERROR: Unable to parse GitLab/Telegram JSON mapping variable, used for mapping the project ID to a Telegram chat ID.\nExit.\x1b[0m')
    console.error(e)
    process.exit(1)
  }
}

app.use('/', routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((error, req, res, next) => {
  // Only print errors in development
  if (req.app.get('env') === 'development') {
    console.error(error)
  }
  // Render the error page
  res.status(error.status || 500).json()
})

// Start server
app.listen(port, () => {
  console.log(`INFO: GitLab-Telegram Bot service is now listening at http://localhost:${port}`)
})
