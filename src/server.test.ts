import { afterEach, describe, expect, jest, test } from '@jest/globals'
import DatabaseService from './db.ts'
import { Server } from './server.ts'
import Sinon from 'sinon'
import { type Response } from 'express'
import { getMockReq, getMockRes } from '@jest-mock/express'

describe('server', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ingestBlock', () => {
    describe('bad input', () => {
      // Define your test cases in an array of objects
      const testCases = [
        {
          bad: 'blockchainKey',
          params: {
            contractAddress: '0x123',
            blockNumber: '1'
          },
          errorMessage: 'BlockchainKey is required'
        },
        {
          bad: 'contractAddress',
          params: {
            blockchainKey: 'ETH',
            blockNumber: '1'
          },
          errorMessage: 'ContractAddress is required'
        },
        {
          bad: 'blockNumber',
          params: {
            blockchainKey: 'ETH',
            contractAddress: '0x123'
          },
          errorMessage: 'BlockNumber is required'
        },
        {
          bad: 'blockNumber',
          params: {
            blockchainKey: 'ETH',
            contractAddress: '0x123',
            blockNumber: 'not a number'
          },
          errorMessage: 'BlockNumber is not a number'
        }
      ]

      // Loop over each test case and execute the test
      testCases.forEach(testCase => {
        test(`${testCase.bad} is required`, async () => {
          const req = getMockReq({ params: testCase.params })
          const resp = getMockRes()

          const server = new Server(Sinon.createStubInstance(DatabaseService))

          await expect(server.handleIngestBlockWithInputValidation(req, resp as unknown as Response)).rejects.toThrow(testCase.errorMessage)
        })
      })
    })
  })
})
