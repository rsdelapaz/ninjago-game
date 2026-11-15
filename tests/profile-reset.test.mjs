import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, initialSuggestedNames } from '../src/profile.ts'
import { initializeProfiles, profileKey, presentationKey, readProfile, saveProfile } from '../src/profileStorage.ts'
import { applyProfileReset, ceremonyKey, readCeremony, recoverCeremony } from '../src/ceremonyStorage.ts'
import { createCeremony } from '../src/ceremony.ts'
class MemoryStorage {
  data=new Map();failKey=null
  get length(){return this.data.size} key(i){return [...this.data.keys()][i]??null}
  getItem(k){return this.data.get(k)??null}
  setItem(k,v){if(k===this.failKey)throw Error('Quota simulated');this.data.set(k,v)}
  removeItem(k){this.data.delete(k)}
}
function fixture() {
  const s=new MemoryStorage();initializeProfiles(s)
  const c=createProfile('colegio');c.participants=[{id:'a',name:'Prueba A'},{id:'b',name:'Prueba B'}]
  c.teams.forEach((t,i)=>{t.memberIds=[c.participants[i].id];t.captainId=t.memberIds[0];t.name='Equipo de prueba '+i;t.color=i?'#359bdb':'#e34b42';t.suggestedNames=[]})
  c.media={artwork:'otra.png',video:'otro.mp4'}
  saveProfile(s,c,s.getItem(profileKey(c.id)))
  const p=createCeremony(c.id);p.phase='ready';p.confirmedColors=[true,true];p.confirmedNames=[true,true];p.revision=8
  s.setItem(ceremonyKey(c.id),JSON.stringify(p))
  s.setItem(ceremonyKey('urbanizacion'),JSON.stringify({...createCeremony('urbanizacion'),revision:17}))
  s.setItem(presentationKey,JSON.stringify({profileId:c.id,sceneId:'ceremony',revision:10,token:'before'}))
  s.setItem('ninja-config-v1:legacy','synthetic raw legacy');s.setItem('ninja-profile-history:old','synthetic old history')
  const request={profileId:c.id,expectedConfig:s.getItem(profileKey(c.id)),expectedProgress:s.getItem(ceremonyKey(c.id)),expectedControl:s.getItem(presentationKey)}
  return {s,c,request,beforeControl:s.getItem(presentationKey),next:{profileId:c.id,sceneId:'intro',revision:11,token:'reset'}}
}
test('reset restores the active profile, suggestions, media and progress while preserving other profile and recovery data',()=>{
  const {s,c,request,beforeControl,next}=fixture()
  const other=s.getItem(profileKey('urbanizacion')),otherProgress=s.getItem(ceremonyKey('urbanizacion'))
  applyProfileReset(s,request,next)
  const reset=readProfile(s,c.id)
  assert.deepEqual(reset.participants,[]);assert.deepEqual(reset.teams.map(t=>t.id),c.teams.map(t=>t.id))
  assert(reset.teams.every(t=>!t.memberIds.length&&t.captainId===null&&t.name===null&&t.color===null))
  assert.deepEqual(reset.teams.map(t=>t.suggestedNames),initialSuggestedNames)
  assert.deepEqual(reset.media,{artwork:'ninjago-key-art.png',video:'master-wu.mp4'})
  const progress=readCeremony(s,c.id);assert.equal(progress.phase,'arrival');assert.equal(progress.revision,9)
  assert.deepEqual(progress.proposalIndexes,[0,0]);assert.deepEqual(progress.confirmedNames,[false,false]);assert.deepEqual(progress.confirmedColors,[false,false])
  assert.deepEqual(JSON.parse(s.getItem(presentationKey)),next)
  assert.equal(s.getItem(profileKey('urbanizacion')),other);assert.equal(s.getItem(ceremonyKey('urbanizacion')),otherProgress)
  assert.equal(s.getItem('ninja-config-v1:legacy'),'synthetic raw legacy');assert.equal(s.getItem('ninja-profile-history:old'),'synthetic old history')
  assert([...s.data].some(([k,v])=>k.startsWith('ninja-profile-history:colegio:')&&v===request.expectedConfig))
  const reload=new MemoryStorage();reload.data=new Map(s.data);initializeProfiles(reload)
  assert.deepEqual(readProfile(reload,c.id),reset);assert.equal(readCeremony(reload,c.id).phase,'arrival')
})
test('reset rejects stale configuration, ceremony or active navigation before changing any data',()=>{
  for(const changedKey of [profileKey('colegio'),ceremonyKey('colegio'),presentationKey]) {
    const {s,request,beforeControl,next}=fixture()
    s.setItem(changedKey,JSON.stringify({changed:'synthetic newer data'}));const before=[...s.data]
    assert.throws(()=>applyProfileReset(s,request,next))
    assert.deepEqual([...s.data],before)
  }
})
test('an interrupted reset uses the existing journal to recover navigation, and refuses a later profile switch',()=>{
  for(const switchProfile of [false,true]) {
    const {s,request,beforeControl,next}=fixture();s.failKey=presentationKey
    assert.throws(()=>applyProfileReset(s,request,next),/Quota/)
    assert(s.getItem('ninja-ceremony-pending:colegio'))
    s.failKey=null
    if(switchProfile) {
      s.setItem(presentationKey,JSON.stringify({profileId:'urbanizacion',sceneId:'intro',revision:12,token:'newer'}))
      const before=[...s.data];assert.throws(()=>recoverCeremony(s,'colegio'),/presentación cambió/);assert.deepEqual([...s.data],before)
    } else {
      recoverCeremony(s,'colegio');assert.deepEqual(JSON.parse(s.getItem(presentationKey)),next)
      assert.equal(s.getItem('ninja-ceremony-pending:colegio'),null);assert.equal(readProfile(s,'colegio').participants.length,0)
    }
  }
})
