#!/usr/bin/env node
import chalk from 'chalk'
import { program } from 'commander'
import path from 'path'
import { CONFIG_FILE_NAME } from './constants'
import { main } from './main'

program.parse(process.argv)

if (program.args[0]) {
  let config = null
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  try {
    config = require(path.resolve(path.resolve(), CONFIG_FILE_NAME))
  } catch (event) {
    console.log(
      chalk.yellow(
        `The options can be specified by preparing '${CONFIG_FILE_NAME}'.`
      )
    )
  }
  main(program.args[0], config || {})
}
