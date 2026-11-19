export type WordBoard = { initial: number[]; order: number[] }

export function finaleWords(answer: string): string[] {
  return answer.normalize('NFC').toLocaleUpperCase('es').split(/[\s\p{P}\p{S}]+/u).filter(Boolean)
}

export function createWordBoard(words: string[]): WordBoard {
  const byWord = new Map<string, number[]>()
  words.forEach((word, id) => {
    if (!byWord.has(word)) byWord.set(word, [])
    byWord.get(word)!.push(id)
  })
  const groups = [...byWord.values()]
  // Keep equal words contiguous while varying the cycle of groups each run.
  for (let i = groups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const group = groups[i]
    groups[i] = groups[j]
    groups[j] = group
  }
  const shift = Math.max(0, ...groups.map(group => group.length))
  const positions = groups.flat()
  const initial = Array<number>(words.length)
  // Rotating by the largest group separates all equal words when it fits
  // in half the list. With a majority it leaves only unavoidable matches.
  positions.forEach((id, i) => { initial[id] = positions[(i + shift) % words.length] })
  return { initial, order: [...initial] }
}

export function validWordBoard(value: unknown, size?: number): value is WordBoard {
  if (!value || typeof value !== 'object') return false
  const { initial, order } = value as WordBoard
  if (!Array.isArray(initial) || !Array.isArray(order) || initial.length !== order.length ||
      initial.length < 1 || initial.length > 128 || (size !== undefined && size !== initial.length)) return false
  return [initial, order].every(ids => new Set(ids).size === ids.length &&
    [...ids].every(id => Number.isInteger(id) && id >= 0 && id < ids.length))
}
