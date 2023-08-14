import { InfuraProvider } from 'ethers'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function getProvider (_blockchain_key: string): InfuraProvider {
  // todo: at some point add some other blockchains in here, for now ethereum is our only blockchain
  // we are going to use infura here, get a free project id from infura.com

  const projectId = process.env['INFURA_PROJECT_ID']
  if (projectId === undefined) {
    throw new Error('INFURA_PROJECT_ID is not set in the environment variables')
  }

  return new InfuraProvider(
    {
      name: 'mainnet',
      chainId: 1
    }, projectId
  )
}
