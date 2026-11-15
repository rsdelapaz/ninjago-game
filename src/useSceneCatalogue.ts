import { computed, ref, watch } from 'vue'
import type { ProfileConfig } from './profile.ts'
import { scenesFor } from './scenes.ts'
export function useSceneCatalogue(source: () => { config: ProfileConfig; activeId: string; requestedPreview?: string }) {
  const list = computed(() => scenesFor(source().config)), previewId = ref('intro')
  const active = computed(() => list.value.find(s => s.id === source().activeId) || list.value[0]!)
  function selectPreview(id: string) { if (list.value.some(s => s.id === id)) previewId.value = id }
  watch([() => source().config.id, () => active.value.id], () => { previewId.value = active.value.id }, { immediate: true })
  watch(list, () => { if (!list.value.some(s => s.id === previewId.value)) previewId.value = active.value.id })
  watch(() => source().requestedPreview, id => { if (id) selectPreview(id) }, { immediate: true })
  const preview = computed(() => list.value.find(s => s.id === previewId.value) || active.value)
  return { list, active, preview, previewId, selectPreview }
}
