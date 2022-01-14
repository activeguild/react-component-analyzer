import { build } from 'esbuild'
import { defaultOptionsForCli, defaultOptionsForViewer } from './default'

build({
  ...defaultOptionsForViewer,
  watch: {
    onRebuild: (error) => {
      if (error) {
        console.log('error :>> ', error)
      } else {
        console.log('Build viewer success!!')
      }
    },
  },
})
  .catch(() => process.exit(1))
  .then(() => {
    console.log('===========================================')
    console.log(`${new Date().toLocaleString()}:viewer watching...`)
  })

build({
  ...defaultOptionsForCli,
  watch: {
    onRebuild: (error) => {
      if (error) {
        console.log('error :>> ', error)
      } else {
        console.log('Build cli success!!')
      }
    },
  },
})
  .catch(() => process.exit(1))
  .then(() => {
    console.log('===========================================')
    console.log(`${new Date().toLocaleString()}:cli watching...`)
  })
