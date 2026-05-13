import { z } from 'zod'
import { ApiError } from './errors.js'
import { TASK_PRIORITIES, TASK_STATUSES } from './constants.js'

const statusMessage = `Status must be one of: ${TASK_STATUSES.join(', ')}.`
const priorityMessage = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}.`

const idParamSchema = z
  .string()
  .regex(/^\d+$/, { error: 'ID must be a positive integer.' })
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value) && value > 0, {
    error: 'ID must be a positive integer.',
  })

const projectCreateSchema = z.strictObject({
  name: z
    .string({ error: 'Project name is required.' })
    .trim()
    .min(1, { error: 'Project name is required.' }),
  description: z.string({ error: 'Description must be a string.' }).optional(),
})

const projectPatchSchema = z
  .strictObject({
    name: z
      .string({ error: 'Project name must be a non-empty string.' })
      .trim()
      .min(1, { error: 'Project name must be a non-empty string.' })
      .optional(),
    description: z
      .string({ error: 'Description must be a string.' })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

const taskCreateSchema = z.strictObject({
  title: z
    .string({ error: 'Task name is required.' })
    .trim()
    .min(1, { error: 'Task name is required.' }),
  description: z.string({ error: 'Description must be a string.' }).optional(),
  status: z
    .string({ error: statusMessage })
    .refine((value) => TASK_STATUSES.includes(value), { error: statusMessage })
    .optional(),
  priority: z
    .string({ error: priorityMessage })
    .refine((value) => TASK_PRIORITIES.includes(value), {
      error: priorityMessage,
    })
    .optional(),
})

const taskPatchSchema = z
  .strictObject({
    title: z
      .string({ error: 'Task title must be a non-empty string.' })
      .trim()
      .min(1, { error: 'Task title must be a non-empty string.' })
      .optional(),
    description: z
      .string({ error: 'Description must be a string.' })
      .optional(),
    status: z
      .string({ error: statusMessage })
      .refine((value) => TASK_STATUSES.includes(value), {
        error: statusMessage,
      })
      .optional(),
    priority: z
      .string({ error: priorityMessage })
      .refine((value) => TASK_PRIORITIES.includes(value), {
        error: priorityMessage,
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

const guestListCreateSchema = z.strictObject({
  name: z
    .string({ error: 'Guest name is required.' })
    .trim()
    .min(1, { error: 'Guest name is required.' }),
  count: z
    .number({ invalid_type_error: 'Guest count is required.' })
    .int({ error: 'Guest count must be an integer.' })
    .min(1, { error: 'Guest count must be at least 1.' }),
  notes: z.string({ error: 'Notes must be a string.' }).optional(),
  rsvpConfirmed: z
    .boolean({ error: 'RSVP confirmed must be a boolean.' })
    .optional(),
})

const guestListPatchSchema = z
  .strictObject({
    name: z
      .string({ error: 'Guest name must be a non-empty string.' })
      .trim()
      .min(1, { error: 'Guest name must be a non-empty string.' })
      .optional(),
    count: z
      .number({ invalid_type_error: 'Guest count must be an integer.' })
      .int({ error: 'Guest count must be an integer.' })
      .min(1, { error: 'Guest count must be at least 1.' })
      .optional(),
    notes: z.string({ error: 'Notes must be a string.' }).optional(),
    rsvpConfirmed: z
      .boolean({ error: 'RSVP confirmed must be a boolean.' })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

const giftRegistryCreateSchema = z.strictObject({
  name: z
    .string({ error: 'Gift name is required.' })
    .trim()
    .min(1, { error: 'Gift name is required.' }),
  store: z.string({ error: 'Store must be a string.' }).optional(),
  link: z
    .string({ error: 'Product link is required.' })
    .url({ error: 'Product link must be a valid URL.' }),
  price: z
    .number({ invalid_type_error: 'Price must be a number.' })
    .min(0, { error: 'Price must be at least 0.' })
    .optional(),
  priority: z
    .enum(['Low', 'Medium', 'High'], {
      error: 'Priority must be Low, Medium, or High.',
    })
    .optional(),
  purchased: z.boolean({ error: 'Purchased must be a boolean.' }).optional(),
})

const giftRegistryPatchSchema = z
  .strictObject({
    name: z
      .string({ error: 'Gift name must be a non-empty string.' })
      .trim()
      .min(1, { error: 'Gift name must be a non-empty string.' })
      .optional(),
    store: z.string({ error: 'Store must be a string.' }).optional(),
    link: z
      .string({ error: 'Product link must be a valid URL.' })
      .url({ error: 'Product link must be a valid URL.' })
      .optional(),
    price: z
      .number({ invalid_type_error: 'Price must be a number.' })
      .min(0, { error: 'Price must be at least 0.' })
      .optional(),
    priority: z
      .enum(['Low', 'Medium', 'High'], {
        error: 'Priority must be Low, Medium, or High.',
      })
      .optional(),
    purchased: z.boolean({ error: 'Purchased must be a boolean.' }).optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

export function parseIdParam(rawValue, fieldName = 'id') {
  const result = idParamSchema.safeParse(rawValue)

  if (!result.success) {
    throw new ApiError(400, 'BAD_REQUEST', 'Malformed request.', [
      {
        field: fieldName,
        issue:
          result.error.issues[0]?.message || 'ID must be a positive integer.',
      },
    ])
  }

  return result.data
}

function mapZodIssuesToDetails(issues) {
  const details = []

  for (const issue of issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) {
        details.push({ field: key, issue: 'Field is not allowed.' })
      }
      continue
    }

    if (issue.code === 'invalid_type' && issue.path.length === 0) {
      details.push({
        field: 'body',
        issue: 'Request body must be a JSON object.',
      })
      continue
    }

    const field = issue.path.length > 0 ? issue.path.join('.') : 'body'
    details.push({ field, issue: issue.message })
  }

  return details
}

const registerSchema = z.strictObject({
  email: z.email({ error: 'Email must be a valid email address.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(8, { error: 'Password must be at least 8 characters.' }),
})

const loginSchema = z.strictObject({
  email: z.email({ error: 'Email must be a valid email address.' }),
  password: z.string({ error: 'Password is required.' }).min(1, {
    error: 'Password is required.',
  }),
})

const refreshSchema = z.strictObject({
  refresh_token: z
    .string({ error: 'Refresh token is required.' })
    .min(1, { error: 'Refresh token is required.' }),
})

const logoutSchema = z.strictObject({
  refresh_token: z
    .string({ error: 'Refresh token is required.' })
    .min(1, { error: 'Refresh token is required.' }),
})

function validateWithSchema(payload, schema) {
  const result = schema.safeParse(payload)

  if (result.success) {
    return []
  }

  return mapZodIssuesToDetails(result.error.issues)
}

export function validateProjectCreate(payload) {
  return validateWithSchema(payload, projectCreateSchema)
}

export function validateProjectPatch(payload) {
  return validateWithSchema(payload, projectPatchSchema)
}

export function validateTaskCreate(payload) {
  return validateWithSchema(payload, taskCreateSchema)
}

export function validateTaskPatch(payload) {
  return validateWithSchema(payload, taskPatchSchema)
}

export function validateGuestListCreate(payload) {
  return validateWithSchema(payload, guestListCreateSchema)
}

export function validateGuestListPatch(payload) {
  return validateWithSchema(payload, guestListPatchSchema)
}

export function validateGiftRegistryCreate(payload) {
  return validateWithSchema(payload, giftRegistryCreateSchema)
}

export function validateGiftRegistryPatch(payload) {
  return validateWithSchema(payload, giftRegistryPatchSchema)
}

export function validateRegister(payload) {
  return validateWithSchema(payload, registerSchema)
}

export function validateLogin(payload) {
  return validateWithSchema(payload, loginSchema)
}

export function validateRefresh(payload) {
  return validateWithSchema(payload, refreshSchema)
}

export function validateLogout(payload) {
  return validateWithSchema(payload, logoutSchema)
}
