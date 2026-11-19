import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSSRApp, createRenderer, h, ref, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { usePresentation } from '../src/usePresentation.ts'
import { createProfile } from '../src/profile.ts'
import { readProfile, saveProfile, profileKey } from '../src/profileStorage.ts'
import { colorOptions } from '../src/ceremony.ts'
import { useProfileDraft } from '../src/useProfileDraft.ts'
import { ceremonyKey, readCeremony } from '../src/ceremonyStorage.ts'
import { applyProfileConfig } from '../src/ceremonyStorage.ts'
import { newChallenge } from '../src/challenges.ts'
import { createHoopChallenge } from '../src/hoopChallenge.ts'
import { resultsKey } from '../src/challengeResults.ts'
import { adjacentScene, sceneByNumber } from '../src/scenes.ts'

async function environment(work) {
  const saved = Object.fromEntries(['window','localStorage','navigator','BroadcastChannel'].map(k => [k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  const data=new Map()
  const storage={get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}
  let queue=Promise.resolve()
  const channels=new Set()
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage})
  Object.defineProperty(globalThis,'window',{configurable:true,value:{addEventListener(){},removeEventListener(){}}})
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request(_name,fn){const result=queue.then(fn);queue=result.catch(()=>{});return result}}}})
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class {constructor(){channels.add(this)}postMessage(data){channels.forEach(c=>{if(c!==this)c.onmessage?.({data})})}close(){channels.delete(this)}}})
  async function controller() {
    let api
    await renderToString(createSSRApp({setup(){api=usePresentation();return ()=>h('div')}}))
    await api.initialized;return api
  }
  try { await work(storage,controller) }
  finally { for(const [key,descriptor] of Object.entries(saved)) {if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]} }
}
function setup(storage,id) {
  const c=createProfile(id)
  c.participants=[{id:`${id}-a`,name:'Prueba A'},{id:`${id}-b`,name:'Prueba B'}]
  c.teams.forEach((t,i)=>{t.memberIds=[c.participants[i].id];t.captainId=t.memberIds[0];t.suggestedNames=[i?'Tormentas':'Dragones']})
  saveProfile(storage,c,storage.getItem(profileKey(id)))
}
// A mounted Vue scope is required for watchers; SSR intentionally disables non-immediate watching.
function mountDraft(source) {
  let draft
  const renderer=createRenderer({
    createElement:()=>({children:[]}),createText:text=>({text}),createComment:text=>({text}),
    insert(child,parent){parent.children.push(child)},remove(){},patchProp(){},setText(){},setElementText(){},
    parentNode:()=>null,nextSibling:()=>null,
  })
  const app=renderer.createApp({setup(){draft=useProfileDraft(()=>source.value,()=>{});return()=>h('div')}})
  app.mount({children:[]});return {draft,unmount:()=>app.unmount()}
}
test('actual presentation controller completes START -> ceremony -> Wu, reloads and isolates profiles',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();await admin.selectProfile('colegio')
    await admin.select('ceremony');assert.equal(admin.state.value.sceneId,'intro');assert.match(admin.warning.value,/integrantes/)
    setup(storage,'colegio');setup(storage,'urbanizacion');admin.refreshProfile()
    await admin.select('wu');assert.equal(admin.state.value.sceneId,'intro')
    await admin.select('ceremony');assert.equal(admin.ceremony.value.phase,'arrival')
    for(let i=0;i<2;i++) {
      await admin.actCeremony({type:'next'})
      assert.equal(admin.ceremony.value.phase,`color-${i+1}`)
      await admin.actCeremony({type:'color',color:colorOptions(admin.profile.value,admin.ceremony.value)[0].hex})
      await admin.actCeremony({type:'next'});await admin.actCeremony({type:'accept-name'})
    }
    await admin.actCeremony({type:'next'});assert.equal(admin.ceremony.value.phase,'ready')
    const reloaded=await mount();assert.equal(reloaded.ceremony.value.phase,'ready')
    await reloaded.actCeremony({type:'next'});assert.equal(reloaded.state.value.sceneId,'wu')
    assert.equal(await reloaded.advanceTrials('wu'),false)
    const school=readProfile(storage,'colegio')
    const hidden=newChallenge(), first=newChallenge()
    hidden.visible=false
    school.challenges=[hidden,first]
    saveProfile(storage,school,storage.getItem(profileKey('colegio')))
    reloaded.refreshProfile()
    const publicView=await mount()
    assert.equal(await publicView.advanceTrials('wu'),true)
    assert.equal(reloaded.state.value.sceneId,'trials-opening')
    const restored=await mount()
    assert.equal(restored.state.value.sceneId,'trials-opening')
    assert.equal(await restored.advanceTrials('trials-opening'),true)
    assert.equal(publicView.state.value.sceneId,`challenge:${first.id}`)
    assert.equal(await publicView.advanceTrials('trials-opening'),false)
    await reloaded.selectProfile('urbanizacion');assert.equal(reloaded.ceremony.value.phase,'arrival')
    await reloaded.selectProfile('colegio');await reloaded.select('ceremony');assert.equal(reloaded.ceremony.value.phase,'complete')
    const c=readProfile(storage,'colegio');c.teams[0].captainId=null
    saveProfile(storage,c,storage.getItem(profileKey(c.id)));reloaded.refreshProfile()
    assert.equal(reloaded.state.value.sceneId,'intro');assert.equal(reloaded.ceremony.value.phase,'arrival')
  })
})
test('ceremony rejects a preparation change queued ahead of the START write', async () => {
  await environment(async (storage, mount) => {
    const publicView = await mount()
    await publicView.selectProfile('colegio')
    setup(storage, 'colegio')
    publicView.refreshProfile()
    assert(publicView.profile.value.teams.every(team => team.captainId))
    const control = storage.getItem('ninja-control-v3')
    const progress = storage.getItem(ceremonyKey('colegio'))
    const organizer = navigator.locks.request('ninja-local-write', () => {
      const config = readProfile(storage, 'colegio')
      config.teams[0].captainId = null
      saveProfile(storage, config, storage.getItem(profileKey(config.id)))
    })
    const start = publicView.select('ceremony')
    await organizer
    assert.equal(await start, false)
    assert.match(publicView.warning.value, /capitán/)
    assert.equal(publicView.state.value.sceneId, 'intro')
    assert.equal(storage.getItem('ninja-control-v3'), control)
    assert.equal(storage.getItem(ceremonyKey('colegio')), progress)
  })
})
test('two actual operator controllers reject stale profile switches and simultaneous ceremony commands',async()=>{
  await environment(async(storage,mount)=>{
    const a=await mount();setup(storage,'colegio');await a.selectProfile('colegio');await a.select('ceremony')
    const b=await mount()
    await Promise.all([a.actCeremony({type:'next'}),b.actCeremony({type:'next'})])
    assert.equal(a.ceremony.value.phase,'color-1');assert.equal(b.ceremony.value.phase,'color-1')
    assert.match(b.warning.value,/Otra ventana/)
    await a.selectProfile('urbanizacion')
    await b.actCeremony({type:'color',color:'#e34b42'})
    assert.equal(b.profile.value.id,'urbanizacion');assert.match(b.warning.value,/Otra ventana/)
    assert.equal(readProfile(storage,'colegio').teams[0].color,null)
    assert.equal(readProfile(storage,'urbanizacion').teams[0].color,null)
  })
})
test('a dirty dashboard cannot erase a ceremony that advanced in another window',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();setup(storage,'colegio');await admin.selectProfile('colegio');await admin.select('ceremony')
    const source=ref(readProfile(storage,'colegio'));let draft
    await renderToString(createSSRApp({setup(){draft=useProfileDraft(()=>source.value,()=>{});return()=>h('div')}}))
    draft.current.value.config.participants[0].name='Borrador de prueba'
    await admin.actCeremony({type:'next'})
    assert.equal(await draft.save(),false);assert.match(draft.error.value,/avanzado/)
    assert.equal(draft.current.value.config.participants[0].name,'Borrador de prueba')
    assert.equal(readProfile(storage,'colegio').participants[0].name,'Prueba A')
    assert.equal(admin.ceremony.value.phase,'color-1')
  })
})
test('reset updates the public controller to opening, clears its active draft and persists after reload',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();setup(storage,'colegio');setup(storage,'urbanizacion')
    await admin.selectProfile('colegio');await admin.select('ceremony');await admin.actCeremony({type:'next'})
    const publicView=await mount(),other=storage.getItem(profileKey('urbanizacion'))
    const source=ref(readProfile(storage,'colegio'));let draft
    await renderToString(createSSRApp({setup(){draft=useProfileDraft(()=>source.value,()=>{});return()=>h('div')}}))
    draft.current.value.config.participants[0].name='Borrador de prueba'
    assert(await draft.reset(admin.resetProfile));assert.equal(draft.dirty.value,false)
    assert.equal(draft.current.value.config.participants.length,0)
    assert.equal(publicView.state.value.sceneId,'intro');assert.equal(publicView.profile.value.id,'colegio')
    assert.equal(publicView.ceremony.value.phase,'arrival')
    assert.equal(storage.getItem(profileKey('urbanizacion')),other)
    const reloaded=await mount();assert.equal(reloaded.state.value.sceneId,'intro');assert.equal(reloaded.profile.value.participants.length,0)
    assert.equal(readCeremony(storage,'colegio').phase,'arrival')
  })
})
test('reset rejects an inactive profile and preserves another profile draft in the same dashboard',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();setup(storage,'colegio');setup(storage,'urbanizacion');await admin.selectProfile('colegio')
    const oldRequest={profileId:'colegio',expectedConfig:storage.getItem(profileKey('colegio')),expectedProgress:storage.getItem(ceremonyKey('colegio')),expectedControl:storage.getItem('ninja-control-v3')}
    await admin.selectProfile('urbanizacion')
    const before=storage.getItem(profileKey('colegio'));assert.equal(await admin.resetProfile(oldRequest),false);assert.equal(storage.getItem(profileKey('colegio')),before)
    const source=ref(readProfile(storage,'urbanizacion')),mounted=mountDraft(source),draft=mounted.draft
    try {
      draft.current.value.config.participants[0].name='Borrador del otro perfil'
      source.value=readProfile(storage,'colegio');await nextTick();await admin.selectProfile('colegio')
      assert(await draft.reset(admin.resetProfile))
      source.value=readProfile(storage,'urbanizacion');await nextTick()
      assert.equal(draft.current.value.config.participants[0].name,'Borrador del otro perfil');assert(draft.dirty.value)
    } finally { mounted.unmount() }
  })
})
test('a reset confirmation uses the reviewed snapshot even after the live dashboard receives newer navigation',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();setup(storage,'colegio');await admin.selectProfile('colegio')
    const reviewed={profileId:'colegio',expectedConfig:storage.getItem(profileKey('colegio')),expectedProgress:storage.getItem(ceremonyKey('colegio')),expectedControl:storage.getItem('ninja-control-v3')}
    const second=await mount();await second.select('ceremony')
    assert.equal(admin.state.value.sceneId,'ceremony')
    const before=storage.getItem(profileKey('colegio'))
    assert.equal(await admin.resetProfile(reviewed),false)
    assert.equal(storage.getItem(profileKey('colegio')),before);assert.equal(admin.state.value.sceneId,'ceremony')
  })
})
test('reveal controls synchronize and reload without modifying profiles, decisions, or another profile',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();setup(storage,'colegio');await admin.selectProfile('colegio');await admin.select('ceremony')
    const publicView=await mount(),before=storage.getItem(profileKey('colegio')),progress=storage.getItem(ceremonyKey('colegio')),other=storage.getItem(profileKey('urbanizacion'))
    await admin.actReveal('skip');assert.equal(publicView.reveal.value.animate,false)
    await admin.actReveal('replay');assert.equal(publicView.reveal.value.animate,true)
    const reload=await mount();assert.deepEqual(reload.reveal.value,admin.reveal.value)
    assert.equal(storage.getItem(profileKey('colegio')),before);assert.equal(storage.getItem(ceremonyKey('colegio')),progress);assert.equal(storage.getItem(profileKey('urbanizacion')),other)
    await admin.actCeremony({type:'next'});await admin.actReveal('skip')
    assert.equal(admin.ceremony.value.phase,'color-1')
  })
})

