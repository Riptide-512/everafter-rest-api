import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { tasks } from './schema.js'

function normalizeTaskCreateInput(userId, input) {
  const timestamp = nowIso()

  return {
    userId,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    status: input.status || 'todo',
    priority: input.priority || 'Medium',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export async function listTasksForUser(db, userId) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(asc(tasks.id))
}

export async function getTaskById(db, id) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id))
  return task || null
}

export async function createTask(db, userId, input) {
  const values = normalizeTaskCreateInput(userId, input)
  await db.insert(tasks).values(values).run()

  const [task] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.title, values.title),
        eq(tasks.createdAt, values.createdAt),
      ),
    )

  if (!task) {
    throw new Error('Failed to create task.')
  }

  return task
}

export async function updateTask(db, id, input) {
  const values = {
    updatedAt: nowIso(),
    ...('title' in input ? { title: input.title.trim() } : {}),
    ...('description' in input
      ? { description: input.description.trim() }
      : {}),
    ...('status' in input ? { status: input.status } : {}),
    ...('priority' in input ? { priority: input.priority } : {}),
  }

  await db.update(tasks).set(values).where(eq(tasks.id, id)).run()

  return getTaskById(db, id)
}

export async function deleteTask(db, id) {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).run()

  const deletedRows =
    result.numDeletedRows ?? result.changes ?? result.rowCount ?? 0

  return deletedRows > 0
}

export async function getTaskByIdForUser(db, id, userId) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  return task || null
}
