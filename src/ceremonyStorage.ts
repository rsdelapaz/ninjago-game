import { exportProfile, parseProfile, type ProfileId } from './profile.ts'
import { profileKey, readProfile, saveProfile } from './profileStorage.ts'
import { createCeremony, parseCeremony, transitionCeremony, type CeremonyAction } from './ceremony.ts'
export const ceremonyKey = (id: ProfileId) => `ninja-ceremony-v1:${id}`
const pendingKey = (id: ProfileId) => `ninja-ceremony-pending:${id}`
export function readCeremony(storage: Storage, id: ProfileId) {
  const raw = storage.getItem(ceremonyKey(id))
  return raw === null ? createCeremony(id) : parseCeremony(JSON.parse(raw), id)
}
// A small write-ahead record makes a config + progress choice recoverable after reload/quota failure.
// It stays in browser storage, never in exported configuration. Call under withLocalWrite.
export function recoverCeremony(storage: Storage, id: ProfileId) {
  const raw = storage.getItem(pendingKey(id)); if (!raw) return
  const record = JSON.parse(raw) as { before: string; after: string; beforeProgress: string | null; afterProgress: string }
  if (typeof record.before !== 'string' || typeof record.after !== 'string' || typeof record.afterProgress !== 'string') throw Error('Registro de recuperación no válido. Conserva los datos del navegador.')
  const config = parseProfile(JSON.parse(record.after)), progress = parseCeremony(JSON.parse(record.afterProgress), id)
  if (config.id !== id) throw Error('La recuperación pertenece a otro perfil.')
  const current = storage.getItem(profileKey(id)), currentProgress = storage.getItem(ceremonyKey(id))
  if (current !== record.before && current !== record.after || currentProgress !== record.beforeProgress && currentProgress !== record.afterProgress) throw Error('Hay cambios posteriores a la elección interrumpida. No se sobrescribirá el perfil; conserva una exportación para revisarlo.')
  if (current === record.before && record.before !== record.after) saveProfile(storage, config, record.before, true)
  storage.setItem(ceremonyKey(id), JSON.stringify(progress))
  storage.removeItem(pendingKey(id))
}
export function applyCeremony(storage: Storage, id: ProfileId, expectedConfig: string, expectedProgress: string | null, action: CeremonyAction) {
  if (storage.getItem(pendingKey(id))) throw Error('Recarga para recuperar la elección anterior antes de continuar.')
  if (storage.getItem(profileKey(id)) !== expectedConfig || storage.getItem(ceremonyKey(id)) !== expectedProgress) throw Error('Otra ventana ha cambiado el perfil o la ceremonia. Revisa el estado actualizado antes de confirmar otra vez.')
  const result = transitionCeremony(readProfile(storage, id), readCeremony(storage, id), action)
  const after = exportProfile(result.config), afterProgress = JSON.stringify(result.progress)
  storage.setItem(pendingKey(id), JSON.stringify({ before: expectedConfig, after, beforeProgress: expectedProgress, afterProgress }))
  if (after !== expectedConfig) saveProfile(storage, result.config, expectedConfig, true)
  storage.setItem(ceremonyKey(id), afterProgress)
  storage.removeItem(pendingKey(id))
  return result
}
