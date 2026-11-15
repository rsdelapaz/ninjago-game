import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, parseProfile, exportProfile, ceremonyProblems, assignProfileMember, clearInvalidCaptains, publicMembers, distributeProfile, migrateLegacy } from '../src/profile.ts'
import { createConfig } from '../src/session.ts'
import { assignProfileMembers } from '../src/profile.ts'
test('bulk assignment transfers exclusive members, clears the old captain and validates atomically',()=>{
  const c=createProfile('colegio');c.participants=['a','b','c'].map(id=>({id,name:'Prueba '+id}))
  c.teams[0].memberIds=['a','b'];c.teams[0].captainId='a'
  assignProfileMembers(c,['a','c'],c.teams[1].id)
  assert.deepEqual(c.teams[0].memberIds,['b']);assert.equal(c.teams[0].captainId,null)
  assert.deepEqual(c.teams[1].memberIds,['a','c'])
  c.teams[1].captainId='a';assignProfileMembers(c,['a'],c.teams[1].id);assert.equal(c.teams[1].captainId,'a')
  const before=JSON.stringify(c)
  assert.throws(()=>assignProfileMembers(c,['b','missing'],c.teams[1].id))
  assert.throws(()=>assignProfileMembers(c,['b','b'],c.teams[1].id))
  assert.equal(JSON.stringify(c),before)
})
test('old v2 and legacy configs normalize to no captain without mutating source', () => {
  const old = createProfile('colegio'); old.teams.forEach(t => delete t.captainId)
  assert(parseProfile(old).teams.every(t => t.captainId === null))
  assert(old.teams.every(t => !('captainId' in t)))
  assert(migrateLegacy(createConfig(), 'colegio').teams.every(t => t.captainId === null))
})
test('captains belong to teams, round trip in JSON and appear first in public', () => {
  const c = createProfile('colegio')
  c.participants = [{id:'a',name:'Prueba A'},{id:'b',name:'Prueba B'},{id:'c',name:'Prueba C'}]
  c.teams[0].memberIds = ['a','b']; c.teams[0].captainId = 'b'
  c.teams[1].memberIds = ['c']; c.teams[1].captainId = 'c'
  assert.deepEqual(ceremonyProblems(c), [])
  assert.equal(JSON.parse(exportProfile(c)).teams[0].captainId, 'b')
  assert.deepEqual(publicMembers(c,c.teams[0]).map(p=>p.id), ['b','a'])
  c.teams[0].captainId = 'c'; assert.throws(()=>parseProfile(c), /capitán/)
  c.teams[0].captainId = null; assert.equal(ceremonyProblems(c).length, 1)
})
test('moving, removing and drawing invalidate captains only when membership changes', () => {
  const c = createProfile('colegio'); c.participants=[{id:'a',name:'Prueba A'},{id:'b',name:'Prueba B'}]
  c.teams[0].memberIds=['a']; c.teams[0].captainId='a'; c.teams[1].memberIds=['b']; c.teams[1].captainId='b'
  assignProfileMember(c,'a',c.teams[0].id); assert.equal(c.teams[0].captainId,'a')
  assignProfileMember(c,'a',c.teams[1].id); assert.equal(c.teams[0].captainId,null)
  c.teams[1].memberIds=[]; clearInvalidCaptains(c); assert.equal(c.teams[1].captainId,null)
  c.teams[0].memberIds=['a'];c.teams[0].captainId='a'
  distributeProfile(c,()=>0); assert.equal(c.teams[0].captainId,null)
  assert(ceremonyProblems(c).length > 0)
})
