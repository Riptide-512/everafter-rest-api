import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { projects } from './schema.js'

export async function listServices(db, userId) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(asc(projects.id))
}

export async function getServiceById(db, id, userId) {
  const [service] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))

  return service || null
}

export async function createService(db, userId, input) {
  const timestamp = nowIso()
  const values = {
    name: input.name.trim(),
    description: input.description?.trim() || '',
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const [created] = await db.insert(projects).values(values).returning()
  return created
}

export async function updateService(db, id, userId, input) {
  const values = {
    updatedAt: nowIso(),
    ...('name' in input ? { name: input.name.trim() } : {}),
    ...('description' in input
      ? { description: input.description.trim() }
      : {}),
  }

  const [updated] = await db
    .update(projects)
    .set(values)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning()

  return updated || null
}

export async function deleteService(db, id, userId) {
  const deleted = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id })

  return deleted.length > 0
}
