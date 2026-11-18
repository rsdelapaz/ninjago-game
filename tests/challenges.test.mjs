import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, cloneProfile, parseProfile, exportProfile, migrateLegacy } from '../src/profile.ts'
import { newChallenge, duplicateChallenge, moveChallenge, parseChallenges } from '../src/challenges.ts'
import { scenesFor, sceneById, sceneByNumber, adjacentScene } from '../src/scenes.ts'
import { initializeProfiles, readProfile, profileKey, presentationKey } from '../src/profileStorage.ts'
import { applyProfileConfig, readCeremony, ceremonyKey, recoverCeremony, applyProfileReset } from '../src/ceremonyStorage.ts'
import { createCeremony } from '../src/ceremony.ts'
import { readResults, saveResult, resultsKey } from '../src/challengeResults.ts'
import { createConfig } from '../src/session.ts'
class MemoryStorage {
  data=new Map();get length(){return this.data.size}key(i){return [...this.data.keys()][i]??null}
  getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,v)}removeItem(k){this.data.delete(k)}
}
test('challenge creation, editing, duplicate IDs, reorder, hide/show and deletion retain independent definitions',()=>{
  const p=createProfile('colegio'), a=newChallenge();p.challenges.push(a)
  a.title='La prueba del dragón';a.description='Cruzar juntos';a.publicInstruction='Cruzad el río.';a.keyRule='Sin tocar el suelo.';a.imageFilename='dragon.webp'
  const b=duplicateChallenge(p.challenges,a.id);assert.notEqual(a.id,b.id);b.title='Otra prueba';b.publicInstruction='Otra misión';b.keyRule='Otra regla';assert.notEqual(a.title,b.title);assert.equal(a.publicInstruction,'Cruzad el río.');assert.equal(a.keyRule,'Sin tocar el suelo.')
  moveChallenge(p.challenges,b.id,-1);assert.equal(p.challenges[0].id,b.id)
  moveChallenge(p.challenges,b.id,-1);assert.equal(p.challenges[0].id,b.id)
  b.visible=false;assert.equal(scenesFor(p).length,5);b.visible=true;assert.equal(scenesFor(p).length,6)
  p.challenges.splice(0,1);assert.deepEqual(cloneProfile(p).challenges,[a])
})
test('v2 normalization and v1 conversion preserve every prior field without rewriting originals',()=>{
  const c=createProfile('urbanizacion');c.participants=[{id:'p',name:'Prueba ficticia',age:8}];c.teams[0].memberIds=['p'];c.teams[0].captainId='p';c.teams[0].name='Dragones';c.teams[0].color='#123456';c.teams[1].suggestedNames=[]
  const old={...c,schemaVersion:2};delete old.challenges;delete old.finale
  const raw=JSON.stringify(old), migrated=parseProfile(old)
  assert.equal(migrated.schemaVersion,5);assert.deepEqual(migrated.challenges,[])
  const {challenges,schemaVersion,finale,...remaining}=migrated
  assert.deepEqual(remaining,((({schemaVersion,...v})=>v)(old)));assert.equal(JSON.stringify(old),raw)
  const legacy=createConfig(), converted=migrateLegacy(legacy,'colegio');assert.deepEqual(converted.challenges,[]);assert.deepEqual(converted.participants,legacy.participants)
  const s=new MemoryStorage();s.setItem(profileKey(c.id),raw);initializeProfiles(s);readProfile(s,c.id);assert.equal(s.getItem(profileKey(c.id)),raw)
})
test('zero, one, ten and numerous challenges generate stable scenes and visible numbering',()=>{
  for(const count of [0,1,10,73]) {
    const c=createProfile('colegio');c.challenges=Array.from({length:count},()=>newChallenge())
    const list=scenesFor(c);assert.equal(list.length,4+count);assert.equal(new Set(list.map(s=>s.id)).size,list.length);assert.equal(list.at(-1).id,'finale')
    for(let i=0;i<count;i++) {const s=list[i+3];assert.equal(s.challengeNumber,i+1);assert.equal(sceneByNumber(i+4,c).id,s.id);assert.equal(sceneById(s.id,c).challengeId,c.challenges[i].id);assert.equal(adjacentScene(list[i+2].id,1,c).id,s.id);assert.equal(adjacentScene(s.id,-1,c).id,list[i+2].id)}
    if(count>1){const first=list[3].id;c.challenges[0].visible=false;assert.equal(sceneById(first,c),undefined);assert.equal(sceneByNumber(4,c).challengeNumber,1);assert.equal(sceneByNumber(4,c).challengeId,c.challenges[1].id)}
  }
})

