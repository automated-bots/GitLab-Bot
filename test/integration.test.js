import assert from 'node:assert/strict'
import { test } from 'node:test'
import { once } from 'node:events'

for (const enabled of ['true', 'false']) {
  test(`webhooks with Telegram enabled=${enabled}`, async () => {
    Object.assign(process.env, {
      DOTENV_CONFIG_PATH: '/dev/null',
      NODE_ENV: 'production',
      PORT: '0',
      TELEGRAM_ENABLED: enabled,
      TELEGRAM_TOKEN: '123456:test-token',
      URL: 'https://example.test',
      GITLAB_SECRET_TOKEN: 'test-secret',
      GITLAB_TELEGRAM_CHAT_MAPPING: '{"42":"@test"}'
    })
    const requests = []
    const originalFetch = global.fetch
    global.fetch = async (url, options) => {
      if (!String(url).startsWith('https://api.telegram.org/')) {
        throw new Error('Unexpected outbound request')
      }
      const method = String(url).split('/').at(-1)
      requests.push({ method, body: Object.fromEntries(new URLSearchParams(options.body)) })
      const result = method === 'getMe' ? { id: 123456, is_bot: true, first_name: 'Test', username: 'test_bot' } : true
      return Response.json({ ok: true, result })
    }
    let server
    try {
      const module = await import(`../src/index.js?enabled=${enabled}`)
      server = module.server
      const app = module.default
      if (!server.listening) await once(server, 'listening')
      const base = `http://127.0.0.1:${server.address().port}`
      const request = (path, body, token = 'test-secret') =>
        originalFetch(`${base}${path}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-gitlab-token': token },
          body: JSON.stringify(body)
        })
      assert.equal((await originalFetch(`${base}/health`)).status, 200)
      assert.equal((await request('/telegram/botwrong', { update_id: 1 })).status, 404)
      assert.equal((await request(`/telegram/bot${global.TelegramSecretHash}`, { update_id: 1 })).status, 200)
      const payload = {
        project: { id: 42 },
        object_kind: 'issue',
        object_attributes: { action: 'open', title: 'Test issue', url: 'https://example.test/issue/1' },
        user: { name: 'Tester' }
      }
      assert.equal((await request('/gitlab', payload, 'wrong')).status, 200)
      assert.equal(requests.filter((item) => item.method === 'sendMessage').length, 0)
      assert.equal((await request('/gitlab', payload)).status, 200)
      const invalid = await originalFetch(`${base}/gitlab`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{'
      })
      assert.equal(invalid.status, 400)
      assert.deepEqual(await (await originalFetch(`${base}/health`)).json(), { result: 'OK' })
      if (enabled === 'true') {
        assert.equal(requests.find((item) => item.method === 'setWebhook').body.url, `https://example.test/telegram/bot${global.TelegramSecretHash}`)
        assert.ok(requests.some((item) => item.method === 'getMe'))
        const messages = requests.filter((item) => item.method === 'sendMessage')
        assert.equal(messages.length, 1)
        assert.equal(messages[0].body.chat_id, '@test')
        assert.match(messages[0].body.text, /Test issue/)
        assert.equal(messages[0].body.parse_mode, 'MarkdownV2')
        assert.deepEqual(JSON.parse(messages[0].body.link_preview_options), { is_disabled: true })
        const release = { object_kind: 'release', project: { id: 42, name: 'Test project' }, action: 'create', tag: 'v2.0.0', url: 'https://example.test/releases/v2' }
        assert.equal((await request('/gitlab', release)).status, 200)
        const releaseMessages = requests.filter((item) => item.method === 'sendMessage')
        assert.equal(releaseMessages.length, 2)
        assert.ok(releaseMessages[1].body.text.includes('v2\\.0\\.0'))
        await request('/gitlab', { ...release, project: { id: 99, name: 'Unmapped' } })
        assert.equal(requests.filter((item) => item.method === 'sendMessage').length, 2)
        app.get('telegram_bot').use(() => {
          throw new Error('simulated handler failure')
        })
        assert.equal((await request(`/telegram/bot${global.TelegramSecretHash}`, { update_id: 2 })).status, 200)
        assert.equal((await originalFetch(`${base}/health`)).status, 500)
      } else {
        assert.equal(requests.length, 0)
      }
    } finally {
      global.fetch = originalFetch
      if (server) await new Promise((resolve) => server.close(resolve))
    }
  })
}
