import { newId } from './session.ts'
export type Challenge = { id: string; title: string; description: string; imageFilename: string; visible: boolean }
export const MAX_CHALLENGES = 500
export function parseChallenges(value: unknown): Challenge[] {
  if (!Array.isArray(value) || value.length > MAX_CHALLENGES) throw Error('La lista de pruebas supera el tamaño seguro (500).')
  const result = value.map(v => {
    if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some(k => !['id','title','description','imageFilename','visible'].includes(k))) throw Error('Prueba no válida.')
    const c = v as Challenge
    if (typeof c.id !== 'string' || !/^[\w-]{1,120}$/.test(c.id) || Object.hasOwn(Object.prototype, c.id) || typeof c.title !== 'string' || !c.title.trim() || c.title.length > 160 || typeof c.description !== 'string' || c.description.length > 4000 || typeof c.visible !== 'boolean' || typeof c.imageFilename !== 'string' || c.imageFilename.length > 120 || c.imageFilename && (!/^[\w-][\w. -]*\.(png|jpe?g|webp)$/i.test(c.imageFilename) || c.imageFilename.includes('..'))) throw Error('Revisa el título (160), descripción (4000) e imagen local de la prueba.')
    return { id: c.id, title: c.title, description: c.description, imageFilename: c.imageFilename, visible: c.visible }
  })
  if (new Set(result.map(c => c.id)).size !== result.length) throw Error('Hay pruebas duplicadas.')
  if (JSON.stringify(result).length > 750000) throw Error('Las pruebas superan el tamaño seguro de configuración.')
  return result
}
export function newChallenge(): Challenge { return { id: newId(), title: 'Nueva prueba', description: '', imageFilename: '', visible: true } }
export function duplicateChallenge(list: Challenge[], id: string) {
  const index = list.findIndex(c => c.id === id)
  if (index < 0 || list.length >= MAX_CHALLENGES) throw Error('No se puede duplicar esta prueba.')
  const copy = { ...list[index]!, id: newId() }
  list.splice(index + 1, 0, copy); return copy
}
export function moveChallenge(list: Challenge[], id: string, direction: -1 | 1) {
  const i = list.findIndex(c => c.id === id), j = i + direction
  if (i < 0 || j < 0 || j >= list.length) return
  const [item] = list.splice(i, 1); list.splice(j, 0, item!)
}
export const challengeSceneId = (id: string) => `challenge:${id}`
export const challengeImageUrl = (profileId: string, filename: string, base = './') => `${base}private-media/${profileId}/${encodeURIComponent(filename)}`
