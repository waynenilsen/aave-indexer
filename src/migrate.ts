import DatabaseService from './db.ts'

export async function migrate (): Promise<void> {
  const db = await DatabaseService.getInstance()
  await db.migrate()
}
