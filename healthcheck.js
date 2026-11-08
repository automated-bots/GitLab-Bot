import http from 'http'

const options = {
  host: 'localhost',
  port: process.env.PORT || '3013',
  path: '/health',
  timeout: 2000
}

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`)
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

request.on('timeout', () => {
  request.destroy(new Error('Health check timed out'))
})

request.on('error', (err) => {
  console.log('ERROR: ' + err.message)
  process.exit(1)
})

request.end()
