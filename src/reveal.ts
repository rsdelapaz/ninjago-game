import { publicMembers, type ProfileConfig } from './profile.ts'

export const REVEAL_PAGE_MS = 10000
export const REVEAL_ACTIVATION_MS = 2200
// Four compact rows: two columns for up to eight, three for larger formations.
// Keep group boundaries identical in both windows, independent of name length.
export const REVEAL_CAPACITY = 12
export type RevealState = { startedAt: number; page: number; animate: boolean; automatic: boolean }
export type RevealAction = 'replay' | 'skip' | 'previous' | 'next' | 'pause'
export function createReveal(now: number): RevealState { return { startedAt: now, page: 0, animate: true, automatic: true } }
export function validReveal(value: unknown): value is RevealState {
  if (!value || typeof value !== 'object') return false
  const r = value as RevealState
  return Number.isSafeInteger(r.startedAt) && r.startedAt >= 0 && Number.isSafeInteger(r.page) && r.page >= 0 && r.page <= 500 && typeof r.animate === 'boolean' && typeof r.automatic === 'boolean'
}
export function revealPlan(config: ProfileConfig) {
  const teams = config.teams.map(team => {
    const members = publicMembers(config, team)
    const capacity = REVEAL_CAPACITY
    const pages = Array.from({ length: Math.max(1, Math.ceil(members.length / capacity)) }, (_, i) => members.slice(i * capacity, (i + 1) * capacity))
    return { team, members, pages }
  })
  return { teams, count: Math.max(...teams.map(t => t.pages.length)) }
}
export function revealFrame(state: RevealState, count: number, now: number) {
  const elapsed = Math.max(0, now - state.startedAt), last = Math.max(0, count - 1)
  const offset = state.automatic ? Math.floor(elapsed / REVEAL_PAGE_MS) : 0
  const page = Math.min(last, state.page + offset)
  const pageStartedAt = state.startedAt + (page - Math.min(last, state.page)) * REVEAL_PAGE_MS
  return { page, pageStartedAt, activated: !state.animate || now - pageStartedAt >= REVEAL_ACTIVATION_MS }
}
export function changeReveal(state: RevealState, action: RevealAction, count: number, now: number): RevealState {
  const frame = revealFrame(state, count, now)
  if (action === 'replay') return createReveal(now)
  if (action === 'skip') return { ...state, page: frame.page, startedAt: now, animate: false }
  if (action === 'pause') return { ...state, page: frame.page, startedAt: now, automatic: !state.automatic, animate: false }
  if (action === 'next' || action === 'previous') return { ...state, page: Math.max(0, Math.min(count - 1, frame.page + (action === 'next' ? 1 : -1))), startedAt: now, automatic: false, animate: false }
  throw Error('Acción de revelación desconocida.')
}
