import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { usePresentation } from '../src/usePresentation.ts'
import { createProfile } from '../src/profile.ts'
import { readProfile, saveProfile, profileKey } from '../src/profileStorage.ts'
import { colorOptions } from '../src/ceremony.ts'
import { useProfileDraft } from '../src/useProfileDraft.ts'

async function environment(work) {
  const saved = Object.fromEntries(['window','localStorage','navigator','BroadcastChannel'].map(k => [k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  const data=new Map()
  const storage={get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}
  let queue=Promise.resolve()
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage})
  Object.defineProperty(globalThis,'window',{configurable:true,value:{addEventListener(){},removeEventListener(){}}})
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request(_name,fn){const result=queue.then(fn);queue=result.catch(()=>{});return result}}}})
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:class {postMessage(){} close(){}}})
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
    await reloaded.selectProfile('urbanizacion');assert.equal(reloaded.ceremony.value.phase,'arrival')
    await reloaded.selectProfile('colegio');await reloaded.select('ceremony');assert.equal(reloaded.ceremony.value.phase,'complete')
    const c=readProfile(storage,'colegio');c.teams[0].captainId=null
    saveProfile(storage,c,storage.getItem(profileKey(c.id)));reloaded.refreshProfile()
    assert.equal(reloaded.state.value.sceneId,'intro');assert.equal(reloaded.ceremony.value.phase,'arrival')
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
