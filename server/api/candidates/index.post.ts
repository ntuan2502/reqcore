import { eq, and } from 'drizzle-orm'
import { candidate } from '../../database/schema'
import { createCandidateSchema } from '../../utils/schemas/candidate'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const orgId = session.session.activeOrganizationId!

  const body = await readValidatedBody(event, createCandidateSchema.parse)

  // Check for existing candidate with same email in this org
  const existing = await db.query.candidate.findFirst({
    where: and(
      eq(candidate.organizationId, orgId),
      eq(candidate.email, body.email),
    ),
    columns: { id: true },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A candidate with this email already exists',
    })
  }

  const [created] = await db.insert(candidate).values({
    organizationId: orgId,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
  }).returning()

  setResponseStatus(event, 201)
  return created
})
