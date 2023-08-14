import { getConnection } from './db.ts'

export async function migrate (): Promise<void> {
  const db = await getConnection()
  await db.migrate({})
}
