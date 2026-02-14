import { eq, and } from 'drizzle-orm'
import { candidate } from '../../database/schema'
import { candidateIdParamSchema } from '../../utils/schemas/candidate'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const orgId = session.session.activeOrganizationId!

  const { id } = await getValidatedRouterParams(event, candidateIdParamSchema.parse)

  const [deleted] = await db.delete(candidate)
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, orgId)))
    .returning({ id: candidate.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setResponseStatus(event, 204)
  return null
})
