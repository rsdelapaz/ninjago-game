import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { cloneProfile, exportProfile, type ProfileConfig, type ProfileId } from './profile.ts'
import { profileKey, presentationKey, saveProfile, withLocalWrite } from './profileStorage.ts'
import { ceremonyKey, type ProfileResetRequest } from './ceremonyStorage.ts'
type Draft = { config: ProfileConfig; baseline: string | null; normalized: string; ceremonyBaseline: string | null }
export function useProfileDraft(source: () => ProfileConfig, saved: () => void) {
  const drafts = reactive(new Map<ProfileId, Draft>())
  const message = ref(''), error = ref('')
  const changed = (d: Draft) => JSON.stringify(d.config, null, 2) !== d.normalized
  watch(source, config => {
    const existing = drafts.get(config.id)
    if (!existing || !changed(existing)) {
      try { drafts.set(config.id, { config: cloneProfile(config), baseline: localStorage.getItem(profileKey(config.id)), normalized: exportProfile(config), ceremonyBaseline: localStorage.getItem(ceremonyKey(config.id)) }) }
      catch { error.value = 'No se puede leer el perfil. Exporta cualquier borrador antes de cerrar.' }
    }
  }, { immediate: true })
  const current = computed(() => drafts.get(source().id)!)
  const dirty = computed(() => current.value ? changed(current.value) : false)
  const pending = computed(() => [...drafts].filter(([, d]) => changed(d)).map(([id]) => id))
  function report(e: unknown) { error.value = e instanceof Error ? e.message : 'No se ha podido completar la operación.'; message.value = '' }
  const saving = ref(false)
  async function save(candidate = current.value.config): Promise<boolean> {
    if (saving.value) return false
    saving.value = true
    try {
      const config = cloneProfile(candidate)
      const previous = current.value.baseline
      const progressBefore = current.value.ceremonyBaseline
      const baseline = await withLocalWrite(() => {
        if (localStorage.getItem(ceremonyKey(config.id)) !== progressBefore) throw Error('La ceremonia ha avanzado en otra ventana. Exporta el borrador y descártalo para revisar el estado actual antes de guardar.')
        return saveProfile(localStorage, config, previous)
      })
      drafts.set(config.id, { config, baseline, normalized: baseline, ceremonyBaseline: localStorage.getItem(ceremonyKey(config.id)) }); error.value = ''; message.value = 'Perfil guardado en este navegador.'; saved(); return true
    } catch (e) { report(e); return false } finally { saving.value = false }
  }
  async function reset(resetProfile: (request: ProfileResetRequest) => Promise<boolean>, reviewed?: ProfileResetRequest): Promise<boolean> {
    if (saving.value) return false
    const draft = current.value, id = draft.config.id
    saving.value = true; error.value = ''; message.value = ''
    try {
      const request = reviewed || { profileId: id, expectedConfig: draft.baseline, expectedProgress: draft.ceremonyBaseline, expectedControl: localStorage.getItem(presentationKey) }
      if (request.profileId !== id) throw Error('El perfil del restablecimiento ya no coincide con el borrador activo.')
      const ok = await resetProfile(request)
      if (!ok) return false
      const raw = localStorage.getItem(profileKey(id)), config = cloneProfile(JSON.parse(raw || 'null'))
      drafts.set(id, { config, baseline: raw, normalized: exportProfile(config), ceremonyBaseline: localStorage.getItem(ceremonyKey(id)) })
      error.value = ''; message.value = 'Perfil restablecido. La presentación vuelve a la portada.'; saved(); return true
    } catch (e) { report(e); return false } finally { saving.value = false }
  }
  function discard() {
    if (!window.confirm('¿Descartar los cambios sin guardar de este perfil?')) return
    try {
      const raw = localStorage.getItem(profileKey(source().id))
      const config = cloneProfile(JSON.parse(raw || 'null'))
      drafts.set(config.id, { config, baseline: raw, normalized: exportProfile(config), ceremonyBaseline: localStorage.getItem(ceremonyKey(config.id)) }); error.value = ''; message.value = 'Se ha recuperado la configuración guardada.'
    } catch (e) { report(e) }
  }
  // Native protection for reload/close; profile switches retain each draft in memory.
  const beforeUnload = (event: BeforeUnloadEvent) => { if (pending.value.length) { event.preventDefault(); event.returnValue = '' } }
  window.addEventListener('beforeunload', beforeUnload)
  onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))
  const validation = computed(() => { try { exportProfile(current.value.config); return '' } catch (e) { return e instanceof Error ? e.message : 'Revisa el borrador.' } })
  return { current, dirty, pending, validation, saving, save, reset, discard, message, error, report }
}
