<script setup lang="ts">
import { FileText, ChevronsUpDown, ChevronUp, ChevronDown, SlidersHorizontal, X, Check } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'require-org'],
})

useSeoMeta({
  title: 'Applications — Applirank',
  description: 'Manage applications across all jobs',
})

const router = useRouter()

// ── Status filter (multi-select) ──────────────────────────────────────────────

const STATUS_OPTIONS = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'] as const
type Status = typeof STATUS_OPTIONS[number]

// useState persists across navigation within the same session
const selectedStatuses = useState<Status[]>('app-filter-statuses', () => [])
const scoreMin = useState<number | undefined>('app-filter-score-min', () => undefined)
const scoreMax = useState<number | undefined>('app-filter-score-max', () => undefined)
const visibleCols = useState('app-visible-cols', () => ({
  job: true,
  score: true,
  status: true,
  createdAt: true,
}))

const statusFilter = computed(() =>
  selectedStatuses.value.length === 1 ? selectedStatuses.value[0] : undefined,
)

const { applications, total, fetchStatus, error, refresh } = useApplications({
  status: statusFilter,
})

function toggleStatus(s: Status) {
  if (selectedStatuses.value.includes(s)) {
    selectedStatuses.value = selectedStatuses.value.filter(x => x !== s)
  }
  else {
    selectedStatuses.value = [...selectedStatuses.value, s]
  }
}

// ── Column picker panel ───────────────────────────────────────────────────────

const panelOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)

function handleOutsideClick(e: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    panelOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

const activeFilterCount = computed(() => {
  let n = selectedStatuses.value.length
  if (scoreMin.value != null) n++
  if (scoreMax.value != null) n++
  return n
})

// ── Sorting ───────────────────────────────────────────────────────────────────

type SortKey = 'candidate' | 'job' | 'score' | 'status' | 'createdAt'
type SortDir = 'asc' | 'desc'

const sortKey = useState<SortKey>('app-sort-key', () => 'score')
const sortDir = useState<SortDir>('app-sort-dir', () => 'desc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortKey.value = key
    sortDir.value = key === 'score' ? 'desc' : 'asc'
  }
}

