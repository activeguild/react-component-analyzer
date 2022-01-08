/* eslint-disable @typescript-eslint/no-var-requires */
import { build } from 'esbuild'
import { prismPlugin } from 'esbuild-plugin-prismjs'

build({
  entryPoints: ['./src/viewer.tsx'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['esnext'],
  plugins: [
    prismPlugin({
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
}).catch(() => process.exit(1))

build({
  entryPoints: ['./src/cli.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  platform: 'node',
}).catch(() => process.exit(1))
