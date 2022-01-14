import { build } from 'esbuild'
import { defaultOptionsForCli, defaultOptionsForViewer } from './default'

build({
  ...defaultOptionsForViewer,
}).catch(() => process.exit(1))

build({
  ...defaultOptionsForCli,
}).catch(() => process.exit(1))
