import { computed, onUnmounted, ref } from 'vue'
import { isProfileId, type GameProgress, type ProfileConfig, type ProfileId } from './profile'
import { initializeProfiles, profileKey, readProfile } from './profileStorage'
import { orderedScenes, sceneById } from './scenes'
export type Scene = string
export type PresentationState = Omit<GameProgress, 'profileId'> & { profileId: ProfileId | null }
const key = 'ninja-control-v3'
function valid(value: unknown): value is PresentationState {
  if (!value || typeof value !== 'object') return false
  const s = value as PresentationState
  return isProfileId(s.profileId) && !!sceneById(s.sceneId) && Number.isSafeInteger(s.revision) && s.revision >= 0 && typeof s.token === 'string'
}
export function usePresentation() {
  const state = ref<PresentationState>({ profileId: null, sceneId: orderedScenes[0].id, revision: 0, token: '' })
  const profile = ref<ProfileConfig | null>(null)
  const warning = ref('')
  try {
    initializeProfiles(localStorage)
    const saved: unknown = JSON.parse(localStorage.getItem(key) || 'null')
    if (valid(saved)) { profile.value = readProfile(localStorage, saved.profileId!); state.value = saved }
  } catch { warning.value = 'No se puede leer la configuración local. Los datos anteriores se conservan; comprueba el almacenamiento del navegador.' }
  let channel: BroadcastChannel | undefined
  function receive(value: unknown) {
    if (!valid(value) || (value.revision < state.value.revision) || (value.revision === state.value.revision && value.token <= state.value.token)) return
    try { profile.value = readProfile(localStorage, value.profileId!); state.value = value }
    catch { warning.value = 'El perfil recibido no se puede leer. No se ha aplicado el cambio.' }
  }
  try { channel = new BroadcastChannel(key); channel.onmessage = e => receive(e.data) }
  catch { warning.value = 'Se usará almacenamiento local para sincronizar las ventanas.' }
  function refreshProfile() {
    if (!state.value.profileId) return
    try { profile.value = readProfile(localStorage, state.value.profileId) }
    catch { warning.value = 'El perfil guardado contiene datos inválidos. No se reemplazará automáticamente.' }
  }
  const storage = (event: StorageEvent) => {
    if (event.key === key && event.newValue) { try { receive(JSON.parse(event.newValue)) } catch { /* Ignore malformed messages. */ } }
    if (state.value.profileId && event.key === profileKey(state.value.profileId)) refreshProfile()
  }
  window.addEventListener('storage', storage)
  function publish(sceneId: string, profileId: ProfileId) {
    if (!sceneById(sceneId)) return
    const next: PresentationState = { profileId, sceneId, revision: Math.max(Date.now(), state.value.revision + 1), token: Array.from(crypto.getRandomValues(new Uint32Array(2))).join('-') }
    try {
      const config = readProfile(localStorage, profileId)
      localStorage.setItem(key, JSON.stringify(next))
      profile.value = config; state.value = next
      channel?.postMessage(next)
    } catch { warning.value = 'No se ha aplicado el cambio: no es posible leer o guardar el perfil activo.' }
  }
  function select(sceneId: string) { if (state.value.profileId) publish(sceneId, state.value.profileId) }
  // Switching profiles always returns the public display to the first stable scene.
  function selectProfile(id: ProfileId) { publish(orderedScenes[0].id, id) }
  onUnmounted(() => { channel?.close(); window.removeEventListener('storage', storage) })
  const activeScene = computed(() => sceneById(state.value.sceneId)!)
  return { state, profile, activeScene, select, selectProfile, refreshProfile, warning }
}
