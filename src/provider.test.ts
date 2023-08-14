import { describe, expect, test } from '@jest/globals'
import { getProvider } from './provider.ts'

describe('providers', () => {
  test('can connect and get latest block', async () => {
    const provider = getProvider('ETH')
    const block = await provider.getBlock('latest')
    expect(block).toBeDefined()
  })
})
