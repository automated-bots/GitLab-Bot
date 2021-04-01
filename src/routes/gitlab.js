const express = require('express')
const router = express.Router()
const app = express()

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

router.post('/', (req, res) => {
    res.sendStatus(200)

    const body = req.body;
    if (body.hasOwnProperty('object_kind')) {
        switch (body['object_kind']) {
            case 'issue':
                // Only new issues
                if(isEmptyObject(body['changes'])) {
                    const user = body['user']
                    const issueItem = body['object_attributes']
                    msg = 'New issue created by: '
                    msg += user['name']
                    msg += ' - Title: '
                    msg += issueItem['title']
                    msg += '. Go to issue: '
                    msg += issueItem['url']
                    console.log(msg)
                }
                break;
            case 'merge_request':
                break;
            case 'pipeline':
                break;
            case 'release':
                break;
        }

    }
    //const bot = app.get('telegram_bot')
    //const chatId = await bot.getChat('@libreweb');
    //bot.sendMessage(chatId, "Hello!");
})

module.exports = router
