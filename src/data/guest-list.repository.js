import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { guestList } from './schema.js'

function normalizeGuestInput(input) {
  return {
    name: input.name.trim(),
    count: input.count,
    notes: input.notes?.trim() || '',
    rsvpConfirmed: input.rsvpConfirmed ? 1 : 0,
  }
}

export async function listGuestItems(db, userId) {
  return db
    .select()
    .from(guestList)
    .where(eq(guestList.userId, userId))
    .orderBy(asc(guestList.id))
}

export async function getGuestByIdForUser(db, id, userId) {
  const [guest] = await db
    .select()
    .from(guestList)
    .where(and(eq(guestList.id, id), eq(guestList.userId, userId)))

  return guest || null
}

export async function createGuest(db, userId, input) {
  const timestamp = nowIso()
  const values = {
    ...normalizeGuestInput(input),
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.insert(guestList).values(values).run()

  const [guest] = await db
    .select()
    .from(guestList)
    .where(
      and(
        eq(guestList.userId, userId),
        eq(guestList.name, values.name),
        eq(guestList.createdAt, values.createdAt),
      ),
    )

  if (!guest) {
    throw new Error('Failed to create guest list item.')
  }

  return guest
}

export async function updateGuest(db, id, userId, input) {
  const values = {
    updatedAt: nowIso(),
    ...('name' in input ? { name: input.name.trim() } : {}),
    ...('count' in input ? { count: input.count } : {}),
    ...('notes' in input ? { notes: input.notes.trim() } : {}),
    ...('rsvpConfirmed' in input
      ? { rsvpConfirmed: input.rsvpConfirmed ? 1 : 0 }
      : {}),
  }

  await db
    .update(guestList)
    .set(values)
    .where(and(eq(guestList.id, id), eq(guestList.userId, userId)))
    .run()

  return getGuestByIdForUser(db, id, userId)
}

export async function deleteGuest(db, id, userId) {
  const result = await db
    .delete(guestList)
    .where(and(eq(guestList.id, id), eq(guestList.userId, userId)))
    .run()

  const deletedRows =
    result.numDeletedRows ?? result.changes ?? result.rowCount ?? 0

  return deletedRows > 0
}
