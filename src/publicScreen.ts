import { computed, ref } from 'vue'

export type ScreenMessage = { protocol: 'ninja-public-v1'; type: 'probe' | 'ready'; requestId: string; screenId?: string }
export type ScreenTransport = { send: (message: ScreenMessage) => void; subscribe: (receive: (data: unknown) => void) => () => void }
export type ScreenRole = 'admin' | 'public'
function validMessage(data: unknown): data is ScreenMessage {
  if (!data || typeof data !== 'object') return false
  const m = data as ScreenMessage
  return m.protocol === 'ninja-public-v1' && ['probe','ready'].includes(m.type) && typeof m.requestId === 'string' && m.requestId.length > 0 && m.requestId.length < 150
    && (m.type !== 'ready' || typeof m.screenId === 'string' && m.screenId.length > 0 && m.screenId.length < 150)
}
// Probes contain no profile or participant data; only a currently mounted public app can answer.
export function createPublicScreen(options: {
  role: ScreenRole; transport: ScreenTransport; open: () => { closed?: boolean } | null
  heartbeatMs?: number; timeoutMs?: number; staleMs?: number
}) {
  const heartbeatMs = options.heartbeatMs ?? 1000, timeoutMs = options.timeoutMs ?? 5000, staleMs = options.staleMs ?? 3500
  const status = ref<'unknown' | 'checking' | 'ready' | 'unavailable'>('unknown'), message = ref(''), waiting = ref(false)
  const screenId = crypto.randomUUID(), available = computed(() => status.value === 'ready')
  let mounted = false, disposed = false, lastSeen = 0, heartbeatId = ''
  let publicWindow: { closed?: boolean } | null = null
  let pending: { id: string; promise: Promise<boolean>; resolve: (ok: boolean) => void; timer: ReturnType<typeof setTimeout> } | null = null
  function send(messageToSend: ScreenMessage) {
    try { options.transport.send(messageToSend) }
    catch (error) {
      finish(false); status.value = 'unavailable'
      message.value = `No se puede comunicar con la pantalla pública: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  const probe = (id: string) => send({ protocol: 'ninja-public-v1', type: 'probe', requestId: id })
  function finish(ok: boolean) {
    if (!pending) return
    const request = pending; pending = null; clearTimeout(request.timer); waiting.value = false
    status.value = ok ? 'ready' : 'unavailable'
    if (ok) message.value = ''
    else message.value = 'La pantalla pública no ha confirmado que esté preparada. Permite la apertura de ventanas, pulsa «Preparar pantalla pública» y repite la acción.'
    request.resolve(ok)
  }
  const unsubscribe = options.transport.subscribe(data => {
    if (disposed || !validMessage(data)) return
    if (options.role === 'public' && mounted && data.type === 'probe') {
      send({ protocol: 'ninja-public-v1', type: 'ready', requestId: data.requestId, screenId })
    } else if (options.role === 'admin' && data.type === 'ready' && (pending ? data.requestId === pending.id : data.requestId === heartbeatId)) {
      lastSeen = Date.now(); status.value = 'ready'
      if (data.requestId === pending?.id) finish(true)
    }
  })
  const heartbeat = options.role === 'admin' ? setInterval(() => {
    if ((publicWindow?.closed || lastSeen && Date.now() - lastSeen > staleMs) && !pending) status.value = 'unavailable'
    if (pending) probe(pending.id)
    else { heartbeatId = crypto.randomUUID(); probe(heartbeatId) }
  }, heartbeatMs) : undefined
  function ensure(): Promise<boolean> {
    if (disposed) return Promise.resolve(false)
    if (pending) return pending.promise
    const fresh = !publicWindow?.closed && lastSeen > 0 && Date.now() - lastSeen <= staleMs
    const id = crypto.randomUUID()
    let resolve!: (ok: boolean) => void
    const promise = new Promise<boolean>(done => { resolve = done })
    pending = { id, promise, resolve, timer: setTimeout(() => finish(false), timeoutMs) }
    waiting.value = true; status.value = 'checking'; message.value = ''
    // Intentionally synchronous, before any await or microtask; window.open alone never marks ready.
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
    if (!fresh || !publicWindow) {
      try { publicWindow = options.open() }
      catch (error) {
        finish(false)
        message.value = `No se pudo abrir la pantalla pública: ${error instanceof Error ? error.message : String(error)}`
        return promise
      }
    }
    probe(id)
    return promise
  }
  function dispose() {
    disposed = true; mounted = false; if (heartbeat) clearInterval(heartbeat)
    unsubscribe(); finish(false)
  }
  return { available, status, message, waiting, ensure, markReady: (ready = true) => { mounted = ready }, dispose }
}

// Same-origin transport: BroadcastChannel with storage-event fallback. Messages are validated above.
export function browserScreenTransport(): ScreenTransport & { dispose: () => void } {
  const key = 'ninja-public-v1', receivers = new Set<(data: unknown) => void>()
  let channel: BroadcastChannel | undefined
  const receive = (data: unknown) => receivers.forEach(listener => listener(data))
  try { channel = new BroadcastChannel(key); channel.onmessage = event => receive(event.data) }
  catch { /* storage is the existing same-origin fallback. */ }
  const storage = (event: StorageEvent) => {
    if (event.key !== key || !event.newValue) return
    let message: unknown
    try { message = JSON.parse(event.newValue) } catch { return } // malformed storage data, not application errors
    receive(message)
  }
  window.addEventListener('storage', storage)
  return {
    send(message) {
      channel?.postMessage(message)
      // Always write: a public window may have no BroadcastChannel even when the admin does.
      try { localStorage.setItem(key, JSON.stringify({ ...message, deliveryId: crypto.randomUUID() })) }
      catch (error) { if (!channel) throw error }
    },
    subscribe(receive) { receivers.add(receive); return () => { receivers.delete(receive) } },
    dispose() { channel?.close(); receivers.clear(); window.removeEventListener('storage', storage) },
  }
}