test('dynamic challenge navigation and explicit winner announcements synchronize, reload and isolate results',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();await admin.selectProfile('colegio');setup(storage,'colegio');setup(storage,'urbanizacion')
    const c=readProfile(storage,'colegio');c.challenges=Array.from({length:3},()=>newChallenge())
    applyProfileConfig(storage,c,storage.getItem(profileKey(c.id)),storage.getItem(ceremonyKey(c.id)));admin.refreshProfile()
    const audience=await mount(), first=sceneByNumber(5,c), second=adjacentScene(first.id,1,c)
    await admin.select(first.id);assert.equal(audience.activeScene.value.challengeId,c.challenges[0].id)
    const progress=storage.getItem(ceremonyKey(c.id)), urban=storage.getItem(profileKey('urbanizacion'))
    assert.equal(admin.results.value[c.challenges[0].id],undefined)
    assert.equal(await admin.recordResult(c.challenges[0].id,c.teams[0].id),true)
    assert.equal(audience.results.value[c.challenges[0].id],c.teams[0].id)
    assert.equal(audience.state.value.announcement,undefined);assert.equal(audience.state.value.sceneId,first.id)
    await admin.announceResult(c.challenges[0].id,c.teams[0].id)
    assert.equal(audience.state.value.announcement.winner,c.teams[0].id)
    const reloaded=await mount();assert.equal(reloaded.state.value.announcement.winner,c.teams[0].id)
    const stale=admin.resultsVersion.value
    await admin.recordResult(c.challenges[0].id,c.teams[1].id)
    assert.equal(await admin.recordResult(c.challenges[0].id,null,stale),false)
    await admin.select(second.id);assert.equal(audience.state.value.announcement,undefined)
    await admin.select(adjacentScene(second.id,-1,c).id);assert.equal(audience.state.value.sceneId,first.id)
    c.challenges[0].visible=false
    applyProfileConfig(storage,c,storage.getItem(profileKey(c.id)),storage.getItem(ceremonyKey(c.id)))
    admin.refreshProfile();audience.refreshProfile();assert.equal(audience.state.value.sceneId,'intro')
    const loaded=await mount();assert.equal(loaded.state.value.sceneId,'intro')
    assert.equal(storage.getItem(ceremonyKey(c.id)),progress);assert.equal(storage.getItem(profileKey('urbanizacion')),urban)
    await admin.selectProfile('urbanizacion');assert.deepEqual(admin.results.value,{})
    assert.equal(await admin.recordResult(c.challenges[0].id,c.teams[0].id,null,'colegio'),false)
    await admin.selectProfile('colegio');assert.equal(admin.results.value[c.challenges[0].id],c.teams[1].id)
  })
})

