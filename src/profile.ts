import { newId, parseConfig as parseLegacy } from './session.ts'
import type { Participant } from './session.ts'
import { parseChallenges, type Challenge } from './challenges.ts'
import { emptyFinale, parseFinale, type FinaleConfig } from './finale.ts'
export { newId }
export type { Participant }
export const profileIds = ['colegio', 'urbanizacion'] as const
export type ProfileId = typeof profileIds[number]
export type GameProgress = { profileId: ProfileId; sceneId: string; revision: number; token: string }
export const profileLabels: Record<ProfileId, string> = { colegio: 'Colegio', urbanizacion: 'Urbanización' }
export const initialSuggestedNames = [
  ['Los Pepinillos del Trueno', 'Los Churros Voladores', 'Los Calcetines Ninja'],
  ['Las Croquetas Supersónicas', 'Los Flanes Furiosos', 'Los Pijamas del Dragón'],
] as const
const participantCollator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })
// Display order only: a new array keeps the original objects and stable identifiers.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
export function sortParticipants<T extends { name: string }>(participants: readonly T[]): T[] {
  return [...participants].sort((a, b) => participantCollator.compare(a.name, b.name))
}
export type ProfileTeam = { id: string; suggestedNames: string[]; name: string | null; color: string | null; memberIds: string[]; captainId: string | null }
export type ProfileConfig = {
  schemaVersion: 5; id: ProfileId; participants: Participant[]; challenges: Challenge[]; finale: FinaleConfig
  assignmentMode: 'manual' | 'automatic'; teams: [ProfileTeam, ProfileTeam]
  media: { artwork: string; video: string }
}
export function isProfileId(value: unknown): value is ProfileId { return profileIds.includes(value as ProfileId) }
export function createProfile(id: ProfileId): ProfileConfig {
  const team = (names: readonly string[]): ProfileTeam => ({ id: newId(), name: null, color: null, memberIds: [], suggestedNames: [...names], captainId: null })
  return { schemaVersion: 5, id, participants: [], challenges: [], finale: emptyFinale(), assignmentMode: 'manual', teams: [team(initialSuggestedNames[0]), team(initialSuggestedNames[1])], media: { artwork: 'ninjago-key-art.png', video: 'master-wu.mp4' } }
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
  const o = obj(value); exact(o, ['schemaVersion', 'id', 'participants', 'assignmentMode', 'teams', 'media', ...([3,4,5].includes(o.schemaVersion as number) ? ['challenges'] : []), ...(o.schemaVersion === 5 ? ['finale'] : [])])
  if (![2,3,4,5].includes(o.schemaVersion as number) || !isProfileId(o.id)) throw Error('Perfil o versión de esquema no compatible.')
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
  const challenges = o.schemaVersion === 2 ? [] : parseChallenges(o.challenges, o.schemaVersion === 3)
  unique([...participants.map(p => p.id), ...teams.map(t => t.id), ...challenges.map(c => c.id)])
  const result: ProfileConfig = { schemaVersion: 5, id: o.id, participants, challenges, finale: o.schemaVersion === 5 ? parseFinale(o.finale) : emptyFinale(), assignmentMode: o.assignmentMode, teams: teams as [ProfileTeam, ProfileTeam], media: { artwork, video } }
  if (new TextEncoder().encode(JSON.stringify(result, null, 2)).byteLength > 1024 * 1024) throw Error('La configuración supera el tamaño seguro de 1 MB.')
  return result
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
export function assignProfileMembers(config: ProfileConfig, ids: string[], target: string) {
  // Validate the whole operation before mutating; a stale/invalid selection cannot partially move a team.
  if (!config.teams.some(t => t.id === target) || new Set(ids).size !== ids.length || ids.some(id => !config.participants.some(p => p.id === id))) throw Error('Selección de integrantes no válida.')
  ids.forEach(id => assignProfileMember(config, id, target))
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
  const members = teamMembers(config, team)
  const captain = members.find(p => p.id === team.captainId)
  return captain ? [captain, ...members.filter(p => p.id !== captain.id)] : members
}
export function teamMembers(config: { participants: Participant[] }, team: { memberIds: string[] }): Participant[] {
  return sortParticipants(config.participants.filter(p => team.memberIds.includes(p.id)))
}
export function memberCandidateGroups(config: ProfileConfig, target: string) {
  const available = config.participants.filter(p => !config.teams.find(t => t.id === target)?.memberIds.includes(p.id))
  return [
    { id: 'unassigned', label: 'Participantes sin equipo', participants: sortParticipants(available.filter(p => !config.teams.some(t => t.memberIds.includes(p.id)))) },
    { id: 'other', label: 'Integrantes del equipo contrario', participants: sortParticipants(available.filter(p => config.teams.some(t => t.id !== target && t.memberIds.includes(p.id)))) },
  ]
}
export function mediaUrl(c: ProfileConfig, kind: 'artwork' | 'video', base: string): string {
  return `${base}private-media/${c.id}/${encodeURIComponent(c.media[kind])}`
}
