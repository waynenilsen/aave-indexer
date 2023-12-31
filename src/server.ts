import express, { type Express, type Request, type Response } from 'express'
import pug from 'pug'
import asyncHandler from 'express-async-handler'
import { ethers, type EventLog } from 'ethers'
import { getProvider } from './provider.ts'
import * as fs from 'fs'
import { type BlockchainEvent } from './interfaces.ts'
import crypto from 'crypto'
import DatabaseService from './db.ts'

export class Server {
  db: DatabaseService

  constructor (db: DatabaseService) {
    this.db = db
  }

  registerHandleIngestBlock (app: Express): void {
    app.post('/ingest_block/:blockchainKey/:blockNumber/:contractAddress', asyncHandler(async (req, resp) => {
      await this.handleIngestBlockWithInputValidation(req, resp)
    }))
  }

  async handleIngestBlockWithInputValidation (req: Request, resp: Response): Promise<void> {
    // todo: consider validation framework
    const blockchainKey = req.params['blockchainKey']
    if (blockchainKey === undefined) {
      throw new Error('BlockchainKey is required')
    }
    if (blockchainKey !== 'ETH') {
      throw new Error('BlockchainKey is not supported')
    }

    const contractAddress = req.params['contractAddress']
    if (contractAddress === undefined) {
      throw new Error('ContractAddress is required')
    }

    const blockNumber = req.params['blockNumber']
    if (blockNumber === undefined) {
      throw new Error('BlockNumber is required')
    }

    // check block number value
    const blockNumberValue = parseInt(blockNumber)
    if (isNaN(blockNumberValue)) {
      throw new Error('BlockNumber is not a number')
    }

    const allLogs = await this.handleIngestBlock(blockchainKey, blockNumberValue, contractAddress)

    resp.send(allLogs)
  }

  async handleIngestBlock (blockchainKey: string, blockNumberValue: number, contractAddress: string): Promise<BlockchainEvent[]> {
    // todo: consider middleware for initialization of provider and db connection
    const provider = getProvider(blockchainKey)

    const fileContent = fs.readFileSync('./node_modules/@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json', 'utf8')
    const PoolV3Artifact = JSON.parse(fileContent)

    // note: we use require above it is documented in the readme for the package
    const abi = PoolV3Artifact.abi

    const poolContract = new ethers.Contract(contractAddress, abi, provider)
    const allLogs: BlockchainEvent[] = []

    // todo: there are many ways this could potentially be better but for now we will do this.
    // 1. parallelize the fetching of the logs
    // 2. attempt to fetch less by using batching into groups of 4 events each
    // 3. attempt to create a more complicated filter

    // for each abi entry
    for (const abiEntry of abi) {
      // if it is an event
      if (abiEntry.type !== 'event') {
        continue
      }
      // get the associated logs
      const logs = await poolContract.queryFilter(abiEntry.name, blockNumberValue, blockNumberValue)
      if (logs.length === 0) {
        continue
      }
      // zip up the abi entry inputs names with the values of the logs arguments
      const eventsFromLogs: BlockchainEvent[] = logs
        .map((log) => {
          return {
            id: crypto.randomUUID(),
            name: abiEntry.name,
            txHash: log.transactionHash,
            blockHeight: log.blockNumber,
            blockHash: log.blockHash,
            inputs: abiEntry.inputs.map((_: any, index: any) => {
              return (log as EventLog).args[index]
            }),
            txIndex: log.index,
            created: Date.now()
          }
        })

      allLogs.push(...eventsFromLogs)
    }

    const db = await DatabaseService.getInstance()
    await db.insertBlockchainEvents(allLogs)
    return allLogs
  }

  /**
     * Registers the handler for the home page
     * @param app
     */
  registerHandleHome (app: Express): void {
    app.get('/', (_req, res) => {
      const compiledFunction = pug.compileFile('./templates/index.html.pug')
      res.send(compiledFunction({}))
    })
  }

  /**
     * Creates the express app
     */
  private getApp (): Express {
    const app = express()
    this.registerHandleHome(app)
    this.registerHandleIngestBlock(app)
    return app
  }

  /**
     * Starts the server
     *
     * Note this is a blocking call and will not return until the server is stopped.
     */
  serve (): void {
    const app = this.getApp()

    const port = process.env['PORT']

    if (port === null || port === undefined) {
      throw new Error('Port is not set in PORT environment variable.')
    }

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`)
    })
  }
}
