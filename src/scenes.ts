export type SceneType = 'opening' | 'video'
export type SceneDefinition = { id: string; order: number; type: SceneType; title: string }
export const scenes: readonly SceneDefinition[] = [
  { id: 'intro', order: 10, type: 'opening', title: 'El secreto del maestro Wu' },
  { id: 'wu', order: 20, type: 'video', title: 'El mensaje del maestro Wu' },
]
export const orderedScenes = [...scenes].sort((a, b) => a.order - b.order)
export function sceneById(id: string) { return orderedScenes.find(s => s.id === id) }
export function sceneByNumber(number: number) { return orderedScenes[number - 1] }
export function adjacentScene(id: string, direction: -1 | 1) { return orderedScenes[orderedScenes.findIndex(s => s.id === id) + direction] }
