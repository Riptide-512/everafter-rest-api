import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  listGuestItems,
  createGuest,
  getGuestByIdForUser,
  updateGuest,
  deleteGuest,
} from '../data/guest-list.repository.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import {
  parseIdParam,
  validateGuestListCreate,
  validateGuestListPatch,
} from '../utils/validation.js'

const guestList = new Hono()

guestList.get('/', async (c) => {
  const userId = c.get('user').sub
  const db = getDb(c.env.DB)
  const data = await listGuestItems(db, userId)
  return sendCollection(c, data)
})

guestList.post('/', async (c) => {
  const userId = c.get('user').sub
  const payload = await parseJsonBody(c)
  const details = validateGuestListCreate(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const guest = await createGuest(db, userId, payload)

  c.header('Location', `/api/guest-list/${guest.id}`)
  return sendResource(c, guest, 201)
})

guestList.patch('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)
  const details = validateGuestListPatch(payload)

  if (details.length > 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Some fields are invalid.',
      details,
    )
  }

  const db = getDb(c.env.DB)
  const updatedGuest = await updateGuest(db, id, userId, payload)

  if (!updatedGuest) {
    throw new ApiError(404, 'NOT_FOUND', 'Guest not found.')
  }

  return sendResource(c, updatedGuest)
})

guestList.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const deleted = await deleteGuest(db, id, userId)

  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Guest not found.')
  }

  return c.body(null, 204)
})

export default guestList
