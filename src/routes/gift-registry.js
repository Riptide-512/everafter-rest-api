import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  listGiftItems,
  createGift,
  getGiftByIdForUser,
  updateGift,
  deleteGift,
} from '../data/gift-registry.repository.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import {
  parseIdParam,
  validateGiftRegistryCreate,
  validateGiftRegistryPatch,
} from '../utils/validation.js'

const giftRegistry = new Hono()

giftRegistry.get('/', async (c) => {
  const userId = c.get('user').sub
  const db = getDb(c.env.DB)
  const data = await listGiftItems(db, userId)
  return sendCollection(c, data)
})

giftRegistry.post('/', async (c) => {
  const userId = c.get('user').sub
  const payload = await parseJsonBody(c)
  const details = validateGiftRegistryCreate(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const gift = await createGift(db, userId, payload)

  c.header('Location', `/api/gift-registry/${gift.id}`)
  return sendResource(c, gift, 201)
})

giftRegistry.patch('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)
  const details = validateGiftRegistryPatch(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const updatedGift = await updateGift(db, id, userId, payload)

  if (!updatedGift) {
    throw new ApiError(404, 'NOT_FOUND', 'Gift item not found.')
  }

  return sendResource(c, updatedGift)
})

giftRegistry.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const deleted = await deleteGift(db, id, userId)

  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Gift item not found.')
  }

  return c.body(null, 204)
})

export default giftRegistry
