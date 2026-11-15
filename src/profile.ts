import { newId, parseConfig as parseLegacy } from './session.ts'
import type { Participant } from './session.ts'
export { newId }
export type { Participant }
export const profileIds = ['colegio', 'urbanizacion'] as const
export type ProfileId = typeof profileIds[number]
export type GameProgress = { profileId: ProfileId; sceneId: string; revision: number; token: string }
export const profileLabels: Record<ProfileId, string> = { colegio: 'Colegio', urbanizacion: 'Urbanización' }
export type ProfileTeam = { id: string; suggestedNames: string[]; name: string | null; color: string | null; memberIds: string[]; captainId: string | null }
export type ProfileConfig = {
  schemaVersion: 2; id: ProfileId; participants: Participant[]
  assignmentMode: 'manual' | 'automatic'; teams: [ProfileTeam, ProfileTeam]
  media: { artwork: string; video: string }
}
export function isProfileId(value: unknown): value is ProfileId { return profileIds.includes(value as ProfileId) }
export function createProfile(id: ProfileId): ProfileConfig {
  const team = (): ProfileTeam => ({ id: newId(), name: null, color: null, memberIds: [], suggestedNames: [], captainId: null })
  return { schemaVersion: 2, id, participants: [], assignmentMode: 'manual', teams: [team(), team()], media: { artwork: 'ninjago-key-art.png', video: 'master-wu.mp4' } }
}
function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Se esperaba un objeto JSON.')
  return value as Record<string, unknown>
}
function exact(o: Record<string, unknown>, fields: string[]) {
  if (Object.keys(o).some(k => !fields.includes(k))) throw Error('Hay campos desconocidos. El JSON solo puede contener configuración, sin progreso ni archivos binarios.')
}
function text(v: unknown, label: string, max = 120): string {
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw Error(`Campo inválido: ${label}.`)
  return v
}
function array(v: unknown, max = 500): unknown[] {
  if (!Array.isArray(v) || v.length > max) throw Error('Lista inválida o demasiado grande.')
  return v
}
function unique(ids: string[]) { if (new Set(ids).size !== ids.length) throw Error('Hay identificadores o miembros duplicados.') }
export function parseProfile(value: unknown): ProfileConfig {
  const o = obj(value); exact(o, ['schemaVersion', 'id', 'participants', 'assignmentMode', 'teams', 'media'])
  if (o.schemaVersion !== 2 || !isProfileId(o.id)) throw Error('Perfil o versión de esquema no compatible.')
  if (o.assignmentMode !== 'manual' && o.assignmentMode !== 'automatic') throw Error('Modo de reparto inválido.')
  const participants = array(o.participants).map(value => {
    const p = obj(value); exact(p, ['id', 'name', 'age', 'gender'])
    const result: Participant = { id: text(p.id, 'ID de participante'), name: text(p.name, 'nombre') }
    if (p.age !== undefined) {
      if (typeof p.age !== 'number' || !Number.isInteger(p.age) || p.age < 0 || p.age > 120) throw Error('Edad inválida.')
      result.age = p.age
    }
    if (p.gender !== undefined) result.gender = text(p.gender, 'género', 60)
    return result
  })
  const teams = array(o.teams, 2).map(value => {
    const t = obj(value); exact(t, ['id', 'name', 'color', 'memberIds', 'suggestedNames', 'captainId'])
    const name = t.name === null ? null : text(t.name, 'nombre definitivo')
    if (t.color !== null && (typeof t.color !== 'string' || !/^#[\da-f]{6}$/i.test(t.color))) throw Error('Color inválido. Elige un color o déjalo sin definir.')
    // Existing v2 files did not have captains. Normalize in memory without rewriting the original.
    const captainId = t.captainId == null ? null : text(t.captainId, 'capitán')
    const memberIds = array(t.memberIds).map(v => text(v, 'miembro'))
    if (captainId && !memberIds.includes(captainId)) throw Error('El capitán debe pertenecer a su equipo.')
    return { id: text(t.id, 'ID de equipo'), name, color: t.color as string | null, memberIds, captainId, suggestedNames: array(t.suggestedNames, 100).map(v => text(v, 'título sugerido')) }
  })
  if (teams.length !== 2) throw Error('El perfil debe tener exactamente dos equipos.')
  unique([o.id, ...participants.map(p => p.id), ...teams.map(t => t.id)])
  const members = teams.flatMap(t => t.memberIds); unique(members)
  if (members.some(id => !participants.some(p => p.id === id))) throw Error('Un equipo referencia un participante inexistente.')
  const m = obj(o.media); exact(m, ['artwork', 'video'])
  const artwork = text(m.artwork, 'archivo de ilustración'), video = text(m.video, 'archivo de vídeo')
  if (!/^[\w-][\w. -]*\.(png|jpe?g|webp)$/i.test(artwork) || !/^[\w-][\w. -]*\.(mp4|webm)$/i.test(video) || [artwork, video].some(v => v.includes('..'))) throw Error('Usa solo nombres de archivo locales, sin rutas, URL ni datos binarios.')
  return { schemaVersion: 2, id: o.id, participants, assignmentMode: o.assignmentMode, teams: teams as [ProfileTeam, ProfileTeam], media: { artwork, video } }
}
export const exportProfile = (c: ProfileConfig) => JSON.stringify(parseProfile(c), null, 2)
export const cloneProfile = (c: ProfileConfig) => parseProfile(JSON.parse(exportProfile(c)))
export function migrateLegacy(value: unknown, target: ProfileId): ProfileConfig {
  const old = parseLegacy(value), result = createProfile(target)
  result.participants = old.participants
  result.assignmentMode = old.assignmentMode
  result.teams = old.teams.map(t => ({ ...t, captainId: null, suggestedNames: [...old.proposedTeamNames] })) as ProfileConfig['teams']
  return parseProfile(result)
}
export function assignProfileMember(config: ProfileConfig, id: string, target: string | null) {
  if (!config.participants.some(p => p.id === id) || (target && !config.teams.some(t => t.id === target))) throw Error('Asignación inválida.')
  config.teams.forEach(t => { t.memberIds = t.memberIds.filter(p => p !== id); if (t.id === target) t.memberIds.push(id) })
  clearInvalidCaptains(config)
}
export function distributeProfile(config: ProfileConfig, random = Math.random) {
  const ids = config.participants.map(p => p.id)
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]] }
  config.teams.forEach((t, index) => { t.memberIds = ids.filter((_, i) => i % 2 === index) })
  clearInvalidCaptains(config)
  config.assignmentMode = 'automatic'
}
export function clearInvalidCaptains(config: { teams: { memberIds: string[]; captainId?: string | null }[] }) {
  config.teams.forEach(t => { if (t.captainId && !t.memberIds.includes(t.captainId)) t.captainId = null })
}
export function ceremonyProblems(config: ProfileConfig): string[] {
  return config.teams.flatMap((t, i) => !t.memberIds.length ? [`Equipo ${i + 1}: añade integrantes.`] : !t.captainId || !t.memberIds.includes(t.captainId) ? [`Equipo ${i + 1}: elige un capitán de su equipo.`] : [])
}
export function publicMembers(config: ProfileConfig, team: ProfileTeam): Participant[] {
  return [team.captainId, ...team.memberIds.filter(id => id !== team.captainId)]
    .map(id => config.participants.find(p => p.id === id)).filter((p): p is Participant => !!p)
}
export function mediaUrl(c: ProfileConfig, kind: 'artwork' | 'video', base: string): string {
  return `${base}private-media/${c.id}/${encodeURIComponent(c.media[kind])}`
}
