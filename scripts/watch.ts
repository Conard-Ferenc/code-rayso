import { watch } from 'node:fs'
import build from './build'

const watcher = watch(`./src`, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename} (src)`)

  await build()
})

process.on('SIGINT', () => {
  watcher.close()
  process.exit(0)
})
