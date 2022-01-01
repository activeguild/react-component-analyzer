#!/usr/bin/env node
import { program } from 'commander'
import path from 'path'
import { main } from './main'

program.parse(process.argv)

if (program.args[0]) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const json = require(path.resolve(path.resolve(), 'virot.config.js'))
  main(program.args[0], json.alias)
}
