#!/usr/bin/env node
import { program } from 'commander'
import path from 'path'
import pc from 'picocolors'
import { CONFIG_FILE_NAME } from './constants'
import { main } from './main'

program.parse(process.argv)

if (program.args[0]) {
  let config = null
  try {
    config = require(path.resolve(path.resolve(), CONFIG_FILE_NAME))
  } catch (event) {
    console.log(
      pc.yellow(
        `The options can be specified by preparing '${CONFIG_FILE_NAME}'.`
      )
    )
  }
  main(program.args[0], config || {})
}
