import { afterEach, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseService } from './db.ts'
import * as crypto from 'crypto'
import { type BlockchainEvent } from './interfaces.js'

describe('db', () => {
  let db: DatabaseService

  beforeAll(async () => {
    db = await DatabaseService.getInstance()
  })

  afterEach(async () => {
    await db.deleteAllBlockchainEvents()
  })

  test('can get blockchains', async () => {
    const blockchains = await db.getBlockchains()
    expect(blockchains).toHaveLength(1)
    expect(blockchains).toBeDefined()
  })

  test('can insert blockchain events', async () => {
    const testEvents: BlockchainEvent[] = [
      {
        id: crypto.randomUUID(),
        name: 'test',
        txHash: '0x123',
        blockHeight: 1,
        blockHash: '0x123',
        inputs: ['0x123'],
        txIndex: 1,
        created: 1
      },
      {
        id: crypto.randomUUID(),
        name: 'test',
        txHash: '0x123',
        blockHeight: 1,
        blockHash: '0x123',
        inputs: ['0x123'],
        txIndex: 2,
        created: 1
      }
    ]
    // sort by id for consistent sorting
    testEvents.sort((a, b) => {
      return a.id.localeCompare(b.id)
    })

    await db.insertBlockchainEvents(testEvents)
    // read them back

    const allEvents = await db.getAllBlockchainEvents()

    // expect them to be the same
    expect(allEvents).toHaveLength(2)
    expect(allEvents).toEqual(testEvents)
  })
})
