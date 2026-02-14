<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'require-org'],
})

useSeoMeta({
  title: 'Dashboard — Applirank',
  description: 'Your recruitment overview',
})

const { activeOrg } = useCurrentOrg()
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="text-2xl font-bold text-surface-900">
      Welcome to Applirank
    </h1>
    <p v-if="activeOrg" class="text-sm text-surface-500 mt-2">
      Organization: <strong>{{ activeOrg.name }}</strong>
    </p>

    <div class="mt-8 rounded-lg border border-surface-200 bg-white p-6 text-sm text-surface-600 leading-relaxed space-y-3">
      <p>
        Your recruitment dashboard will appear here once Job Management is implemented (Milestone 3).
      </p>
      <p>
        Use the sidebar to navigate — Jobs, Candidates, and Applications will be available in upcoming milestones.
      </p>
    </div>
  </div>
</template>
