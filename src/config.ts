import type { ImportDeclaration } from '@typescript-eslint/types/dist/ast-spec'
import path from 'path'
import { Alias, Config } from './types'

export const resolveFinalConfig = (config: Config): Required<Config> => {
  const finalConfig: Required<Config> = {
    vscode: true,
    alias: [],
  }
  if (config) {
    finalConfig.vscode = config.vscode === undefined ? true : config.vscode
    finalConfig.alias = config.alias || []
  }
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