test('v3 reads normalize public fields without rewriting old descriptions, results or ceremony',()=>{
  const s=new MemoryStorage();initializeProfiles(s)
  const current=readProfile(s,'colegio'), challenge=newChallenge()
  challenge.title='Prueba heredada';challenge.description='Explicación completa\n'+ 'Á'.repeat(3950);challenge.imageFilename='prueba1.png'
  current.challenges=[challenge];applyProfileConfig(s,current,s.getItem(profileKey(current.id)),null)
  saveResult(s,current,challenge.id,current.teams[1].id,null)
  const old={...current,schemaVersion:3,challenges:current.challenges.map(({publicInstruction,keyRule,...c})=>c)}
  delete old.finale
  const raw=JSON.stringify(old);s.setItem(profileKey('colegio'),raw)
  const before=[...s.data], normalized=readProfile(s,'colegio')
  assert.equal(normalized.schemaVersion,5);assert.equal(normalized.challenges[0].description,challenge.description)
  assert.equal(normalized.challenges[0].publicInstruction,'');assert.equal(normalized.challenges[0].keyRule,'')
  assert.equal(normalized.challenges[0].id,challenge.id);assert.deepEqual([...s.data],before)
  assert.deepEqual(parseProfile(old),normalized);assert.deepEqual(parseProfile(JSON.parse(exportProfile(normalized))),normalized)
  const ceremonyBefore=s.getItem(ceremonyKey('colegio')), other=s.getItem(profileKey('urbanizacion'))
  normalized.challenges[0].publicInstruction='Instrucción elegida expresamente.'
  normalized.challenges[0].keyRule='Regla elegida.'
  applyProfileConfig(s,normalized,raw,ceremonyBefore)
  assert.equal(readProfile(s,'colegio').challenges[0].description,challenge.description)
  assert.equal(s.getItem(ceremonyKey('colegio')),ceremonyBefore);assert.equal(s.getItem(profileKey('urbanizacion')),other)
  assert.equal(readResults(s,normalized)[challenge.id],current.teams[1].id)
  assert([...s.data.values()].includes(raw),'the original v3 record is retained in existing history')
})

test('v4 text boundaries round trip; v3 cannot smuggle new public fields',()=>{
  const config=createProfile('colegio'), challenge=newChallenge();config.challenges=[challenge]
  challenge.publicInstruction='Á'.repeat(120);challenge.keyRule='Ñ'.repeat(100);challenge.description='Guion privado completo.'
  assert.deepEqual(parseProfile(JSON.parse(exportProfile(config))),config)
  const legacyV4={...config,schemaVersion:4};delete legacyV4.finale
  assert.deepEqual(parseProfile(legacyV4),config)
  const invalidV3={...config,schemaVersion:3};delete invalidV3.finale
  assert.throws(()=>parseProfile(invalidV3),/Prueba no válida/)
  const s=new MemoryStorage();initializeProfiles(s);applyProfileConfig(s,config,s.getItem(profileKey(config.id)),null)
  saveResult(s,config,challenge.id,config.teams[0].id,null)
  const copy=duplicateChallenge(config.challenges,challenge.id)
  applyProfileConfig(s,config,s.getItem(profileKey(config.id)),s.getItem(ceremonyKey(config.id)))
  assert.equal(readResults(s,config)[copy.id],undefined)
  assert.equal(copy.publicInstruction,challenge.publicInstruction);assert.equal(copy.keyRule,challenge.keyRule)
})

