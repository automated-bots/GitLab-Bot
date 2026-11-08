import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { promisify } from 'node:util'

const execute = promisify(execFile)

for (const status of [200, 500, 'timeout']) {
  test(`health check on a custom port: ${status}`, async () => {
    const server = http.createServer((req, res) => {
      assert.equal(req.url, '/health')
      if (status !== 'timeout') res.writeHead(status).end()
    })
    server.listen(0)
    await once(server, 'listening')
    try {
      const check = execute(process.execPath, ['healthcheck.js'], {
        env: { ...process.env, PORT: String(server.address().port) },
        timeout: 5000
      })
      if (status === 200) {
        assert.match((await check).stdout, /STATUS: 200/)
      } else {
        await assert.rejects(check, (error) => {
          assert.equal(error.code, 1)
          assert.match(error.stdout, status === 500 ? /STATUS: 500/ : /Health check timed out/)
          return true
        })
      }
    } finally {
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  })
}

for (const failure of ['build', 'first-push', 'none']) {
  test(`image publishing stops on failure: ${failure}`, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'gitlab-bot-publish-'))
    const logPath = path.join(directory, 'calls')
    try {
      await writeFile(
        path.join(directory, 'docker'),
        `#!/bin/sh
printf '%s\\n' "$*" >> "$MOCK_LOG"
if [ "$MOCK_FAILURE" = build ] && [ "$1" = build ]; then exit 1; fi
if [ "$MOCK_FAILURE" = first-push ] && [ "$1" = push ] && [ "$2" = danger89/gitlab-bot:latest ]; then exit 1; fi
exit 0
`,
        { mode: 0o755 }
      )
      const run = execute('bash', ['scripts/build_and_push_docker_image.sh'], {
        env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, MOCK_LOG: logPath, MOCK_FAILURE: failure }
      })
      if (failure === 'none') await run
      else await assert.rejects(run, (error) => error.code === 1)
      const calls = (await readFile(logPath, 'utf8')).trim().split('\n')
      assert.equal(calls.length, failure === 'build' ? 1 : failure === 'first-push' ? 2 : 3)
      assert.match(calls[0], /^build /)
      if (calls.length > 1) assert.equal(calls[1], 'push danger89/gitlab-bot:latest')
      if (calls.length > 2) assert.equal(calls[2], 'push registry.melroy.org/melroy/gitlab-bot/gitlab-bot:latest')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
}
