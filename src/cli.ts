#!/usr/bin/env node
import { program } from 'commander'
import path from 'path'
import { main } from './main'

program.parse(process.argv)

if (program.args[0]) {
  let config = null
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  try {
    config = require(path.resolve(path.resolve(), 'virot.config.js'))
  } catch (event) {
    console.log(event)
  }
  main(program.args[0], config || [])
}