test('a v3 journal survives repeated recovery interruptions and rejects real later edits',()=>{
  for(const laterEdit of [false,true]) {
    const s=new MemoryStorage();initializeProfiles(s)
    const config=readProfile(s,'colegio');config.challenges=[newChallenge()]
    const before={...config,schemaVersion:3,challenges:config.challenges.map(({publicInstruction,keyRule,...c})=>c)}
    delete before.finale
    const after=structuredClone(before);after.challenges[0].title='Elección recuperada'
    const oldProgress=JSON.stringify(createCeremony('colegio')), progress=createCeremony('colegio');progress.revision=7
    const beforeRaw=JSON.stringify(before), afterRaw=JSON.stringify(after), afterProgress=JSON.stringify(progress)
    s.setItem(profileKey('colegio'),beforeRaw);s.setItem(ceremonyKey('colegio'),oldProgress)
    s.setItem('ninja-ceremony-pending:colegio',JSON.stringify({before:beforeRaw,after:afterRaw,beforeProgress:oldProgress,afterProgress}))
    const otherConfig=s.getItem(profileKey('urbanizacion')), otherProgress=s.getItem(ceremonyKey('urbanizacion'))
    const original=s.setItem.bind(s);let failures=2
    s.setItem=(key,value)=>{if(key===ceremonyKey('colegio')&&failures>0){failures--;throw Error('simulated recovery quota')}original(key,value)}
    assert.throws(()=>recoverCeremony(s,'colegio'),/quota/)
    assert.equal(JSON.parse(s.getItem(profileKey('colegio'))).schemaVersion,5)
    assert.throws(()=>recoverCeremony(s,'colegio'),/quota/)
    if(laterEdit) {
      const newer=readProfile(s,'colegio');newer.challenges[0].title='Cambio posterior real'
      s.setItem(profileKey('colegio'),exportProfile(newer));const snapshot=[...s.data]
      assert.throws(()=>recoverCeremony(s,'colegio'),/cambios posteriores/)
      assert.deepEqual([...s.data],snapshot)
    } else {
      recoverCeremony(s,'colegio')
      assert.equal(s.getItem('ninja-ceremony-pending:colegio'),null)
      assert.equal(s.getItem(ceremonyKey('colegio')),afterProgress)
      const loaded=readProfile(s,'colegio')
      assert.equal(loaded.challenges[0].title,'Elección recuperada');assert.equal(loaded.challenges[0].id,config.challenges[0].id)
      assert.equal(loaded.challenges[0].publicInstruction,'');assert.equal(loaded.challenges[0].description,config.challenges[0].description)
    }
    assert.equal(s.getItem(profileKey('urbanizacion')),otherConfig);assert.equal(s.getItem(ceremonyKey('urbanizacion')),otherProgress)
  }
})
test('strict limits reject oversized/malformed data and remote/binary images; long valid text round trips',()=>{
  const c=createProfile('colegio'),a=newChallenge();c.challenges=[a];a.title='Á'.repeat(160);a.description='Misión '.repeat(500);a.imageFilename='ausente.png'
  assert.deepEqual(parseProfile(JSON.parse(exportProfile(c))),c)
  for(const mutate of [a=>a.title='',a=>a.title='a'.repeat(161),a=>a.description='x'.repeat(4001),a=>a.publicInstruction='x'.repeat(121),a=>a.keyRule='x'.repeat(101),a=>delete a.publicInstruction,a=>a.keyRule=null,a=>a.visible=1,a=>a.imageFilename='../otro/x.png',a=>a.imageFilename='https://host/a.png',a=>a.imageFilename='data:image/png,abc',a=>a.winner='team',a=>a.id='bad:id']){const bad={...a};mutate(bad);assert.throws(()=>parseChallenges([bad]))}
  assert.throws(()=>parseChallenges([a,a]));assert.throws(()=>parseChallenges(Array.from({length:501},()=>newChallenge())))
})
test('configuration export excludes results/binary data; winners persist by profile and reject stale writes',()=>{
  const s=new MemoryStorage();initializeProfiles(s)
  const c=readProfile(s,'colegio');c.challenges=[newChallenge()];applyProfileConfig(s,c,s.getItem(profileKey(c.id)),null)
  const id=c.challenges[0].id, team=c.teams[0].id
  assert.equal(readResults(s,c)[id],undefined);saveResult(s,c,id,team,null);assert.equal(readResults(s,readProfile(s,c.id))[id],team)
  assert.deepEqual(readResults(s,readProfile(s,'urbanizacion')),{});assert(!exportProfile(c).includes('winner'))
  assert.throws(()=>saveResult(s,c,id,null,null),/Otra ventana/)
  saveResult(s,c,id,c.teams[1].id,s.getItem(resultsKey(c.id)));assert.equal(readResults(s,c)[id],c.teams[1].id)
  saveResult(s,c,id,null,s.getItem(resultsKey(c.id)));assert.equal(readResults(s,c)[id],null)
  assert.throws(()=>saveResult(s,c,'missing',team,s.getItem(resultsKey(c.id))))
})
test('challenge edits preserve ceremony decisions exactly and active hide/delete recover navigation',()=>{
  for(const remove of [false,true]){
    const s=new MemoryStorage();initializeProfiles(s);const c=readProfile(s,'colegio');c.challenges=[newChallenge(),newChallenge()]
    applyProfileConfig(s,c,s.getItem(profileKey(c.id)),null)
    const progress=createCeremony(c.id);progress.phase='ready';progress.confirmedColors=[true,true];progress.confirmedNames=[true,true];progress.revision=18
    s.setItem(ceremonyKey(c.id),JSON.stringify(progress));const ceremonyBefore=s.getItem(ceremonyKey(c.id)), other=s.getItem(profileKey('urbanizacion'))
    const id=c.challenges[0].id;saveResult(s,c,id,c.teams[0].id,null)
    s.setItem(presentationKey,JSON.stringify({profileId:c.id,sceneId:`challenge:${id}`,revision:20,token:'test'}))
    c.challenges[0].title='Editada';applyProfileConfig(s,c,s.getItem(profileKey(c.id)),ceremonyBefore)
    assert.equal(s.getItem(ceremonyKey(c.id)),ceremonyBefore)
    if(remove)c.challenges.shift();else c.challenges[0].visible=false
    applyProfileConfig(s,c,s.getItem(profileKey(c.id)),ceremonyBefore)
    assert.equal(JSON.parse(s.getItem(presentationKey)).sceneId,'intro');assert.equal(s.getItem(ceremonyKey(c.id)),ceremonyBefore);assert.equal(s.getItem(profileKey('urbanizacion')),other)
    assert.equal(readResults(s,c)[id],remove?undefined:c.teams[0].id)
  }
})
test('interrupted challenge deletion recovers with the existing journal and prunes its result',()=>{
  const s=new MemoryStorage();initializeProfiles(s);const c=readProfile(s,'colegio');c.challenges=[newChallenge()];applyProfileConfig(s,c,s.getItem(profileKey(c.id)),null)
  const id=c.challenges[0].id;saveResult(s,c,id,c.teams[0].id,null)
  const before=s.getItem(profileKey(c.id)), progress=s.getItem(ceremonyKey(c.id));c.challenges=[]
  const original=s.setItem.bind(s);let fail=true
  s.setItem=(key,value)=>{if(key===resultsKey(c.id)&&fail){fail=false;throw Error('simulated quota failure')}original(key,value)}
  assert.throws(()=>applyProfileConfig(s,c,before,progress),/quota/)
  assert(s.getItem('ninja-ceremony-pending:colegio'));recoverCeremony(s,c.id)
  assert.equal(readProfile(s,c.id).challenges.length,0);assert.deepEqual(readResults(s,c),{});assert.equal(s.getItem('ninja-ceremony-pending:colegio'),null)
})
test('reset removes only active challenge definitions and results',()=>{
  const s=new MemoryStorage();initializeProfiles(s)
  for(const id of ['colegio','urbanizacion']){const c=readProfile(s,id);c.challenges=[newChallenge()];applyProfileConfig(s,c,s.getItem(profileKey(id)),null);saveResult(s,c,c.challenges[0].id,c.teams[0].id,null)}
  const other=s.getItem(resultsKey('urbanizacion')), otherConfig=s.getItem(profileKey('urbanizacion'))
  const control={profileId:'colegio',sceneId:'intro',revision:1,token:'test'};s.setItem(presentationKey,JSON.stringify(control))
  applyProfileReset(s,{profileId:'colegio',expectedConfig:s.getItem(profileKey('colegio')),expectedProgress:s.getItem(ceremonyKey('colegio')),expectedControl:s.getItem(presentationKey)},{...control,revision:2,token:'reset'})
  assert.deepEqual(readProfile(s,'colegio').challenges,[]);assert.deepEqual(readResults(s,readProfile(s,'colegio')),{})
  assert.equal(s.getItem(resultsKey('urbanizacion')),other);assert.equal(s.getItem(profileKey('urbanizacion')),otherConfig)
})

