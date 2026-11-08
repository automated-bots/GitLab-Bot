import express from 'express'
const router = express.Router()

// We are receiving updates at the route below
router.post('/bot:secret', async (req, res) => {
  if (req.params.secret !== global.TelegramSecretHash) {
    res.sendStatus(404)
    return
  }
  await req.app.get('telegram_bot').handleUpdate(req.body)
  res.sendStatus(200)
})

export default router
