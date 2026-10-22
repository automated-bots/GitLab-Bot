import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'

process.env.NODE_ENV = 'production'
process.env.PORT = '0'
process.env.TELEGRAM_ENABLED = 'true'
process.env.TELEGRAM_TOKEN = '123456:test-token'
process.env.GITLAB_SECRET_TOKEN = 'local-test-secret'
process.env.GITLAB_TELEGRAM_CHAT_MAPPING = '{"42":"@test-chat"}'
process.env.URL = 'https://bot.example.test'

const realFetch = globalThis.fetch
const calls = []
globalThis.fetch = async (url, options) => {
  assert.ok(String(url).startsWith('https://api.telegram.org/'))
  calls.push({ method: String(url).split('/').at(-1), params: Object.fromEntries(new URLSearchParams(options.body)) })
  return Response.json({ ok: true, result: true })
}

const { default: app, server } = await import('../src/index.js')
if (!server.listening) await once(server, 'listening')
const base = `http://localhost:${server.address().port}`

async function post(path, body, token = process.env.GITLAB_SECRET_TOKEN) {
  return realFetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Gitlab-Token': token },
    body: JSON.stringify(body)
  })
}

test('updated bot starts, handles webhooks and sends Telegram messages', async (t) => {
  t.after(async () => {
    globalThis.fetch = realFetch
    await new Promise((resolve) => server.close(resolve))
  })
  assert.deepEqual(await (await realFetch(base + '/health')).json(), { result: 'OK' })
  assert.equal((await realFetch(base + '/')).status, 200)
  await new Promise((resolve) => setImmediate(resolve))
  const webhook = calls.find((call) => call.method === 'setWebhook')
  assert.ok(webhook)
  const path = new URL(webhook.params.url).pathname
  assert.equal((await post(path, { update_id: 1 })).status, 200)
  assert.equal((await post('/telegram/botwrong-secret', { update_id: 2 })).status, 404)

  const payload = { object_kind: 'release', project: { id: 42, name: 'Test project' }, action: 'create', tag: 'v2.0.0', url: 'https://gitlab.example.test/releases/v2' }
  assert.equal((await post('/gitlab', payload)).status, 200)
  await new Promise((resolve) => setImmediate(resolve))
  const messages = calls.filter((call) => call.method === 'sendMessage')
  assert.equal(messages.length, 1)
  assert.equal(messages[0].params.chat_id, '@test-chat')
  assert.ok(messages[0].params.text.includes('v2\\.0\\.0'))
  assert.equal(messages[0].params.parse_mode, 'MarkdownV2')
  assert.deepEqual(JSON.parse(messages[0].params.link_preview_options), { is_disabled: true })
  await post('/gitlab', payload, 'wrong-token')
  await post('/gitlab', { ...payload, project: { id: 99, name: 'Unmapped' } })
  assert.equal(calls.filter((call) => call.method === 'sendMessage').length, 1)

  app.get('telegram_bot').use(() => {
    throw new Error('simulated handler failure')
  })
  assert.equal((await post(path, { update_id: 3 })).status, 200)
  assert.equal((await realFetch(base + '/health')).status, 500)
})
