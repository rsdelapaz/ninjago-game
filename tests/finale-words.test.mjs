import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWordBoard, finaleWords, validWordBoard } from '../src/finaleWords.ts'
import { createFinaleProgress, currentFinale, transitionFinale } from '../src/finale.ts'

test('board takes the words from the phrase, uppercases them and preserves accents and duplicates', () => {
  assert.deepEqual(finaleWords('  ¡niño, aún un niño!  '), ['NIÑO', 'AÚN', 'UN', 'NIÑO'])
})

test('the principal phrase and repeated-word cases never start with an avoidable match', () => {
  const phrases = [
    'UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES',
    'A A A B C D', 'A B A B', 'A B C A B C', 'A A A B', 'A A', 'SOLO',
  ]
  for (const phrase of phrases) {
    const words = finaleWords(phrase)
    const maximum = Math.max(...words.map(word => words.filter(value => value === word).length))
    for (let attempt = 0; attempt < 40; attempt++) {
      const board = createWordBoard(words)
      assert(validWordBoard(board, words.length))
      assert.deepEqual(board.order, board.initial)
      assert.equal(board.initial.filter((id, index) => words[id] === words[index]).length, Math.max(0, 2 * maximum - words.length), phrase)
    }
  }
  assert(!validWordBoard({ initial: [0, 1], order: [0, 0] }))
})

test('moves only reinsert a ficha, even when they happen to solve the phrase', () => {
  const config = { answer: 'Juntos podemos', secret: 'Secreto privado', videoFilename: '', audioFilename: '', failureMessage: '' }
  const captain = { ...createFinaleProgress(config), ceremonyPhase: 'captain', attempts: [1, 1, 0] }
  assert.throws(() => transitionFinale(config, captain, { type: 'move-word', from: 0, to: 1 }, 'blocked'))
  const start = transitionFinale(config, captain, { type: 'advance' }, 'board')
  assert.deepEqual(start.wordBoard.order, [1, 0])
  assert.throws(() => transitionFinale(config, start, { type: 'move-word', from: 0, to: 2 }, 'invalid'))
  const moved = transitionFinale(config, start, { type: 'move-word', from: 0, to: 1 }, 'ignored')
  assert.deepEqual(moved, { ...start, wordBoard: { initial: [1, 0], order: [0, 1] } })
  assert.deepEqual(currentFinale(config, JSON.parse(JSON.stringify(moved))), moved)
  const reset = transitionFinale(config, moved, { type: 'reset' }, 'new-game')
  assert.equal(reset.wordBoard, undefined)
  const early = transitionFinale(config, { ...captain, earlyCorrect: true }, { type: 'advance' }, 'skip')
  assert.equal(early.ceremonyPhase, 'joint')
  assert.equal(early.wordBoard, undefined)
})
