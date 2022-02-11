import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import type { BuildOptions } from 'esbuild'
import { prismjsPlugin } from 'esbuild-plugin-prismjs'
import postcss from 'postcss'

const processCss = async (css: string) => {
  const result = await postcss().process(css, {
    from: undefined /* suppress source map warning */,
  })

  return result.css
}
export const defaultOptionsForViewer: BuildOptions = {
  entryPoints: ['./src/viewer.tsx'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['esnext'],
  plugins: [
    vanillaExtractPlugin({ processCss }),
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
}

export const defaultOptionsForCli: BuildOptions = {
  entryPoints: ['./src/cli.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  platform: 'node',
  external: [
    'path',
    'picocolors',
    'commander',
    'fs',
    '@typescript-eslint/typescript-estree',
  ],
}
