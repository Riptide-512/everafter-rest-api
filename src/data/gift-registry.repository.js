import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { giftRegistry } from './schema.js'

function normalizeGiftInput(input) {
  return {
    name: input.name.trim(),
    store: input.store?.trim() || '',
    link: input.link.trim(),
    price: input.price ?? 0,
    priority: input.priority || 'Medium',
    purchased: input.purchased ? 1 : 0,
  }
}

export async function listGiftItems(db, userId) {
  return db
    .select()
    .from(giftRegistry)
    .where(eq(giftRegistry.userId, userId))
    .orderBy(asc(giftRegistry.id))
}

export async function getGiftByIdForUser(db, id, userId) {
  const [gift] = await db
    .select()
    .from(giftRegistry)
    .where(and(eq(giftRegistry.id, id), eq(giftRegistry.userId, userId)))

  return gift || null
}

export async function createGift(db, userId, input) {
  const timestamp = nowIso()
  const values = {
    ...normalizeGiftInput(input),
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.insert(giftRegistry).values(values).run()

  const [gift] = await db
    .select()
    .from(giftRegistry)
    .where(
      and(
        eq(giftRegistry.userId, userId),
        eq(giftRegistry.name, values.name),
        eq(giftRegistry.createdAt, values.createdAt),
      ),
    )

  if (!gift) {
    throw new Error('Failed to create gift registry item.')
  }

  return gift
}

export async function updateGift(db, id, userId, input) {
  const values = {
    updatedAt: nowIso(),
    ...('name' in input ? { name: input.name.trim() } : {}),
    ...('store' in input ? { store: input.store.trim() } : {}),
    ...('link' in input ? { link: input.link.trim() } : {}),
    ...('price' in input ? { price: input.price ?? 0 } : {}),
    ...('priority' in input ? { priority: input.priority } : {}),
    ...('purchased' in input ? { purchased: input.purchased ? 1 : 0 } : {}),
  }

  await db
    .update(giftRegistry)
    .set(values)
    .where(and(eq(giftRegistry.id, id), eq(giftRegistry.userId, userId)))
    .run()

  return getGiftByIdForUser(db, id, userId)
}

export async function deleteGift(db, id, userId) {
  const result = await db
    .delete(giftRegistry)
    .where(and(eq(giftRegistry.id, id), eq(giftRegistry.userId, userId)))
    .run()

  const deletedRows =
    result.numDeletedRows ?? result.changes ?? result.rowCount ?? 0

  return deletedRows > 0
}
