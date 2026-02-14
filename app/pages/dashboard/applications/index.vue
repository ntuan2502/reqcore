<script setup lang="ts">
import { FileText, Search, Filter, Calendar, User, Briefcase } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'require-org'],
})

useSeoMeta({
  title: 'Applications — Applirank',
  description: 'Manage applications across all jobs',
})

const statusFilter = ref<string | undefined>(undefined)

const { applications, total, fetchStatus, error, refresh } = useApplications({
  status: statusFilter,
})

const statuses = [
  { value: undefined, label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
]

const statusBadgeClasses: Record<string, string> = {
  new: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  screening: 'bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-400',
  interview: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400',
  offer: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400',
  hired: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
  rejected: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Applications</h1>
        <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Track candidates through your hiring pipeline.
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6">
      <div class="relative">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-surface-400" />
        <select
          v-model="statusFilter"
          class="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 pl-9 pr-8 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
        >
          <option v-for="s in statuses" :key="String(s.value)" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="fetchStatus === 'pending'" class="text-center py-12 text-surface-400">
      Loading applications…
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"
    >
      Failed to load applications. Please try again.
      <button class="underline ml-1" @click="refresh()">Retry</button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="applications.length === 0"
      class="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-12 text-center"
    >
      <FileText class="size-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
      <h3 class="text-base font-semibold text-surface-700 dark:text-surface-200 mb-1">
        {{ statusFilter ? 'No applications found' : 'No applications yet' }}
      </h3>
      <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
        {{ statusFilter
          ? 'Try changing the status filter.'
          : 'Applications will appear here when candidates apply to your jobs or when you manually link candidates.'
        }}
      </p>
    </div>

    <!-- Application list -->
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="app in applications"
        :key="app.id"
        :to="`/dashboard/applications/${app.id}`"
        class="flex items-center justify-between rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 py-3 hover:border-surface-300 dark:hover:border-surface-700 hover:shadow-sm transition-all group"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 transition-colors truncate">
              {{ app.candidateFirstName }} {{ app.candidateLastName }}
            </h3>
            <span class="text-xs text-surface-400">→</span>
            <span class="text-sm text-surface-600 dark:text-surface-300 truncate">
              {{ app.jobTitle }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs text-surface-400">
            <span class="inline-flex items-center gap-1">
              <User class="size-3" />
              {{ app.candidateEmail }}
            </span>
            <span class="inline-flex items-center gap-1">
              <Calendar class="size-3" />
              {{ new Date(app.createdAt).toLocaleDateString() }}
            </span>
            <span v-if="app.score != null" class="inline-flex items-center gap-1">
              Score: {{ app.score }}
            </span>
          </div>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ml-3"
          :class="statusBadgeClasses[app.status] ?? 'bg-surface-100 text-surface-600'"
        >
          {{ app.status }}
        </span>
      </NuxtLink>

      <!-- Total count -->
      <p class="text-xs text-surface-400 pt-2">
        {{ total }} application{{ total === 1 ? '' : 's' }} total
      </p>
    </div>
  </div>
</template>
