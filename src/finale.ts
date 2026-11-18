import type { Participant, ProfileConfig, ProfileTeam } from './profile.ts'
export type FinaleConfig = { answer: string; secret: string; videoFilename: string; audioFilename: string; failureMessage: string }
export type FinaleStatus = 'ready' | 'rejecting' | 'failure' | 'revealing' | 'success'
export const finaleCeremonyPhases = ['intro', 'call1', 'clues1', 'answer1', 'fail1', 'call2', 'clues2', 'answer2', 'fail2', 'truth', 'captain', 'joint', 'jointFail', 'explosion', 'victory'] as const
export type FinaleCeremonyPhase = typeof finaleCeremonyPhases[number]
// Optional ceremony fields admit historical progress without rewriting it during a read.
export type FinaleProgress = { runId: string; status: FinaleStatus; signature: string; sound: boolean; ceremonyPhase?: FinaleCeremonyPhase; attempts?: [number, number, number]; earlyCorrect?: boolean; cluesMissing?: boolean; rejectedAnswer?: { text: string; turn: 0 | 1 | 2 } }
export type CeremonyFinaleProgress = FinaleProgress & { ceremonyPhase: FinaleCeremonyPhase; attempts: [number, number, number]; earlyCorrect: boolean; cluesMissing: boolean }
export type FinaleAction = { type: 'submit'; proposal: string } | { type: 'retry' | 'replay' | 'reset' | 'restore' | 'advance' } | { type: 'sound'; enabled: boolean } | { type: 'clues'; ready: boolean }
export const MAX_FINALE_ANSWER = 256
export const emptyFinale = (): FinaleConfig => ({ answer: '', secret: '', videoFilename: '', audioFilename: '', failureMessage: '' })
export function normalizeFinaleAnswer(value: string): string | null {
  if (typeof value !== 'string' || value.length > 1024 || /[\p{Cc}\p{Cf}]/u.test(value)) return null
  const normalized = value.normalize('NFC').toLocaleUpperCase('es').replace(/[ÁÉÍÓÚÜ]/g, vowel => ({ Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' })[vowel]!)
    .replace(/[\p{P}\p{S}]/gu, ' ').trim().replace(/\s+/gu, ' ')
  return normalized && normalized.length <= MAX_FINALE_ANSWER && /^[\p{L}\p{N} ]+$/u.test(normalized) ? normalized : null
}
export function parseFinale(value: unknown): FinaleConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Configuración del desenlace inválida.')
  const record = value as Record<string, unknown>, result = emptyFinale()
  if (Object.keys(record).some(key => !Object.hasOwn(result, key))) throw Error('Campos desconocidos en el desenlace.')
  for (const key of Object.keys(result) as (keyof FinaleConfig)[]) {
    const text = record[key], max = key === 'secret' ? 3000 : key === 'answer' ? 1024 : key === 'failureMessage' ? 280 : 120
    if (typeof text !== 'string' || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw Error(`Campo inválido en desenlace: ${key}.`)
    result[key] = text
  }
  if (result.answer && !normalizeFinaleAnswer(result.answer)) throw Error('La frase del desenlace debe contener hasta 256 caracteres significativos, sin controles.')
  for (const key of ['videoFilename', 'audioFilename'] as const) {
    const filename = result[key], extension = key === 'videoFilename' ? '(mp4|webm)' : '(mp3|wav|ogg|m4a)'
    if (filename && (filename.includes('..') || !new RegExp(`^[\\w-][\\w. -]*\\.${extension}$`, 'i').test(filename))) throw Error('Usa solo nombres de medios finales locales, sin rutas ni URL.')
  }
  return result
}
export const finaleProblems = (config: FinaleConfig): string[] => [!normalizeFinaleAnswer(config.answer) && 'Configura la frase secreta correcta.', !config.secret.trim() && 'Configura el secreto que revelará Wu.'].filter(Boolean) as string[]
// Non-security fingerprint for invalidating progress, without copying secrets into control state.
export function finaleSignature(config: FinaleConfig): string {
  const text = JSON.stringify(parseFinale(config)); let hash = 0xcbf29ce484222325n
  for (let index = 0; index < text.length; index++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 0x100000001b3n)
  return `${text.length}:${hash.toString(16)}`
}
export const createFinaleProgress = (config: FinaleConfig): CeremonyFinaleProgress => ({ runId: '', status: 'ready', signature: finaleSignature(config), sound: false, ceremonyPhase: 'intro', attempts: [0, 0, 0], earlyCorrect: false, cluesMissing: false })
export function finaleCeremony(progress: FinaleProgress): FinaleCeremonyPhase {
  return progress.ceremonyPhase ?? (progress.status === 'success' ? 'victory' : progress.status === 'revealing' ? 'explosion' : progress.status === 'failure' ? 'jointFail' : progress.status === 'rejecting' ? 'joint' : 'intro')
}
function normalizedProgress(progress: FinaleProgress): CeremonyFinaleProgress {
  return { ...progress, ceremonyPhase: finaleCeremony(progress), attempts: [...(progress.attempts ?? [0, 0, 0])], earlyCorrect: progress.earlyCorrect ?? false, cluesMissing: progress.cluesMissing ?? false }
}
export function finaleTeamIndex(progress: FinaleProgress): 0 | 1 | null {
  const phase = finaleCeremony(progress)
  return ['call1', 'clues1', 'answer1', 'fail1'].includes(phase) ? 0 : ['call2', 'clues2', 'answer2', 'fail2'].includes(phase) ? 1 : null
}
export const finaleCanAnswer = (progress: FinaleProgress): boolean => progress.status === 'ready' && ['answer1', 'answer2', 'joint'].includes(finaleCeremony(progress))
export const finaleHasProgress = (progress: FinaleProgress): boolean => finaleCeremony(progress) !== 'intro' || !!progress.attempts?.some(Boolean)
export function finaleRoster(config: ProfileConfig, index: 0 | 1): { team: ProfileTeam; name: string; color: string; captain: Participant | null; members: Participant[] } {
  const team = config.teams[index], members = config.participants.filter(person => team.memberIds.includes(person.id))
  const captain = members.find(person => person.id === team.captainId) ?? null
  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })
  const ordered = members.filter(person => person.id !== captain?.id).sort((a, b) => collator.compare(a.name, b.name))
  return { team, name: team.name || (index === 0 ? 'Primer clan' : 'Segundo clan'), color: team.color || (index === 0 ? '#e2aa65' : '#70d9e5'), captain, members: captain ? [captain, ...ordered] : ordered }
}
export function finalePreparationProblems(config: ProfileConfig): string[] {
  const problems = finaleProblems(config.finale)
  config.teams.forEach((team, index) => {
    const roster = finaleRoster(config, index as 0 | 1), label = `Equipo ${index + 1}`
    if (!team.name?.trim()) problems.push(`${label}: confirma su nombre.`)
    if (!team.color) problems.push(`${label}: confirma su color.`)
    if (!team.memberIds.length || roster.members.length !== team.memberIds.length) problems.push(`${label}: revisa todos sus integrantes.`)
    if (!roster.captain) problems.push(`${label}: elige un capitán que pertenezca a su equipo.`)
  })
  return problems
}
export function validFinaleProgress(value: unknown): value is FinaleProgress {
  if (!value || typeof value !== 'object') return false
  const p = value as FinaleProgress
  if (p.rejectedAnswer !== undefined && (!p.rejectedAnswer || typeof p.rejectedAnswer !== 'object' || ![0,1,2].includes(p.rejectedAnswer.turn) || !normalizeFinaleAnswer(p.rejectedAnswer.text) || !['rejecting','failure'].includes(p.status))) return false
  if (!(typeof p.runId === 'string' && p.runId.length <= 160 && ['ready', 'rejecting', 'failure', 'revealing', 'success'].includes(p.status) && typeof p.signature === 'string' && p.signature.length <= 6000 && typeof p.sound === 'boolean')) return false
  if (p.ceremonyPhase === undefined) return p.attempts === undefined && p.earlyCorrect === undefined && p.cluesMissing === undefined
  if (!finaleCeremonyPhases.includes(p.ceremonyPhase) || !Array.isArray(p.attempts) || p.attempts.length !== 3 || !p.attempts.every(count => Number.isSafeInteger(count) && count >= 0) || typeof p.earlyCorrect !== 'boolean' || typeof p.cluesMissing !== 'boolean') return false
  if (p.status === 'revealing') return p.ceremonyPhase === 'explosion'
  if (p.status === 'success') return p.ceremonyPhase === 'victory'
  if (p.status === 'failure') return ['fail1', 'fail2', 'jointFail'].includes(p.ceremonyPhase)
  if (p.status === 'rejecting') return ['answer1', 'answer2', 'joint'].includes(p.ceremonyPhase)
  return !['fail1', 'fail2', 'jointFail', 'explosion', 'victory'].includes(p.ceremonyPhase)
}
export function currentFinale(config: FinaleConfig, saved?: FinaleProgress): CeremonyFinaleProgress {
  return saved && validFinaleProgress(saved) && saved.signature === finaleSignature(config) ? normalizedProgress(saved) : createFinaleProgress(config)
}
export function finaleRejectedAnswer(config: FinaleConfig, progress: FinaleProgress): string {
  const rejected = progress.rejectedAnswer, phase = finaleCeremony(progress)
  const turn = phase === 'fail1' ? 0 : phase === 'fail2' ? 1 : phase === 'jointFail' ? 2 : -1
  return progress.status === 'failure' && rejected?.turn === turn && normalizeFinaleAnswer(rejected.text) !== normalizeFinaleAnswer(config.answer) ? rejected.text : ''
}
function withoutRejected(progress: CeremonyFinaleProgress): CeremonyFinaleProgress { const result = { ...progress }; delete result.rejectedAnswer; return result }
export function transitionFinale(config: FinaleConfig, saved: FinaleProgress, action: FinaleAction, runId: string): CeremonyFinaleProgress {
  const problems = finaleProblems(config); if (problems.length) throw Error(problems.join(' '))
  const progress = currentFinale(config, saved)
  if (action.type === 'sound') return { ...progress, sound: action.enabled }
  if (action.type === 'reset') return { ...createFinaleProgress(config), runId, sound: progress.sound }
  if (action.type === 'restore') return { ...settledFinale(progress), runId }
  if (action.type === 'advance') {
    const following: Partial<Record<FinaleCeremonyPhase, FinaleCeremonyPhase>> = { intro: 'call1', call1: 'clues1', fail1: 'call2', call2: 'clues2', fail2: 'truth', truth: 'captain', captain: 'joint' }
    const next = following[progress.ceremonyPhase]
    if (!next || ['rejecting', 'revealing'].includes(progress.status)) throw Error('Esta acción no corresponde al estado actual del desenlace.')
    return { ...withoutRejected(progress), ceremonyPhase: next, status: 'ready', runId, cluesMissing: false }
  }
  if (action.type === 'clues') {
    if (progress.status !== 'ready' || !['clues1', 'clues2'].includes(progress.ceremonyPhase)) throw Error('Espera a la pregunta sobre las pistas de este clan.')
    return { ...progress, runId, ceremonyPhase: action.ready ? progress.ceremonyPhase === 'clues1' ? 'answer1' : 'answer2' : progress.ceremonyPhase, cluesMissing: !action.ready }
  }
  if (action.type === 'submit') {
    if (!finaleCanAnswer(progress)) throw Error('Prepara el turno correspondiente antes de entregar otra respuesta.')
    const proposal = normalizeFinaleAnswer(action.proposal)
    if (!proposal) throw Error('Escribe una frase válida de hasta 256 caracteres significativos, sin controles.')
    const index = progress.ceremonyPhase === 'answer1' ? 0 : progress.ceremonyPhase === 'answer2' ? 1 : 2
    const attempts: [number, number, number] = [...progress.attempts]; attempts[index]++
    if (proposal !== normalizeFinaleAnswer(config.answer)) return { ...progress, runId, attempts, status: 'rejecting', rejectedAnswer: { text: action.proposal, turn: index } }
    return index < 2 ? { ...withoutRejected(progress), runId, attempts, status: 'ready', ceremonyPhase: 'captain', earlyCorrect: true } : { ...withoutRejected(progress), runId, attempts, status: 'revealing', ceremonyPhase: 'explosion' }
  }
  if (action.type === 'retry' && progress.status === 'failure' && progress.ceremonyPhase === 'jointFail') return { ...withoutRejected(progress), runId, status: 'ready', ceremonyPhase: 'joint' }
  if (action.type === 'replay' && progress.status === 'success') return { ...progress, runId, status: 'revealing', ceremonyPhase: 'explosion' }
  throw Error('Esta acción no corresponde al estado actual del desenlace.')
}
export function settledFinale(saved: FinaleProgress): CeremonyFinaleProgress {
  const progress = normalizedProgress(saved)
  if (progress.status === 'revealing') return { ...progress, status: 'success', ceremonyPhase: 'victory' }
  if (progress.status === 'rejecting') return { ...progress, status: 'failure', ceremonyPhase: progress.ceremonyPhase === 'answer1' ? 'fail1' : progress.ceremonyPhase === 'answer2' ? 'fail2' : 'jointFail' }
  return progress
}
