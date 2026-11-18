import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createConfig, parseConfig, exportConfig, copyConfig, distribute, assignMember, newId } from '../src/session.ts'
const fixture = () => {
  const c = createConfig()
  c.participants = Array.from({length: 9}, (_, i) => ({id: `p${i}`, name: `Ninja ${i}`, ...(i === 0 ? {age: 8, gender: 'otro'} : {})}))
  return c
}
test('JSON round trip preserves every configuration field and randomized assignment', () => {
  const c = fixture(); distribute(c)
  const json = exportConfig(c)
  assert.deepEqual(parseConfig(JSON.parse(json)), c)
  assert.deepEqual(parseConfig(JSON.parse(json)).teams, c.teams)
  assert.equal(Math.abs(c.teams[0].memberIds.length-c.teams[1].memberIds.length), 1)
  assert.equal(new Set(c.teams.flatMap(t=>t.memberIds)).size, 9)
  assert.equal(json.includes('revision'), false)
})
test('duplicate/import regenerate IDs and preserve assignments without progress or shared references', () => {
  const original = fixture(); distribute(original)
  const copy = copyConfig(original)
  assert.notEqual(copy.id, original.id)
  assert.equal(copy.participants.some(p=>original.participants.some(o=>o.id===p.id)), false)
  assert.equal(copy.teams.some(t=>original.teams.some(o=>o.id===t.id)), false)
  for (let i=0;i<2;i++) {
    const names = (c,t) => c.teams[t].memberIds.map(id=>c.participants.find(p=>p.id===id).name)
    assert.deepEqual(names(copy,i), names(original,i))
  }
  copy.participants[0].name = 'Changed'
  assert.notEqual(copy.participants[0].name, original.participants[0].name)
  assert.equal('progress' in copy, false)
})
test('manual moves are exclusive and allow unassigned participants', () => {
  const c = fixture(); assignMember(c, 'p0', c.teams[0].id); assignMember(c, 'p0', c.teams[1].id)
  assert.deepEqual(c.teams[0].memberIds, []); assert.deepEqual(c.teams[1].memberIds, ['p0'])
  assignMember(c, 'p0', null); assert.deepEqual(c.teams[1].memberIds, [])
})
test('reject invalid versions, fields, dates, duplicate IDs/members and broken references', () => {
  const mutations = [c=>c.schemaVersion=2,c=>c.progress={},c=>c.date='2026-02-30',c=>c.teams.pop(),c=>c.participants[1].id=c.participants[0].id,c=>c.participants[0].age=-1,c=>c.participants[0].name='',c=>c.teams[0].color='red',c=>c.teams[0].memberIds=['missing'],c=>{c.teams[0].memberIds=['p0'];c.teams[1].memberIds=['p0']},c=>c.assignmentMode='random']
  for (const mutate of mutations) {const c=fixture();mutate(c);assert.throws(()=>parseConfig(c))}
})
test('IDs work on HTTP origins without randomUUID', () => {
  const original = crypto.randomUUID
  try {
    crypto.randomUUID = undefined
    const ids = Array.from({length: 100}, newId)
    assert.equal(new Set(ids).size, 100)
    assert(ids.every(id => /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(id)))
  } finally { crypto.randomUUID = original }
})
