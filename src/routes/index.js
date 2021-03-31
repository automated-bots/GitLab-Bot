const express = require('express');
const router = express.Router();
const aboutRoute = require('./about')
const telegramRoute = require('./telegram')
const gitlabRoute = require('./gitlab')

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the GitLab-Telegram bot' })
})
    .use('/about', aboutRoute)
    .use('/telegram', telegramRoute)
    .use('/gitlab', gitlabRoute)

module.exports = router;
