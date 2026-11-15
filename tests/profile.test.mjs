import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, parseProfile, cloneProfile, exportProfile, migrateLegacy, distributeProfile, assignProfileMember, mediaUrl } from '../src/profile.ts'
import { initializeProfiles, readProfile, saveProfile, profileKey, legacyEntries } from '../src/profileStorage.ts'
import { createConfig } from '../src/session.ts'
import { orderedScenes, sceneById, sceneByNumber, adjacentScene } from '../src/scenes.ts'
class MemoryStorage {
  data = new Map()
  get length() { return this.data.size }
  key(i) { return [...this.data.keys()][i] ?? null }
  getItem(k) { return this.data.get(k) ?? null }
  setItem(k,v) { this.data.set(k,v) }
}
test('two profiles initialize with exactly two unnamed, uncolored, empty teams', () => {
  const s = new MemoryStorage(); initializeProfiles(s)
  for (const id of ['colegio','urbanizacion']) {
    const p = readProfile(s,id); assert.equal(p.teams.length,2)
    assert(p.teams.every(t=>t.name===null&&t.color===null&&t.memberIds.length===0&&t.suggestedNames.length===3))
  }
  const before = [...s.data]; initializeProfiles(s); assert.deepEqual([...s.data], before)
})
test('export/import round trip, balanced assignment, isolation, optimistic saves and history', () => {
  const s = new MemoryStorage(); initializeProfiles(s)
  const urban = s.getItem(profileKey('urbanizacion')), p = readProfile(s,'colegio')
  p.participants = Array.from({length:7},(_,i)=>({id:`synthetic-${i}`,name:`Prueba ${i}`}))
  distributeProfile(p,()=>.42)
  assert.equal(Math.abs(p.teams[0].memberIds.length-p.teams[1].memberIds.length),1)
  const before = s.getItem(profileKey(p.id)); saveProfile(s,p,before)
  const loaded = readProfile(s,p.id); assert.deepEqual(parseProfile(JSON.parse(exportProfile(loaded))),p)
  assert.equal(s.getItem(profileKey('urbanizacion')),urban)
  assert.throws(()=>saveProfile(s,p,before), /otra ventana/)
  assert([...s.data.keys()].some(k=>k.startsWith('ninja-profile-history:')))
  const copy = cloneProfile(p); copy.participants[0].name='Editado'; assert.notEqual(copy.participants[0].name,p.participants[0].name)
  assignProfileMember(copy,copy.participants[0].id,copy.teams[1].id)
  assert.equal(copy.teams.flatMap(t=>t.memberIds).filter(id=>id===copy.participants[0].id).length,1)
  assert(!exportProfile(copy).includes('sceneId'))
})
test('explicit migration retains legacy records and maps members, titles and colors', () => {
  const old = createConfig(); old.participants=[{id:'old-ninja',name:'Prueba heredada'}]; old.teams[0].memberIds=['old-ninja']
  const s=new MemoryStorage(), key=`ninja-config-v1:${old.id}`, raw=JSON.stringify(old);s.setItem(key,raw);initializeProfiles(s)
  const candidate = migrateLegacy(JSON.parse(legacyEntries(s)[0].raw),'colegio')
  saveProfile(s,candidate,s.getItem(profileKey('colegio')))
  assert.equal(s.getItem(key),raw);assert.deepEqual(candidate.teams[0].memberIds,['old-ninja'])
  assert.deepEqual(candidate.teams[0].suggestedNames,old.proposedTeamNames)
  assert.equal(candidate.teams[0].name,old.teams[0].name)
  assert.equal(readProfile(s,'urbanizacion').participants.length,0)
})
test('strict config validation rejects broken references, duplicates, binary/remote paths and versions', () => {
  const mutations=[p=>p.schemaVersion=1,p=>p.id='other',p=>p.progress={},p=>p.teams.pop(),p=>p.teams[0].memberIds=['missing'],p=>p.media.video='https://host/video.mp4',p=>p.media.artwork='../urbanizacion/art.png',p=>p.teams[0].name='',p=>p.teams[0].color='red',p=>p.media.binary='data:video/x',p=>{p.participants=[{id:'x',name:'X'}];p.teams.forEach(t=>t.memberIds=['x'])}]
  for(const mutate of mutations){const p=createProfile('colegio');mutate(p);assert.throws(()=>parseProfile(p))}
  assert.equal(mediaUrl(createProfile('urbanizacion'),'video','./'),'./private-media/urbanizacion/master-wu.mp4')
})
test('scene IDs and types are independent of presentation numbers and order values', () => {
  assert.equal(sceneByNumber(1).id,'intro');assert.equal(sceneByNumber(2).type,'ceremony');assert.equal(sceneByNumber(3).type,'video')
  assert.equal(sceneById('wu').order,30);assert.equal(adjacentScene('intro',1).id,'ceremony')
  assert.equal(adjacentScene('intro',-1),undefined);assert.equal(adjacentScene('wu',1),undefined)
  assert.equal(new Set(orderedScenes.map(s=>s.id)).size,orderedScenes.length)
})
