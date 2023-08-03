#!/usr/bin/env node

import { parse } from 'csv'
import { pipeline } from 'node:stream/promises'
import { Command } from 'commander'
import fs from 'node:fs/promises'
import path from 'node:path'
import { EOL } from 'node:os'
import * as url from 'node:url'

async function main() {
  const { version } = JSON.parse(await fs.readFile(path.join(new URL('.',
    import.meta.url).pathname, './package.json')))
  const program = new Command()

  program
    .name('csv-splitter')
    .description('This tool will split a csv file into multiple pages, each page will contain the headers from the original file')
    .option('-s, --size [size]', 'the size in rows of each "page"')
    .option('--noHeaders', 'specify this if the original file does not have headers')
    .version(version)
    .action(options => split(process.stdin, process.stdout, options))

  program.parse()
}

export default async function split(stdin, stdout, options) {
  if (options.size !== undefined) {
    options.size = parseInt(options.size)
  }

  if (options.size === 0 || isNaN(options.size)) {
    throw new Error('cannot specify zero size')
  }

  await pipeline(
    stdin,
    parse({ delimiter: ',' }),
    options.noHeaders ? processChunkNoHeaders(options.size) : processChunk(options.size),
    stdout
  )
}

function processChunk(size) {
  return async function*(stream) {
    let lineNumber = 0
    let headers = undefined

    for await (const chunk of stream.iterator({ destroyOnReturn: false })) {
      headers = chunk.toString('utf8')
      yield `${headers}`
      break
    }

    for await (const chunk of stream.iterator({ destroyOnReturn: true })) {
      if (++lineNumber > 0) {
        yield `${EOL}`
      }

      if (lineNumber > size) {
        yield `${EOL}${headers}${EOL}`
        lineNumber = 0
      }

      yield `${chunk.toString('utf8')}`
    }
  }
}

function processChunkNoHeaders(size) {
  return async function*(stream) {
    let lineNumber = 0
    for await (const chunk of stream) {
      if (lineNumber > 0) {
        yield `${EOL}`
      }

      if (lineNumber === size) {
        yield `${EOL}`
        lineNumber = 0
      }

      yield `${chunk.toString('utf8')}`
      lineNumber++
    }
  }
}

function isMainModule() {
  if (import.meta.url.startsWith('file:')) {
    const modulePath = url.fileURLToPath(import.meta.url)
    return process.argv[1] === modulePath
  }

  return false
}

if (isMainModule()) {
  main()
}