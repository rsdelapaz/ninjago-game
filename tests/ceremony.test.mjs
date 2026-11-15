import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, exportProfile } from '../src/profile.ts'
import { createCeremony, parseCeremony, transitionCeremony, colorOptions, currentProposal, ceremonyFinalProblems } from '../src/ceremony.ts'
import { initializeProfiles, profileKey, readProfile, saveProfile } from '../src/profileStorage.ts'
import { applyCeremony, readCeremony, ceremonyKey, recoverCeremony } from '../src/ceremonyStorage.ts'
function fixture(id='colegio') {
  const c=createProfile(id)
  c.participants=[{id:'a',name:'Prueba A'},{id:'b',name:'Prueba B'}]
  c.teams.forEach((t,i)=>{t.memberIds=[c.participants[i].id];t.captainId=t.memberIds[0];t.suggestedNames=i?['Vientos','Rocas']:['Llamas','Rayos']})
  return c
}
class MemoryStorage {
  data=new Map(); failKey=null
  get length(){return this.data.size} key(i){return [...this.data.keys()][i]??null}
  getItem(k){return this.data.get(k)??null}
  setItem(k,v){if(k===this.failKey)throw Error('Quota simulated');this.data.set(k,v)}
  removeItem(k){this.data.delete(k)}
}
test('complete ceremony follows all phases and preserves confirmed decisions on back/reload',()=>{
  let c=fixture(),p=createCeremony(c.id)
  const act=a=>{({config:c,progress:p}=transitionCeremony(c,p,a))}
  act({type:'next'});assert.equal(p.phase,'color-1')
  assert.throws(()=>act({type:'next'}),/color/)
  act({type:'color',color:colorOptions(c,p)[0].hex});act({type:'next'})
  act({type:'reject-name'});assert.equal(currentProposal(c,p),'Rayos')
  act({type:'accept-name'});act({type:'next'});assert.equal(p.phase,'color-2')
  const choices=colorOptions(c,p);assert.equal(choices.length,2);assert(choices.every(o=>o.hex!==c.teams[0].color))
  assert.throws(()=>act({type:'color',color:c.teams[0].color}),/colores/)
  act({type:'color',color:choices[0].hex});act({type:'next'});act({type:'accept-name'});act({type:'next'})
  assert.equal(p.phase,'ready');assert.deepEqual(ceremonyFinalProblems(c,p),[])
  const decisions=exportProfile(c)
  act({type:'back'});assert.equal(p.phase,'name-2');assert.equal(exportProfile(c),decisions)
  p=parseCeremony(JSON.parse(JSON.stringify(p)),c.id);act({type:'next'});act({type:'next'});assert.equal(p.phase,'complete')
  assert.equal(exportProfile(c),decisions);assert(!exportProfile(c).includes('confirmedNames'))
})
test('incomplete teams, wrong profiles, invalid phases and premature actions are rejected',()=>{
  const c=fixture(),p=createCeremony(c.id)
  c.teams[0].captainId=null;assert.throws(()=>transitionCeremony(c,p,{type:'next'}),/capitán/)
  assert.throws(()=>parseCeremony(p,'urbanizacion'),/perfil/)
  assert.throws(()=>parseCeremony({...p,phase:'nonsense'},c.id))
  assert.throws(()=>transitionCeremony(fixture(),p,{type:'accept-name'}),/nombre/)
  assert.throws(()=>transitionCeremony(fixture(),p,{type:'back'}),/principio/)
})
test('exhausted suggestions allow manual names; duplicates ignore case and whitespace',()=>{
  let c=fixture(),p=createCeremony(c.id)
  p.phase='name-1';c.teams[1].name='  RAYOS  '
  assert.throws(()=>transitionCeremony(c,p,{type:'manual-name',name:'Uno'}),/propuestas/)
  ;({config:c,progress:p}=transitionCeremony(c,p,{type:'reject-name'}))
  assert.throws(()=>transitionCeremony(c,p,{type:'accept-name'}),/diferentes/)
  ;({config:c,progress:p}=transitionCeremony(c,p,{type:'reject-name'}))
  assert.equal(currentProposal(c,p),null)
  assert.throws(()=>transitionCeremony(c,p,{type:'manual-name',name:'rayos'}),/diferentes/)
  ;({config:c,progress:p}=transitionCeremony(c,p,{type:'manual-name',name:'Dragones'}))
  assert.equal(c.teams[0].name,'Dragones');assert(p.confirmedNames[0])
})
test('storage isolates profiles and rejects stale config/progress without any overwrite',()=>{
  const s=new MemoryStorage();initializeProfiles(s)
  saveProfile(s,fixture(),s.getItem(profileKey('colegio')))
  const other=s.getItem(profileKey('urbanizacion')),before=s.getItem(profileKey('colegio'))
  applyCeremony(s,'colegio',before,null,{type:'next'})
  const snapshot=[...s.data]
  assert.throws(()=>applyCeremony(s,'colegio',before,null,{type:'next'}),/Otra ventana/)
  assert.deepEqual([...s.data],snapshot);assert.equal(s.getItem(profileKey('urbanizacion')),other)
  assert.equal(readCeremony(s,'colegio').phase,'color-1');assert.equal(readCeremony(s,'urbanizacion').phase,'arrival')
  applyCeremony(s,'colegio',before,s.getItem(ceremonyKey('colegio')),{type:'color',color:colorOptions(readProfile(s,'colegio'),readCeremony(s,'colegio'))[0].hex})
  const current=s.getItem(profileKey('colegio'))
  assert.notEqual(current,before);assert.throws(()=>applyCeremony(s,'colegio',before,s.getItem(ceremonyKey('colegio')),{type:'next'}),/Otra ventana/)
  const edited=readProfile(s,'colegio');edited.participants[0].name='Prueba editada';saveProfile(s,edited,current)
  assert.equal(readCeremony(s,'colegio').phase,'arrival');assert(readCeremony(s,'colegio').confirmedColors.every(v=>!v))
})
test('interrupted config/progress write recovers exact choice without deleting profile or legacy data',()=>{
  const s=new MemoryStorage();initializeProfiles(s);saveProfile(s,fixture(),s.getItem(profileKey('colegio')))
  s.setItem('ninja-config-v1:untouched','synthetic original')
  applyCeremony(s,'colegio',s.getItem(profileKey('colegio')),null,{type:'next'})
  const before=s.getItem(profileKey('colegio')),progress=s.getItem(ceremonyKey('colegio'))
  s.failKey=ceremonyKey('colegio')
  assert.throws(()=>applyCeremony(s,'colegio',before,progress,{type:'color',color:colorOptions(fixture(),readCeremony(s,'colegio'))[0].hex}),/Quota/)
  assert(s.getItem('ninja-ceremony-pending:colegio'))
  assert.throws(()=>saveProfile(s,fixture(),s.getItem(profileKey('colegio'))),/pendiente/)
  s.failKey=null;recoverCeremony(s,'colegio')
  assert(readCeremony(s,'colegio').confirmedColors[0]);assert.equal(readProfile(s,'colegio').teams[0].color,'#e34b42')
  assert.equal(s.getItem('ninja-ceremony-pending:colegio'),null);assert.equal(s.getItem('ninja-config-v1:untouched'),'synthetic original')
})
