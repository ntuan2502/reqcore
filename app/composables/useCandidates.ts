import type { Ref } from 'vue'

/**
 * Composable for managing the candidates list with search, pagination, and mutations.
 * Wraps `useFetch('/api/candidates')` with a singleton key for shared state.
 */
export function useCandidates(options?: {
  search?: Ref<string | undefined> | string
}) {
  const query = computed(() => ({
    ...(toValue(options?.search) && { search: toValue(options?.search) }),
  }))

  const { data, status: fetchStatus, error, refresh } = useFetch('/api/candidates', {
    key: 'candidates',
    query,
    headers: useRequestHeaders(['cookie']),
  })

  const candidates = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.total ?? 0)

  /** Create a new candidate and refresh the list */
  async function createCandidate(payload: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }) {
    const created = await $fetch('/api/candidates', {
      method: 'POST',
      body: payload,
    })
    await refresh()
    return created
  }

  /** Delete a candidate by ID and refresh the list */
  async function deleteCandidate(id: string) {
    await $fetch(`/api/candidates/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return {
    candidates,
    total,
    fetchStatus,
    error,
    refresh,
    createCandidate,
    deleteCandidate,
  }
}
