import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import express from 'express'

for (const branch of ['release-1', 'feature_test', 'release/1.2', 'main', '']) {
  for (const showSuccess of [false, true]) {
    test(`pipeline branch=${branch || '(unrestricted)'}, success=${showSuccess}`, async () => {
      process.env.NODE_ENV = 'production'
      process.env.GITLAB_SECRET_TOKEN = 'test-secret'
      process.env.GITLAB_PIPELINE_BRANCH_NAME = branch
      process.env.GITLAB_PIPELINE_SHOW_SUCCESS = String(showSuccess)
      const { default: router } = await import(`../src/routes/gitlab.js?branch=${encodeURIComponent(branch)}&success=${showSuccess}`)
      const messages = []
      const app = express()
      app.use(express.json())
      app.set('gitlab_telegram_mapping', { 42: '@test' })
      app.set('telegram_bot', {
        api: {
          sendMessage: async (message) => messages.push(message)
        }
      })
      app.use('/gitlab', router)
      const server = app.listen(0, '127.0.0.1')
      await once(server, 'listening')
      try {
        const sendPipeline = async (ref, status) => {
          const response = await fetch(`http://127.0.0.1:${server.address().port}/gitlab`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-gitlab-token': 'test-secret' },
            body: JSON.stringify({
              project: { id: 42 },
              object_kind: 'pipeline',
              object_attributes: { id: 1, ref, status, url: 'https://example.test/pipelines/1' },
              user: { name: 'Tester' },
              commit: { title: 'Test commit' }
            })
          })
          assert.equal(response.status, 200)
          await response.text()
        }
        const matchingBranch = branch || 'feature_test-1.2'
        await sendPipeline(matchingBranch, 'failed')
        assert.equal(messages.length, 1)
        assert.equal(messages[0].parse_mode, 'MarkdownV2')
        const escapedBranches = {
          'release-1': 'release\\-1',
          feature_test: 'feature\\_test',
          'release/1.2': 'release/1\\.2',
          main: 'main',
          'feature_test-1.2': 'feature\\_test\\-1\\.2'
        }
        assert.ok(messages[0].text.includes(` on ${escapedBranches[matchingBranch]} failed`))
        await sendPipeline(matchingBranch, 'success')
        const matchingCount = showSuccess ? 2 : 1
        assert.equal(messages.length, matchingCount)
        await sendPipeline('another-branch', 'failed')
        assert.equal(messages.length, matchingCount + (branch ? 0 : 1))
        await sendPipeline(matchingBranch, 'running')
        assert.equal(messages.length, matchingCount + (branch ? 0 : 1))
      } finally {
        await new Promise((resolve) => server.close(resolve))
      }
    })
  }
}
