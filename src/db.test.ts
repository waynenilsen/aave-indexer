import { afterEach, beforeAll, describe, expect, test } from '@jest/globals'
import {
  deleteAllBlockchainEvents,
  getAllBlockchainEvents,
  getBlockchains,
  getConnection,
  insertBlockchainEvents
} from './db.ts'
import { type Database } from 'sqlite'
import * as crypto from 'crypto'
import { type BlockchainEvent } from './interfaces.js'

describe('db', () => {
  let db: Database

  beforeAll(async () => {
    db = await getConnection()
    await deleteAllBlockchainEvents(db)
  })

  afterEach(async () => {
    await deleteAllBlockchainEvents(db)
  })

  test('can connect to db', async () => {
    expect(db).toBeDefined()
  })

  test('can get blockchains', async () => {
    const blockchains = await getBlockchains(db)
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

    await insertBlockchainEvents(db, testEvents)
    // read them back

    const allEvents = await getAllBlockchainEvents(db)

    // expect them to be the same
    expect(allEvents).toHaveLength(2)
    expect(allEvents).toEqual(testEvents)
  })
})
