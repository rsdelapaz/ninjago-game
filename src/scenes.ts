import type { ProfileConfig } from './profile.ts'
import { challengeSceneId } from './challenges.ts'
export type SceneType = 'opening' | 'ceremony' | 'video' | 'challenge' | 'finale'
export type SceneDefinition = { id: string; order: number; type: SceneType; title: string; challengeId?: string; challengeNumber?: number }
export const scenes: readonly SceneDefinition[] = [
  { id: 'intro', order: 10, type: 'opening', title: 'El secreto del maestro Wu' },
  { id: 'ceremony', order: 20, type: 'ceremony', title: 'El despertar de los equipos' },
  { id: 'wu', order: 30, type: 'video', title: 'El mensaje del maestro Wu' },
]
export const orderedScenes = [...scenes].sort((a, b) => a.order - b.order)
export function scenesFor(config?: ProfileConfig | null): SceneDefinition[] {
  return [...orderedScenes, ...(config?.challenges.filter(c => c.visible).map((c, i): SceneDefinition => ({ id: challengeSceneId(c.id), order: 40 + i, type: 'challenge', title: c.title, challengeId: c.id, challengeNumber: i + 1 })) || []), { id: 'finale', order: 1000, type: 'finale', title: 'El último secreto del Maestro Wu' }]
}
export function sceneById(id: string, config?: ProfileConfig | null) { return scenesFor(config).find(s => s.id === id) }
export function sceneByNumber(number: number, config?: ProfileConfig | null) { return scenesFor(config)[number - 1] }
export function adjacentScene(id: string, direction: -1 | 1, config?: ProfileConfig | null) {
  const list = scenesFor(config), index = list.findIndex(s => s.id === id)
  return index < 0 ? undefined : list[index + direction]
}
