import { newId, createProfile, exportProfile, parseProfile, type ProfileId, type ProfileConfig, type GameProgress } from './profile.ts'
import { profileKey, presentationKey, readProfile, saveProfile, onlyChallengesChanged } from './profileStorage.ts'
import { createCeremony, parseCeremony, transitionCeremony, type CeremonyAction, type CeremonyProgress } from './ceremony.ts'
import { pruneResults, resultsKey } from './challengeResults.ts'
import { sceneById } from './scenes.ts'
import { finaleProblems } from './finale.ts'
export type ProfileResetRequest = { profileId: ProfileId; expectedConfig: string | null; expectedProgress: string | null; expectedControl: string | null; expectedResults?: string | null }
type NavigationWrite = { before: string | null; after: string }
type PendingWrite = { before: string; after: string; beforeProgress: string | null; afterProgress: string; navigation?: NavigationWrite }
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
  const record = JSON.parse(raw) as PendingWrite
  if (typeof record.before !== 'string' || typeof record.after !== 'string' || typeof record.afterProgress !== 'string') throw Error('Registro de recuperación no válido. Conserva los datos del navegador.')
  const config = parseProfile(JSON.parse(record.after)); parseCeremony(JSON.parse(record.afterProgress), id)
  if (config.id !== id) throw Error('La recuperación pertenece a otro perfil.')
  if (record.navigation) {
    const n = record.navigation
    if (typeof n.after !== 'string' || n.before !== null && typeof n.before !== 'string') throw Error('Navegación de recuperación no válida.')
    const next = JSON.parse(n.after) as GameProgress
    const prior = n.before === null ? null : JSON.parse(n.before) as GameProgress
    const sameSceneCleanup = prior && next.profileId === prior.profileId && next.sceneId === prior.sceneId
    if (!(next.profileId === id && next.sceneId === 'intro') && !sameSceneCleanup || !Number.isSafeInteger(next.revision) || next.revision < 0 || typeof next.token !== 'string') throw Error('Navegación de recuperación no válida.')
    const currentControl = storage.getItem(presentationKey)
    if (currentControl !== n.before && currentControl !== n.after) throw Error('La presentación cambió después del restablecimiento interrumpido. No se sobrescribirá.')
  }
  const current = storage.getItem(profileKey(id)), currentProgress = storage.getItem(ceremonyKey(id))
  // Replaying an older journal writes its validated current-schema representation.
  // A second interruption must recognize those exact bytes without accepting later edits.
  const normalizedAfter = exportProfile(config)
  if (current !== record.before && current !== record.after && current !== normalizedAfter || currentProgress !== record.beforeProgress && currentProgress !== record.afterProgress) throw Error('Hay cambios posteriores a la elección interrumpida. No se sobrescribirá el perfil; conserva una exportación para revisarlo.')
  if (current === record.before && record.before !== record.after) saveProfile(storage, config, record.before, true)
  pruneResults(storage, config)
  storage.setItem(ceremonyKey(id), record.afterProgress)
  if (record.navigation) storage.setItem(presentationKey, record.navigation.after)
  storage.removeItem(pendingKey(id))
}
export function applyCeremony(storage: Storage, id: ProfileId, expectedConfig: string, expectedProgress: string | null, action: CeremonyAction) {
  checkExpected(storage, id, expectedConfig, expectedProgress)
  const result = transitionCeremony(readProfile(storage, id), readCeremony(storage, id), action)
  writeProfileProgress(storage, id, expectedConfig, expectedProgress, result)
  return result
}
function checkExpected(storage: Storage, id: ProfileId, expectedConfig: string, expectedProgress: string | null) {
  if (storage.getItem(pendingKey(id))) throw Error('Recarga para recuperar la elección anterior antes de continuar.')
  if (storage.getItem(profileKey(id)) !== expectedConfig || storage.getItem(ceremonyKey(id)) !== expectedProgress) throw Error('Otra ventana ha cambiado el perfil o la ceremonia. Revisa el estado actualizado antes de confirmar otra vez.')
}
export function applyProfileConfig(storage: Storage, config: ProfileConfig, before: string, beforeProgress: string | null) {
  checkExpected(storage, config.id, before, beforeProgress)
  const raw = storage.getItem(presentationKey), control = JSON.parse(raw || 'null') as (GameProgress & { finales?: Record<string, unknown> }) | null
  const finaleChanged = JSON.stringify(parseProfile(JSON.parse(before)).finale) !== JSON.stringify(config.finale)
  const retired = control?.profileId === config.id && (!sceneById(control.sceneId, config) || control.sceneId === 'finale' && (finaleChanged || finaleProblems(config.finale).length > 0))
  const finales = { ...control?.finales }; if (finaleChanged) delete finales[config.id]
  const navigation = control && (retired || finaleChanged && control.finales?.[config.id])
    ? { before: raw, after: JSON.stringify({ ...control, finales, sceneId: retired ? 'intro' : control.sceneId, revision: Math.max(Date.now(), control.revision + 1), token: newId(), ...(retired ? { announcement: undefined } : {}) }) } : undefined
  const preserve = onlyChallengesChanged(config, before), progress = preserve ? readCeremony(storage, config.id) : createCeremony(config.id)
  if (!preserve) progress.revision = Date.now()
  writeProfileProgress(storage, config.id, before, beforeProgress, { config, progress }, navigation, preserve)
  return exportProfile(config)
}
// Shared journal and existing saveProfile for both ceremony choices and a complete profile reset.
function writeProfileProgress(storage: Storage, id: ProfileId, expectedConfig: string, expectedProgress: string | null, result: { config: ProfileConfig; progress: CeremonyProgress }, navigation?: NavigationWrite, preserveProgress = false) {
  const after = exportProfile(result.config), afterProgress = preserveProgress && expectedProgress !== null ? expectedProgress : JSON.stringify(result.progress)
  storage.setItem(pendingKey(id), JSON.stringify({ before: expectedConfig, after, beforeProgress: expectedProgress, afterProgress, navigation }))
  if (after !== expectedConfig) saveProfile(storage, result.config, expectedConfig, true)
  storage.setItem(ceremonyKey(id), afterProgress)
  if (navigation) storage.setItem(presentationKey, navigation.after)
  storage.removeItem(pendingKey(id))
}
// Call only under the same withLocalWrite lock as all active dashboard writers.
export function applyProfileReset(storage: Storage, request: ProfileResetRequest, next: GameProgress) {
  const { profileId: id, expectedConfig, expectedProgress, expectedControl } = request
  if (!expectedConfig) throw Error('No se puede restablecer un perfil sin una configuración guardada válida.')
  checkExpected(storage, id, expectedConfig, expectedProgress)
  if (request.expectedResults !== undefined && storage.getItem(resultsKey(id)) !== request.expectedResults) throw Error('Los resultados cambiaron después de revisar el restablecimiento. Revisa otra vez antes de continuar.')
  const active = JSON.parse(storage.getItem(presentationKey) || 'null') as GameProgress | null
  if (storage.getItem(presentationKey) !== expectedControl || active?.profileId !== id || next.profileId !== id || next.sceneId !== 'intro') throw Error('El perfil activo o la presentación han cambiado. Revisa antes de restablecer.')
  const old = readProfile(storage, id), config = createProfile(id), progress = createCeremony(id)
  config.teams.forEach((team, index) => { team.id = old.teams[index].id })
  progress.revision = readCeremony(storage, id).revision + 1
  writeProfileProgress(storage, id, expectedConfig, expectedProgress, { config, progress }, { before: expectedControl, after: JSON.stringify(next) })
  return config
}
