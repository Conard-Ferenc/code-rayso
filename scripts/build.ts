import bunConfig from './bun.config'

const build = async () => {
  const output = await Bun.build(bunConfig)

  if (output.success) {
    for (const { path, size } of output.outputs) {
      console.log(`\n${path}  ${size}`)
    }

    console.log(`File change detected. Starting incremental compilation...`)
  } else {
    for (const log of output.logs) {
      console.log(log)
    }
  }
  console.log(
    `[${new Date().toLocaleTimeString()}] File change detected. Starting incremental compilation...`
  )
}

build()

export default build