test('real draft challenge edits save without restarting ceremony and reject deletion after newer results',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();await admin.selectProfile('colegio');setup(storage,'colegio');admin.refreshProfile()
    await admin.select('ceremony');await admin.actCeremony({type:'next'})
    await admin.actCeremony({type:'color',color:colorOptions(admin.profile.value,admin.ceremony.value)[0].hex})
    const progress=storage.getItem(ceremonyKey('colegio'))
    const source=ref(admin.profile.value), {draft,unmount}=mountDraft(source)
    draft.current.value.config.challenges.push(newChallenge());assert.equal(await draft.save(),true)
    admin.refreshProfile();assert.equal(storage.getItem(ceremonyKey('colegio')),progress)
    const id=draft.current.value.config.challenges[0].id
    await admin.recordResult(id,admin.profile.value.teams[0].id)
    draft.current.value.config.challenges=[]
    assert.equal(await draft.save(),false);assert.match(draft.error.value,/resultados cambiaron/)
    assert.equal(readProfile(storage,'colegio').challenges.length,1)
    unmount()
  })
})

test('expanded image is synchronized within the current scene, reloads and never changes config or results',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();await admin.selectProfile('colegio');setup(storage,'colegio')
    const c=readProfile(storage,'colegio');c.challenges=[newChallenge(),newChallenge()];c.challenges[0].imageFilename='acertijo-vertical.png'
    applyProfileConfig(storage,c,storage.getItem(profileKey(c.id)),storage.getItem(ceremonyKey(c.id)));admin.refreshProfile()
    const id=c.challenges[0].id,scene=`challenge:${id}`,publicView=await mount()
    await admin.select(scene)
    const config=storage.getItem(profileKey(c.id)), progress=storage.getItem(ceremonyKey(c.id)), other=storage.getItem(profileKey('urbanizacion'))
    assert.equal(admin.imageExpanded.value,false)
    assert.equal(await admin.setImageExpanded(id,true),true);assert.equal(publicView.imageExpanded.value,true)
    assert.equal(publicView.state.value.sceneId,scene);assert.equal(publicView.state.value.announcement,undefined)
    const reload=await mount();assert.equal(reload.imageExpanded.value,true)
    const competing=await mount()
    const writes=await Promise.all([admin.setImageExpanded(id,false),competing.setImageExpanded(id,true)])
    assert.deepEqual(writes,[true,false]);assert.match(competing.warning.value,/Otra ventana/)
    assert.equal(publicView.imageExpanded.value,false)
    await admin.setImageExpanded(id,true)
    await admin.recordResult(id,c.teams[0].id);assert.equal(publicView.imageExpanded.value,true);assert.equal(publicView.state.value.announcement,undefined)
    await admin.announceResult(id,c.teams[0].id);assert.equal(publicView.imageExpanded.value,false)
    assert.equal(await admin.setImageExpanded(id,true),false)
    await admin.select(scene);assert.equal(publicView.imageExpanded.value,false)
    await admin.setImageExpanded(id,true);await admin.select(`challenge:${c.challenges[1].id}`);assert.equal(publicView.imageExpanded.value,false)
    assert.equal(await admin.setImageExpanded(id,true),false)
    assert.equal(await admin.setImageExpanded(c.challenges[1].id,true),false);assert.match(admin.warning.value,/imagen/)
    await admin.selectProfile('urbanizacion');assert.equal(admin.imageExpanded.value,false)
    assert.equal(storage.getItem(profileKey(c.id)),config);assert.equal(storage.getItem(ceremonyKey(c.id)),progress);assert.equal(storage.getItem(profileKey('urbanizacion')),other)
    await admin.selectProfile('colegio');assert.equal(admin.results.value[id],c.teams[0].id)
  })
})

