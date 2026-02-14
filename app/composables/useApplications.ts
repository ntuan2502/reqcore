import type { Ref } from 'vue'

/**
 * Composable for managing the applications list with filtering, pagination, and mutations.
 * Wraps `useFetch('/api/applications')` with a singleton key for shared state.
 */
export function useApplications(options?: {
  jobId?: Ref<string | undefined> | string
  candidateId?: Ref<string | undefined> | string
  status?: Ref<string | undefined> | string
}) {
  const query = computed(() => ({
    ...(toValue(options?.jobId) && { jobId: toValue(options?.jobId) }),
    ...(toValue(options?.candidateId) && { candidateId: toValue(options?.candidateId) }),
    ...(toValue(options?.status) && { status: toValue(options?.status) }),
  }))

  const { data, status: fetchStatus, error, refresh } = useFetch('/api/applications', {
    key: 'applications',
    query,
    headers: useRequestHeaders(['cookie']),
  })

  const applications = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.total ?? 0)

  /** Create a new application (link candidate → job) and refresh the list */
  async function createApplication(payload: {
    candidateId: string
    jobId: string
    notes?: string
  }) {
    const created = await $fetch('/api/applications', {
      method: 'POST',
      body: payload,
    })
    await refresh()
    return created
  }

  return {
    applications,
    total,
    fetchStatus,
    error,
    refresh,
    createApplication,
  }
}
