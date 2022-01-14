/* eslint-disable @typescript-eslint/no-var-requires */
import { build } from 'esbuild'
import { prismjsPlugin } from 'esbuild-plugin-prismjs'

build({
  entryPoints: ['./src/viewer.tsx'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['esnext'],
  plugins: [
    prismjsPlugin({
      languages: ['typescript', 'javascript', 'css', 'markup'],
      plugins: [
        'line-highlight',
        'line-numbers',
        'show-language',
        'copy-to-clipboard',
      ],
      theme: 'okaidia',
      css: true,
    }),
  ],
  loader: { '.png': 'dataurl' },
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
  entryPoints: ['./src/cli.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  platform: 'node',
  external: [
    'path',
    'chalk',
    'commander',
    'fs',
    '@typescript-eslint/typescript-estree',
  ],
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
