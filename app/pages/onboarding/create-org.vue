<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Create Organization — Applirank',
  description: 'Create your organization to start recruiting',
})

const orgName = ref('')
const slug = ref('')
const slugEdited = ref(false)
const error = ref('')
const isLoading = ref(false)

/** Auto-generate slug from org name unless user has manually edited it */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

watch(orgName, (newName) => {
  if (!slugEdited.value) {
    slug.value = generateSlug(newName)
  }
})

function onSlugInput() {
  slugEdited.value = true
}

async function handleCreateOrg() {
  error.value = ''

  if (!orgName.value.trim()) {
    error.value = 'Organization name is required.'
    return
  }

  if (!slug.value.trim()) {
    error.value = 'Slug is required.'
    return
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug.value)) {
    error.value = 'Slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen.'
    return
  }

  isLoading.value = true

  try {
    const { createOrg } = useCurrentOrg()
    await createOrg({ name: orgName.value.trim(), slug: slug.value.trim() })
  }
  catch (err: any) {
    error.value = err?.message ?? 'Failed to create organization. The slug may already be taken.'
    isLoading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleCreateOrg">
    <h2 class="text-xl font-semibold text-center text-surface-900 dark:text-surface-100">Create your organization</h2>
    <p class="text-sm text-surface-500 dark:text-surface-400 text-center mb-2">
      Set up your workspace to start managing candidates and jobs.
    </p>

    <div v-if="error" class="rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 p-3 text-sm text-danger-700 dark:text-danger-400">{{ error }}</div>

    <label class="flex flex-col gap-1 text-sm font-medium text-surface-700 dark:text-surface-300">
      <span>Organization name</span>
      <input
        v-model="orgName"
        type="text"
        placeholder="Acme Corp"
        required
        class="px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-md text-sm text-surface-900 dark:text-surface-100 bg-white dark:bg-surface-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
      />
    </label>

    <label class="flex flex-col gap-1 text-sm font-medium text-surface-700 dark:text-surface-300">
      <span>Slug</span>
      <input
        v-model="slug"
        type="text"
        placeholder="acme-corp"
        required
        class="px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-md text-sm text-surface-900 dark:text-surface-100 bg-white dark:bg-surface-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        @input="onSlugInput"
      />
      <span class="text-xs font-normal text-surface-400">Used in URLs. Lowercase letters, numbers, and hyphens only.</span>
    </label>

    <button
      type="submit"
      :disabled="isLoading"
      class="mt-2 px-4 py-2.5 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {{ isLoading ? 'Creating…' : 'Create organization' }}
    </button>
  </form>
</template>


