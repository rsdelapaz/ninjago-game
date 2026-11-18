// Legacy schema v1 retained for explicit recovery; active configuration uses ProfileConfig.
export type Participant = { id: string; name: string; age?: number; gender?: string }
export type Team = { id: string; name: string; color: string; memberIds: string[] }
export type LegacySessionConfig = {
  schemaVersion: 1; id: string; name: string; date: string
  participants: Participant[]; proposedTeamNames: string[]
  assignmentMode: 'manual' | 'automatic'; teams: [Team, Team]
}
export type GameProgress = { sessionId: string | null; scene: 'intro' | 'wu'; revision: number }
// Reserved contract for a separate future backup, never used by configuration exports.
export type FullBackup = { kind: 'full-backup'; schemaVersion: 1; configs: LegacySessionConfig[]; progress: GameProgress[] }
// getRandomValues also works on HTTP origins where randomUUID is unavailable.
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
const fail = (message: string): never => { throw new Error(message) }
function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : fail('Se esperaba un objeto JSON.')
}
function keys(o: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(o).some(k => !allowed.includes(k))) fail('Hay campos desconocidos. Importa solo configuración, sin progreso.')
}
function text(v: unknown, field: string, max = 120): string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v : fail(`Campo inválido: ${field}.`)
}
function list(v: unknown, max = 500): unknown[] { return Array.isArray(v) && v.length <= max ? v : fail('Lista inválida o demasiado grande.') }
function unique(ids: string[]) { if (new Set(ids).size !== ids.length) fail('Hay identificadores o miembros duplicados.') }
export function parseConfig(value: unknown): LegacySessionConfig {
  const o = object(value)
  keys(o, ['schemaVersion', 'id', 'name', 'date', 'participants', 'proposedTeamNames', 'assignmentMode', 'teams'])
  if (o.schemaVersion !== 1) fail('Versión de esquema no compatible.')
  const id = text(o.id, 'identificador'), name = text(o.name, 'nombre'), date = text(o.date, 'fecha')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) fail('Fecha inválida.')
  const participants = list(o.participants).map(v => {
    const p = object(v); keys(p, ['id', 'name', 'age', 'gender'])
    const result: Participant = { id: text(p.id, 'id participante'), name: text(p.name, 'nombre participante') }
    if (p.age !== undefined) {
      const age = p.age
      if (typeof age !== 'number' || !Number.isInteger(age) || age < 0 || age > 120) return fail('Edad inválida.')
      result.age = age
    }
    if (p.gender !== undefined) result.gender = text(p.gender, 'género', 60)
    return result
  })
  unique(participants.map(p => p.id))
  const proposedTeamNames = list(o.proposedTeamNames, 100).map(v => text(v, 'nombre propuesto'))
  const assignmentMode = o.assignmentMode
  if (assignmentMode !== 'manual' && assignmentMode !== 'automatic') fail('Modo de asignación inválido.')
  const teams = list(o.teams, 2).map(v => {
    const t = object(v); keys(t, ['id', 'name', 'color', 'memberIds'])
    const color = text(t.color, 'color')
    if (!/^#[\da-f]{6}$/i.test(color)) fail('El color debe ser hexadecimal #RRGGBB.')
    return { id: text(t.id, 'id equipo'), name: text(t.name, 'nombre equipo'), color, memberIds: list(t.memberIds).map(v => text(v, 'miembro')) }
  })
  if (teams.length !== 2) fail('Debe haber exactamente dos equipos.')
  unique([id, ...participants.map(p => p.id), ...teams.map(t => t.id)])
  const members = teams.flatMap(t => t.memberIds); unique(members)
  if (members.some(id => !participants.some(p => p.id === id))) fail('Un equipo referencia un participante inexistente.')
  return { schemaVersion: 1, id, name, date, participants, proposedTeamNames, assignmentMode: assignmentMode as LegacySessionConfig['assignmentMode'], teams: teams as [Team, Team] }
}
export function exportConfig(config: LegacySessionConfig): string { return JSON.stringify(parseConfig(config), null, 2) }
export function copyConfig(config: LegacySessionConfig): LegacySessionConfig {
  const copy = parseConfig(JSON.parse(exportConfig(config)))
  const ids = new Map(copy.participants.map(p => [p.id, newId()]))
  copy.id = newId()
  copy.participants.forEach(p => { p.id = ids.get(p.id)! })
  copy.teams.forEach(t => { t.id = newId(); t.memberIds = t.memberIds.map(id => ids.get(id)!) })
  return copy
}
export function createConfig(): LegacySessionConfig {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { schemaVersion: 1, id: newId(), name: 'Nueva misión ninja', date, participants: [], proposedTeamNames: ['Dragones', 'Tormenta'], assignmentMode: 'manual', teams: [{ id: newId(), name: 'Dragones', color: '#d82727', memberIds: [] }, { id: newId(), name: 'Tormenta', color: '#267ac6', memberIds: [] }] }
}
export function assignMember(config: LegacySessionConfig, participantId: string, teamId: string | null) {
  if (!config.participants.some(p => p.id === participantId) || (teamId !== null && !config.teams.some(t => t.id === teamId))) fail('Asignación inválida.')
  config.teams.forEach(t => { t.memberIds = t.memberIds.filter(id => id !== participantId); if (t.id === teamId) t.memberIds.push(participantId) })
}
export function distribute(config: LegacySessionConfig, random = Math.random) {
  const ids = config.participants.map(p => p.id)
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]] }
  config.teams.forEach((t, index) => { t.memberIds = ids.filter((_, i) => i % 2 === index) })
  config.assignmentMode = 'automatic'
}
