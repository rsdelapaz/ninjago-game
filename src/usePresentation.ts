import { onUnmounted, ref } from 'vue'
export type Scene = 'intro' | 'wu'
type State = { scene: Scene; revision: number }
const key = 'ninja-presentation-v1'
function valid(value: unknown): value is State {
  if (!value || typeof value !== 'object') return false
  const s = value as State
  return (s.scene === 'intro' || s.scene === 'wu') && Number.isSafeInteger(s.revision) && s.revision >= 0
}
export function usePresentation() {
  const state = ref<State>({ scene: 'intro', revision: 0 })
  const warning = ref('')
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) || 'null')
    if (valid(saved)) state.value = saved
  } catch { warning.value = 'No se puede recuperar o guardar la escena en este navegador.' }
  let channel: BroadcastChannel | undefined
  const receive = (value: unknown) => {
    if (valid(value) && value.revision > state.value.revision) state.value = value
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
  try {
    channel = new BroadcastChannel(key)
    channel.onmessage = event => receive(event.data)
  } catch { warning.value = 'BroadcastChannel no disponible. Se usará almacenamiento local para sincronizar.' }
  const storage = (event: StorageEvent) => {
    if (event.key !== key || !event.newValue) return
    try { receive(JSON.parse(event.newValue)) } catch { /* Ignore invalid state. */ }
  }
  window.addEventListener('storage', storage)
  function select(scene: Scene) {
    state.value = { scene, revision: Math.max(Date.now(), state.value.revision + 1) }
    try { localStorage.setItem(key, JSON.stringify(state.value)) }
    catch { warning.value = 'No se puede guardar la escena. Mantén las ventanas abiertas para sincronizar.' }
    channel?.postMessage({ ...state.value })
  }
  onUnmounted(() => { channel?.close(); window.removeEventListener('storage', storage) })
  return { state, select, warning }
}