test('hoop flow creates an editable draft, saves, presents, synchronizes, reloads and explicitly announces its winner',async()=>{
  await environment(async(storage,mount)=>{
    const admin=await mount();await admin.selectProfile('colegio')
    setup(storage,'colegio');admin.refreshProfile()
    const other=storage.getItem(profileKey('urbanizacion')), source=ref(admin.profile.value)
    const {draft,unmount}=mountDraft(source)
    try {
      const hoop=createHoopChallenge();draft.current.value.config.challenges.push(hoop)
      assert.equal(readProfile(storage,'colegio').challenges.length,0)
      assert.equal(draft.dirty.value,true);assert.equal(await draft.save(),true)
      admin.refreshProfile()
      const saved=storage.getItem(profileKey('colegio')), progress=storage.getItem(ceremonyKey('colegio'))
      const audience=await mount()
      assert.equal(audience.state.value.sceneId,'intro')
      const target=sceneByNumber(5,admin.profile.value)
      assert.equal(target.challengeId,hoop.id);assert.equal(target.challengeNumber,1)
      assert.equal(await admin.select(target.id),true)
      assert.equal(audience.state.value.sceneId,target.id)
      assert.equal(audience.profile.value.challenges[0].title,hoop.title)
      assert.equal(audience.profile.value.challenges[0].imageFilename,'aro-del-dragon-unido.png')
      assert.equal(audience.state.value.announcement,undefined)
      assert.equal(await admin.setImageExpanded(hoop.id,true),true);assert.equal(audience.imageExpanded.value,true)
      const reloaded=await mount();assert.equal(reloaded.imageExpanded.value,true)
      assert.equal(await admin.setImageExpanded(hoop.id,false),true);assert.equal(audience.imageExpanded.value,false)
      assert.equal(storage.getItem(resultsKey('colegio')),null)
      const winner=admin.profile.value.teams[0].id
      assert.equal(await admin.recordResult(hoop.id,winner),true)
      assert.equal(audience.results.value[hoop.id],winner);assert.equal(audience.state.value.announcement,undefined)
      assert.equal(await admin.announceResult(hoop.id,winner),true)
      assert.equal(audience.state.value.announcement.winner,winner)
      assert.equal(await admin.select(target.id),true);assert.equal(audience.state.value.announcement,undefined)
      assert.equal(storage.getItem(profileKey('colegio')),saved)
      assert.equal(storage.getItem(ceremonyKey('colegio')),progress)
      assert.equal(storage.getItem(profileKey('urbanizacion')),other)
    } finally {unmount()}
  })
})
