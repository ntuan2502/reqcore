import type { MaybeRefOrGetter } from 'vue'

/**
 * Composable for a single candidate detail with update and delete mutations.
 * Wraps `useFetch('/api/candidates/:id')` with a reactive key.
 */
export function useCandidate(id: MaybeRefOrGetter<string>) {
  const candidateId = computed(() => toValue(id))

  const { data: candidate, status, error, refresh } = useFetch(
    () => `/api/candidates/${candidateId.value}`,
    {
      key: computed(() => `candidate-${candidateId.value}`),
      headers: useRequestHeaders(['cookie']),
    },
  )

  /** Update candidate fields (partial) and refresh both detail and list caches */
  async function updateCandidate(payload: Partial<{
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }>) {
    const updated = await $fetch(`/api/candidates/${candidateId.value}`, {
      method: 'PATCH',
      body: payload,
    })
    await refresh()
    await refreshNuxtData('candidates')
    return updated
  }

  /** Delete this candidate and navigate back to the list */
  async function deleteCandidate() {
    await $fetch(`/api/candidates/${candidateId.value}`, { method: 'DELETE' })
    await refreshNuxtData('candidates')
    await navigateTo('/dashboard/candidates')
  }

  return { candidate, status, error, refresh, updateCandidate, deleteCandidate }
}
