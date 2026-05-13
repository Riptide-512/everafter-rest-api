import { Hono } from 'hono'
import { sendCollection } from '../utils/response.js'

const services = new Hono()

const staticTools = [
  {
    id: 'guest-list',
    name: 'Guest List',
    description: 'Manage invitations, RSVPs, and guest details.',
  },
  {
    id: 'gift-registry',
    name: 'Gift Registry',
    description: 'Create and share your event gift registry with guests.',
  },
  {
    id: 'planning-dashboard',
    name: 'Planning Dashboard',
    description: 'Track tasks, progress, and milestones for your event.',
  },
]

services.get('/', async (c) => {
  return sendCollection(c, staticTools)
})

export default services