test('mixed setup edits still retire an active challenge and reset setup confirmations safely',()=>{
  const s=new MemoryStorage();initializeProfiles(s);const c=readProfile(s,'colegio');c.challenges=[newChallenge()]
  applyProfileConfig(s,c,s.getItem(profileKey(c.id)),null)
  const p=readCeremony(s,c.id);p.phase='color-1';p.confirmedColors[0]=true;s.setItem(ceremonyKey(c.id),JSON.stringify(p))
  s.setItem(presentationKey,JSON.stringify({profileId:c.id,sceneId:`challenge:${c.challenges[0].id}`,revision:1,token:'test'}))
  c.challenges=[];c.teams[0].name='Preparación modificada'
  applyProfileConfig(s,c,s.getItem(profileKey(c.id)),s.getItem(ceremonyKey(c.id)))
  assert.equal(JSON.parse(s.getItem(presentationKey)).sceneId,'intro');assert.equal(readCeremony(s,c.id).phase,'arrival')
})

test('reset refuses results changed after its review without removing definitions',()=>{
  const s=new MemoryStorage();initializeProfiles(s);const c=readProfile(s,'colegio');c.challenges=[newChallenge()];applyProfileConfig(s,c,s.getItem(profileKey(c.id)),null)
  const control={profileId:c.id,sceneId:'intro',revision:1,token:'test'};s.setItem(presentationKey,JSON.stringify(control))
  const request={profileId:c.id,expectedConfig:s.getItem(profileKey(c.id)),expectedProgress:s.getItem(ceremonyKey(c.id)),expectedControl:s.getItem(presentationKey),expectedResults:null}
  saveResult(s,c,c.challenges[0].id,c.teams[0].id,null)
  assert.throws(()=>applyProfileReset(s,request,{...control,revision:2}),/resultados cambiaron/)
  assert.equal(readProfile(s,c.id).challenges.length,1);assert.equal(readResults(s,c)[c.challenges[0].id],c.teams[0].id)
})
