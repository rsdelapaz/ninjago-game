import { createProfile, exportProfile, parseProfile, profileIds, type ProfileConfig, type ProfileId } from './profile.ts'
import { createCeremony } from './ceremony.ts'
export const profileKey = (id: ProfileId) => `ninja-profile-v2:${id}`
export function initializeProfiles(storage: Storage) {
  for (const id of profileIds) if (storage.getItem(profileKey(id)) === null) storage.setItem(profileKey(id), exportProfile(createProfile(id)))
}
export function readProfile(storage: Storage, id: ProfileId): ProfileConfig {
  const c = parseProfile(JSON.parse(storage.getItem(profileKey(id)) || 'null'))
  if (c.id !== id) throw Error('El identificador guardado no coincide con su perfil.')
  return c
}
export function saveProfile(storage: Storage, config: ProfileConfig, previous: string | null, ceremonyWrite = false): string {
  const json = exportProfile(config), key = profileKey(config.id)
  if (!ceremonyWrite && storage.getItem(`ninja-ceremony-pending:${config.id}`)) throw Error('Hay una elección pendiente de recuperar. Recarga antes de guardar el perfil.')
  if (storage.getItem(key) !== previous) throw Error('El perfil cambió en otra ventana. Exporta tu borrador y recarga antes de guardar.')
  // Keep the prior configuration locally before any replacement. Never delete legacy keys.
  if (previous !== null && previous !== json) storage.setItem(`ninja-profile-history:${config.id}:${Date.now()}:${crypto.getRandomValues(new Uint32Array(1))[0]}`, previous)
  // Editing setup invalidates ceremony confirmations, but never clears the confirmed names/colors.
  // Reset before writing config: if storage fails, it is safer to repeat than to skip the ceremony.
  if (!ceremonyWrite && previous !== json && storage.getItem(`ninja-ceremony-v1:${config.id}`) !== null) {
    const reset = createCeremony(config.id); reset.revision = Date.now()
    storage.setItem(`ninja-ceremony-v1:${config.id}`, JSON.stringify(reset))
  }
  storage.setItem(key, json)
  return json
}
// All active browser writers share this lock. Never silently degrade to unsafe concurrent writes.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
export async function withLocalWrite<T>(write: () => T): Promise<T> {
  if (!navigator.locks) throw Error('Este navegador no permite escrituras coordinadas. Abre la aplicación en Edge/Chrome/Firefox actual desde http://127.0.0.1 y conserva tus borradores.')
  return navigator.locks.request('ninja-local-write', write)
}
export function legacyEntries(storage: Storage): { key: string; raw: string; name: string }[] {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)!).filter(k => k.startsWith('ninja-config-v1:'))
  return keys.map(key => {
    const raw = storage.getItem(key)!
    let name = 'Configuración anterior no legible'
    try { const value = JSON.parse(raw); if (typeof value.name === 'string') name = value.name } catch { /* Preserve invalid records for recovery. */ }
    return { key, raw, name }
  })
}
