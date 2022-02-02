import type { ImportDeclaration } from '@typescript-eslint/types/dist/ast-spec'
import fs from 'fs'
import path from 'path'
import { Alias, Config } from './types'

export const resolveFinalConfig = (config: Config): Required<Config> => {
  const finalConfig: Required<Config> = {
    mode: 'local',
    vscode: true,
    alias: [],
  }
  if (config) {
    finalConfig.mode = config.mode || 'server'
    finalConfig.vscode = config.vscode === undefined ? true : config.vscode
    finalConfig.alias = config.alias || []
  }
  console.log(finalConfig)
  return finalConfig
}

export const resolveAlias = (
  alias: Alias[],
  dir: string,
  importDec: ImportDeclaration
) => {
  for (const { find, replacement } of alias) {
    if (importDec.source.value.startsWith(find)) {
      const replaced = importDec.source.value.replace(find, replacement)

      if (path.isAbsolute(replaced)) {
        return importDec.source.value.replace(find, replacement)
      } else {
        return path.resolve(dir, replaced)
      }
    }
  }

  return path.resolve(dir, importDec.source.value)
}

export const loadVite = async (): Promise<any> => {
  try {
    const config = fs.readFileSync((path.resolve(), 'vite.config.ts'))
    const fallbackPaths = require.resolve.paths?.('vite') || []
    const resolved = require.resolve('vite', {
      paths: [...fallbackPaths],
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vite = require(resolved)
    const resolvedConfig = await vite.resolveConfig(config, 'serve')

    return resolvedConfig.resolve.alias
      ? resolvedConfig.resolve.alias.filter(
          (alias: any) => typeof alias.find === 'string'
        )
      : resolvedConfig.resolve.alias
  } catch (e) {
    // Not founcd vite dependency.
    return
  }
}