const sorted = computed(() => {
  return [...applications.value]
    .filter((app) => {
      if (selectedStatuses.value.length > 1 && !selectedStatuses.value.includes(app.status as Status)) return false
      if (scoreMin.value != null && (app.score ?? 0) < scoreMin.value) return false
      if (scoreMax.value != null && (app.score ?? 0) > scoreMax.value) return false
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey.value) {
        case 'candidate':
          cmp = `${a.candidateFirstName} ${a.candidateLastName}`.localeCompare(`${b.candidateFirstName} ${b.candidateLastName}`)
          break
        case 'job':
          cmp = a.jobTitle.localeCompare(b.jobTitle)
          break
        case 'score':
          cmp = (a.score ?? -1) - (b.score ?? -1)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDir.value === 'asc' ? cmp : -cmp
    })
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function scoreClass(score: number) {
  if (score >= 75) return 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400'
  if (score >= 40) return 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400'
  return 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-400'
}

const statusBadgeClasses: Record<string, string> = {
  new: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
  screening: 'bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-400',
  interview: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400',
  offer: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400',
  hired: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
  rejected: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
}

const statusLabels: Record<Status, string> = {
  new: 'New',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

function clearFilters() {
  selectedStatuses.value = []
  scoreMin.value = undefined
  scoreMax.value = undefined
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Applications</h1>
        <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Track candidates through your hiring pipeline.
        </p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-3 mb-4">
      <!-- Column / filter picker -->
      <div ref="panelRef" class="relative">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-700 transition-colors"
          @click="panelOpen = !panelOpen"
        >
          <SlidersHorizontal class="size-4" />
          View
          <span
            v-if="activeFilterCount > 0"
            class="inline-flex items-center justify-center size-4 rounded-full bg-brand-500 text-white text-[10px] font-semibold"
          >
            {{ activeFilterCount }}
          </span>
        </button>

        <!-- Dropdown panel -->
        <div
          v-if="panelOpen"
          class="absolute left-0 top-full mt-2 z-20 w-72 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-lg p-4 space-y-5"
        >
          <!-- Columns -->
          <div>
            <p class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">Columns</p>
            <div class="space-y-1.5">
              <label
                v-for="col in ([
                  { key: 'job', label: 'Job' },
                  { key: 'score', label: 'Score' },
                  { key: 'status', label: 'Status' },
                  { key: 'createdAt', label: 'Applied' },
                ] as const)"
                :key="col.key"
                class="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <input type="checkbox" class="sr-only" :checked="visibleCols[col.key]" @change="visibleCols[col.key] = !visibleCols[col.key]" />
                <span
                  class="size-4 shrink-0 rounded border flex items-center justify-center transition-colors"
                  :class="visibleCols[col.key]
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600'"
                >
                  <Check v-if="visibleCols[col.key]" class="size-3 text-white" :stroke-width="3" />
                </span>
                <span class="text-sm text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors">
                  {{ col.label }}
                </span>
              </label>
            </div>
          </div>

          <div class="border-t border-surface-100 dark:border-surface-800" />

          <!-- Filter by status -->
          <div>
            <p class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">Filter by Status</p>
            <div class="space-y-1.5">
              <label
                v-for="s in STATUS_OPTIONS"
                :key="s"
                class="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <input type="checkbox" class="sr-only" :checked="selectedStatuses.includes(s)" @change="toggleStatus(s)" />
                <span
                  class="size-4 shrink-0 rounded border flex items-center justify-center transition-colors"
                  :class="selectedStatuses.includes(s)
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600'"
                >
                  <Check v-if="selectedStatuses.includes(s)" class="size-3 text-white" :stroke-width="3" />
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                  :class="statusBadgeClasses[s]"
                >
                  {{ statusLabels[s] }}
                </span>
              </label>
            </div>
          </div>

          <div class="border-t border-surface-100 dark:border-surface-800" />

          <!-- Score range -->
          <div>
            <p class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">Score Range</p>
            <div class="flex items-center gap-2">
              <input
                v-model.number="scoreMin"
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                class="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-1.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span class="text-surface-400 text-xs shrink-0">to</span>
              <input
                v-model.number="scoreMax"
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                class="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-1.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          <!-- Clear -->
          <button
            v-if="activeFilterCount > 0"
            class="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-danger-600 transition-colors"
            @click="clearFilters"
          >
            <X class="size-3" />
            Clear filters
          </button>
        </div>
      </div>

      <!-- Active filter pills -->
      <template v-if="selectedStatuses.length > 0">
        <span
          v-for="s in selectedStatuses"
          :key="s"
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize cursor-pointer"
          :class="statusBadgeClasses[s]"
          @click="toggleStatus(s as Status)"
        >
          {{ statusLabels[s] }}
          <X class="size-2.5" />
        </span>
      </template>
      <span
        v-if="scoreMin != null || scoreMax != null"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 cursor-pointer"
        @click="scoreMin = undefined; scoreMax = undefined"
      >
        Score {{ scoreMin ?? '0' }}–{{ scoreMax ?? '100' }}
        <X class="size-2.5" />
      </span>
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
      <h3 class="text-base font-semibold text-surface-700 dark:text-surface-200 mb-1">No applications yet</h3>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        Applications will appear here when candidates apply to your jobs or when you manually link candidates.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
            <!-- Candidate always visible -->
            <th class="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide select-none">
              <button
                class="inline-flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                @click="toggleSort('candidate')"
              >
                Candidate
                <ChevronUp v-if="sortKey === 'candidate' && sortDir === 'asc'" class="size-3" />
                <ChevronDown v-else-if="sortKey === 'candidate' && sortDir === 'desc'" class="size-3" />
                <ChevronsUpDown v-else class="size-3 opacity-40" />
              </button>
            </th>
            <th v-if="visibleCols.job" class="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide select-none">
              <button class="inline-flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors" @click="toggleSort('job')">
                Job
                <ChevronUp v-if="sortKey === 'job' && sortDir === 'asc'" class="size-3" />
                <ChevronDown v-else-if="sortKey === 'job' && sortDir === 'desc'" class="size-3" />
                <ChevronsUpDown v-else class="size-3 opacity-40" />
              </button>
            </th>
            <th v-if="visibleCols.score" class="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide select-none">
              <button class="inline-flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors" @click="toggleSort('score')">
                Score
                <ChevronUp v-if="sortKey === 'score' && sortDir === 'asc'" class="size-3" />
                <ChevronDown v-else-if="sortKey === 'score' && sortDir === 'desc'" class="size-3" />
                <ChevronsUpDown v-else class="size-3 opacity-40" />
              </button>
            </th>
            <th v-if="visibleCols.status" class="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide select-none">
              <button class="inline-flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors" @click="toggleSort('status')">
                Status
                <ChevronUp v-if="sortKey === 'status' && sortDir === 'asc'" class="size-3" />
                <ChevronDown v-else-if="sortKey === 'status' && sortDir === 'desc'" class="size-3" />
                <ChevronsUpDown v-else class="size-3 opacity-40" />
              </button>
            </th>
            <th v-if="visibleCols.createdAt" class="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide select-none">
              <button class="inline-flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors" @click="toggleSort('createdAt')">
                Applied
                <ChevronUp v-if="sortKey === 'createdAt' && sortDir === 'asc'" class="size-3" />
                <ChevronDown v-else-if="sortKey === 'createdAt' && sortDir === 'desc'" class="size-3" />
                <ChevronsUpDown v-else class="size-3 opacity-40" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100 dark:divide-surface-800 bg-white dark:bg-surface-950">
          <!-- No results after filtering -->
          <tr v-if="sorted.length === 0">
            <td
              :colspan="1 + Object.values(visibleCols).filter(Boolean).length"
              class="px-4 py-10 text-center text-sm text-surface-400"
            >
              No applications match the current filters.
            </td>
          </tr>
          <tr
            v-for="app in sorted"
            :key="app.id"
            class="hover:bg-surface-50 dark:hover:bg-surface-900 cursor-pointer transition-colors group"
            @click="router.push(`/dashboard/applications/${app.id}`)"
          >
            <td class="px-4 py-3 font-medium text-surface-900 dark:text-surface-100 group-hover:text-brand-600 transition-colors whitespace-nowrap">
              {{ app.candidateFirstName }} {{ app.candidateLastName }}
            </td>
            <td v-if="visibleCols.job" class="px-4 py-3 text-surface-600 dark:text-surface-300 max-w-[220px] truncate">
              {{ app.jobTitle }}
            </td>
            <td v-if="visibleCols.score" class="px-4 py-3">
              <span
                v-if="app.score != null"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
                :class="scoreClass(app.score)"
              >
                {{ app.score }}%
              </span>
              <span v-else class="text-surface-300 dark:text-surface-600 text-xs">—</span>
            </td>
            <td v-if="visibleCols.status" class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                :class="statusBadgeClasses[app.status] ?? 'bg-surface-100 text-surface-600'"
              >
                {{ app.status }}
              </span>
            </td>
            <td v-if="visibleCols.createdAt" class="px-4 py-3 text-surface-400 whitespace-nowrap text-xs">
              {{ timeAgo(app.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
        <p class="text-xs text-surface-400">
          {{ sorted.length }} of {{ total }} application{{ total === 1 ? '' : 's' }}
        </p>
      </div>
    </div>
  </div>
</template>
