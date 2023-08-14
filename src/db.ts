import { type Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { type BlockchainEvent, type DbBlockchain } from './interfaces.ts'

// todo: eventually this will be split into more domain specific files

// todo: is this how we want to handle our database connection by passing by argument? Dependency injection may
//  be preferable.

export default class DatabaseService {
  db: Database
  static instance: DatabaseService | null = null

  constructor (db: Database) {
    this.db = db
  }

  /**
     * Get the instance of the database service, be careful where you use this, it should only be at the very
     * top level. Use constructor injection pattern to pass the instance around and do the required initializations.
     */
  public static async getInstance (): Promise<DatabaseService> {
    if (DatabaseService.instance === null) {
      DatabaseService.instance = new DatabaseService(await open({
        filename: './database.db',
        driver: sqlite3.Database
      }))
    }
    return DatabaseService.instance
  }

  async getBlockchains (): Promise<DbBlockchain[]> {
    return await this.db.all('SELECT * FROM blockchains ORDER BY id')
  }

  async insertBlockchainEvents (blockchainEvents: BlockchainEvent[]): Promise<void> {
    // todo: i started running out of time here but this should happen in batch
    // - it should also link to the blockchains table
    // - it should also check for duplicates and/or use the database to detect them and prevent them
    const stmt = await this.db.prepare('INSERT INTO blockchain_events (id, name, txHash, blockHeight, blockHash, inputs, txIndex, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    for (const blockchainEvent of blockchainEvents) {
      await stmt.run(blockchainEvent.id, blockchainEvent.name, blockchainEvent.txHash, blockchainEvent.blockHeight, blockchainEvent.blockHash, JSON.stringify(blockchainEvent.inputs), blockchainEvent.txIndex, blockchainEvent.created)
    }
    await stmt.finalize()
  }

  async getAllBlockchainEvents (): Promise<BlockchainEvent[]> {
    const raw = await this.db.all('SELECT * FROM blockchain_events ORDER BY id')
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

  async deleteAllBlockchainEvents (): Promise<void> {
    await this.db.run('DELETE FROM blockchain_events')
  }

  async migrate (): Promise<void> {
    await this.db.migrate({})
  }
}
