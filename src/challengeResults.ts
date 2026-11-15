import type { ProfileConfig, ProfileId } from './profile.ts'
export type ChallengeResults = Record<string, string | null>
export const resultsKey = (id: ProfileId) => `ninja-challenge-results-v1:${id}`
export function readResults(storage: Storage, config: ProfileConfig): ChallengeResults {
  const value: unknown = JSON.parse(storage.getItem(resultsKey(config.id)) || '{}')
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('No se pueden leer los resultados. Conserva los datos del navegador.')
  const result: ChallengeResults = {}
  for (const [id, winner] of Object.entries(value)) {
    if (winner !== null && !config.teams.some(t => t.id === winner)) throw Error('Un resultado contiene un equipo desconocido. Revisa antes de continuar.')
    if (config.challenges.some(c => c.id === id)) result[id] = winner
  }
  return result
}
export function saveResult(storage: Storage, config: ProfileConfig, challengeId: string, winner: string | null, expected: string | null) {
  if (storage.getItem(resultsKey(config.id)) !== expected) throw Error('Otra ventana cambió los resultados. Revisa antes de confirmar.')
  if (!config.challenges.some(c => c.id === challengeId) || winner !== null && !config.teams.some(t => t.id === winner)) throw Error('Prueba o equipo no disponible.')
  const results = readResults(storage, config); results[challengeId] = winner
  storage.setItem(resultsKey(config.id), JSON.stringify(results))
}
// Called under the shared write lock; removed definitions cannot retain live results.
export function pruneResults(storage: Storage, config: ProfileConfig) {
  const raw = storage.getItem(resultsKey(config.id))
  if (!raw) return
  const value = JSON.parse(raw)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Resultados no válidos; conserva los datos del navegador.')
  const kept = Object.fromEntries(Object.entries(value).filter(([id, winner]) => config.challenges.some(c => c.id === id) && (winner === null || config.teams.some(t => t.id === winner))))
  storage.setItem(resultsKey(config.id), JSON.stringify(kept))
}
