#!/usr/bin/env node
import dotenv from 'dotenv'
import { serve } from './server.ts'
import { migrate } from './migrate.ts'

dotenv.config()

// @ts-expect-error BigInt is not supported by JSON
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  return this.toString()
}

async function main (): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]
  if (command === undefined) {
    console.log('Usage: <command> [options]')
    console.log('Commands:')
    console.log('  serve')
    console.log('  migrate')
    return
  }

  if (command === 'serve') {
    serve()
  } else if (command === 'migrate') {
    await migrate()
  } else {
    console.log(`Unknown command: ${command}`)
  }
}

await main()
