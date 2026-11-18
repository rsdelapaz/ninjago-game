import { ref, shallowRef } from 'vue'
export type Confirmation = { title: string; explanation: string; actionLabel?: string; destructive?: boolean }
export function createConfirmations() {
  const request = shallowRef<Confirmation | null>(null), busy = ref(false), error = ref('')
  let resolve: ((value: boolean) => void) | undefined, execute: (() => unknown | Promise<unknown>) | undefined
  function ask(options: Confirmation, action?: () => unknown | Promise<unknown>): Promise<boolean> {
    if (request.value) return Promise.resolve(false)
    request.value = options; error.value = ''; execute = action
    return new Promise(done => { resolve = done })
  }
  function cancel() {
    if (busy.value) return
    const done = resolve; resolve = undefined; execute = undefined; request.value = null; done?.(false)
  }
  async function accept() {
    if (!request.value || busy.value) return
    busy.value = true
    try {
      await execute?.()
      const done = resolve; resolve = undefined; execute = undefined; request.value = null; done?.(true)
    } catch (e) { error.value = e instanceof Error ? e.message : 'No se ha podido completar. Vuelve a intentarlo.' }
    finally { busy.value = false }
  }
  return { request, busy, error, ask, cancel, accept }
}
export const confirmations = createConfirmations()
export const confirmAction = (explanation: string, title = 'Revisar antes de continuar', destructive = false) => confirmations.ask({ title, explanation, destructive, actionLabel: destructive ? 'Sí, continuar' : 'Continuar' })
