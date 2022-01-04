import { Config } from './types'

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
