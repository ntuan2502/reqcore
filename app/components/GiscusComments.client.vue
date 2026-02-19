<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const containerRef = useTemplateRef<HTMLDivElement>('container')
const loadError = ref('')

const giscusConfig = computed(() => ({
  repo: runtimeConfig.public.giscusRepo,
  repoId: runtimeConfig.public.giscusRepoId,
  category: runtimeConfig.public.giscusCategory,
  categoryId: runtimeConfig.public.giscusCategoryId,
  mapping: runtimeConfig.public.giscusMapping || 'pathname',
  strict: runtimeConfig.public.giscusStrict || '1',
  reactionsEnabled: runtimeConfig.public.giscusReactionsEnabled || '1',
  emitMetadata: runtimeConfig.public.giscusEmitMetadata || '0',
  inputPosition: runtimeConfig.public.giscusInputPosition || 'top',
  theme: runtimeConfig.public.giscusTheme || 'dark',
  lang: runtimeConfig.public.giscusLang || 'en',
}))

const isConfigured = computed(() => (
  !!giscusConfig.value.repo
  && !!giscusConfig.value.repoId
  && !!giscusConfig.value.category
  && !!giscusConfig.value.categoryId
))

function renderGiscus() {
  const container = containerRef.value
  if (!container) return

  loadError.value = ''
  container.innerHTML = ''

  if (!isConfigured.value) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'

  script.setAttribute('data-repo', giscusConfig.value.repo)
  script.setAttribute('data-repo-id', giscusConfig.value.repoId)
  script.setAttribute('data-category', giscusConfig.value.category)
  script.setAttribute('data-category-id', giscusConfig.value.categoryId)
  script.setAttribute('data-mapping', giscusConfig.value.mapping)
  script.setAttribute('data-strict', giscusConfig.value.strict)
  script.setAttribute('data-reactions-enabled', giscusConfig.value.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscusConfig.value.emitMetadata)
  script.setAttribute('data-input-position', giscusConfig.value.inputPosition)
  script.setAttribute('data-theme', giscusConfig.value.theme)
  script.setAttribute('data-lang', giscusConfig.value.lang)
  script.setAttribute('data-loading', 'lazy')

  script.addEventListener('error', () => {
    loadError.value = 'Could not load giscus.app. Check network/ad blockers and try again.'
  })

  script.addEventListener('load', () => {
    window.setTimeout(() => {
      const hasIframe = !!container.querySelector('iframe')
      if (!hasIframe) {
        loadError.value = 'Giscus loaded but did not render. Verify repo/category IDs and restart the dev server after env changes.'
      }
    }, 1500)
  })

  container.appendChild(script)
}

onMounted(() => {
  renderGiscus()
})

watch(() => route.fullPath, () => {
  renderGiscus()
})
</script>

<template>
  <section class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h2 class="text-base font-semibold text-white">Comments</h2>
      <span class="text-xs text-white/40">Powered by Giscus</span>
    </div>

    <div
      v-if="!isConfigured"
      class="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200/90"
    >
      Configure Giscus env vars to enable page comments.
    </div>

    <div
      v-else-if="loadError"
      class="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200/90"
    >
      {{ loadError }}
    </div>

    <div ref="container" />
  </section>
</template>
