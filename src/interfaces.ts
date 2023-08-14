// todo: this should be split into more files gruoped by functionality in the future

export interface BlockchainEvent {
  id: string
  name: string
  txHash: string
  blockHeight: number
  blockHash: string
  inputs: Array<string | bigint>
  txIndex: number
  created: number
}

export interface DbBlockchain {
  id: number
  name: string
  symbol: string
  blockHeight: number | null
}
