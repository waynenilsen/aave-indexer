import { type Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { type BlockchainEvent, type DbBlockchain } from './interfaces.ts'

// todo: eventually this will be split into more domain specific files

// todo: is this how we want to handle our database connection by passing by argument? Dependency injection may
//  be preferable.

// todo: do we want to wrap the database object here? do we want to wrap the data access layer for future testing?
export async function getConnection (): Promise<Database> {
  return await open({
    filename: './database.db',
    driver: sqlite3.Database
  })
}

export async function getBlockchains (db: Database): Promise<DbBlockchain[]> {
  return await db.all('SELECT * FROM blockchains')
}

export async function insertBlockchainEvents (db: Database, blockchainEvents: BlockchainEvent[]): Promise<void> {
  // todo: i started running out of time here but this should happen in batch
  // - it should also link to the blockchains table
  // - it should also check for duplicates and/or use the database to detect them and prevent them
  const stmt = await db.prepare('INSERT INTO blockchain_events (id, name, txHash, blockHeight, blockHash, inputs, txIndex, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  for (const blockchainEvent of blockchainEvents) {
    await stmt.run(blockchainEvent.id, blockchainEvent.name, blockchainEvent.txHash, blockchainEvent.blockHeight, blockchainEvent.blockHash, JSON.stringify(blockchainEvent.inputs), blockchainEvent.txIndex, blockchainEvent.created)
  }
  await stmt.finalize()
}

export async function getAllBlockchainEvents (db: Database): Promise<BlockchainEvent[]> {
  const raw = await db.all('SELECT * FROM blockchain_events ORDER BY id')
  return raw.map((row) => {
    return {
      id: row.id,
      name: row.name,
      txHash: row.txHash,
      blockHeight: row.blockHeight,
      blockHash: row.blockHash,
      inputs: JSON.parse(row.inputs),
      txIndex: row.txIndex,
      created: row.created
    }
  })
}

export async function deleteAllBlockchainEvents (db: Database): Promise<void> {
  await db.run('DELETE FROM blockchain_events')
}
