import { test } from 'node:test'
import assert from 'node:assert/strict'
import { browserScreenTransport, createPublicScreen } from '../src/publicScreen.ts'
function bus() {
  const listeners=new Set(),messages=[]
  return {messages,port:()=>({send(message){messages.push(message);listeners.forEach(l=>l(message))},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}})}
}
const timing={heartbeatMs:10,timeoutMs:80,staleMs:25}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
test('opening is synchronous and a window reference is not readiness; rendering must acknowledge',async()=>{
  const b=bus(),events=[]
  const publicView=createPublicScreen({role:'public',transport:b.port(),open:()=>{},...timing})
  const admin=createPublicScreen({role:'admin',transport:b.port(),open:()=>{events.push('open');return{}},...timing})
  try {
    const requested=admin.ensure().then(ok=>{if(ok)events.push('show')})
    assert.deepEqual(events,['open']);assert(!admin.available.value)
    await sleep(15);assert.deepEqual(events,['open'])
    publicView.markReady();await requested
    assert.deepEqual(events,['open','show']);assert(admin.available.value)
  } finally {admin.dispose();publicView.dispose()}
})
test('blocked/unresponsive public window does not execute a scene and exposes recovery',async()=>{
  const b=bus();let opened=0,shown=0
  const admin=createPublicScreen({role:'admin',transport:b.port(),open:()=>{opened++;return null},...timing})
  try {
    assert.equal(await admin.ensure(),false);assert.equal(shown,0);assert.match(admin.message.value,/no ha confirmado/)
    const view=createPublicScreen({role:'public',transport:b.port(),open:()=>{},...timing})
    try {view.markReady();if(await admin.ensure())shown++;assert.equal(opened,2);assert.equal(shown,1)}
    finally {view.dispose()}
  } finally {admin.dispose()}
})
test('closed/reloaded screens expire and require a fresh matching handshake, ignoring stale replies',async()=>{
  const b=bus();let opened=0
  const admin=createPublicScreen({role:'admin',transport:b.port(),open:()=>{opened++;return{}},...timing})
  let view=createPublicScreen({role:'public',transport:b.port(),open:()=>{},...timing})
  try {
    view.markReady();assert(await admin.ensure());view.dispose();await sleep(40)
    assert(!admin.available.value)
    const request=admin.ensure();const current=b.messages.findLast(m=>m.type==='probe')
    b.port().send({protocol:'other',type:'ready',requestId:current.requestId,screenId:'fake'})
    b.port().send({protocol:'ninja-public-v1',type:'ready',requestId:'obsolete',screenId:'fake'})
    assert(!admin.available.value)
    view=createPublicScreen({role:'public',transport:b.port(),open:()=>{},...timing});view.markReady()
    assert(await request);assert.equal(opened,2)
  } finally {admin.dispose();view.dispose()}
})
test('a tracked closed window reopens immediately even before its last heartbeat expires',async()=>{
  const b=bus(),handle={closed:false};let opens=0
  let view=createPublicScreen({role:'public',transport:b.port(),open:()=>null,...timing})
  const admin=createPublicScreen({role:'admin',transport:b.port(),open:()=>{opens++;handle.closed=false;return handle},...timing})
  try {
    view.markReady();assert(await admin.ensure());view.dispose();handle.closed=true
    const request=admin.ensure();assert.equal(opens,2)
    view=createPublicScreen({role:'public',transport:b.port(),open:()=>null,...timing});view.markReady()
    assert(await request)
  } finally {view.dispose();admin.dispose()}
})
test('real browser transport handshakes via storage when BroadcastChannel is unavailable',async()=>{
  const saved=Object.fromEntries(['window','localStorage','BroadcastChannel'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  const listeners=new Set()
  Object.defineProperty(globalThis,'window',{configurable:true,value:{addEventListener(_type,fn){listeners.add(fn)},removeEventListener(_type,fn){listeners.delete(fn)}}})
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{setItem(key,newValue){listeners.forEach(fn=>fn({key,newValue}))}}})
  Object.defineProperty(globalThis,'BroadcastChannel',{configurable:true,value:undefined})
  const a=browserScreenTransport(),b=browserScreenTransport()
  const admin=createPublicScreen({role:'admin',transport:a,open:()=>null,...timing})
  const view=createPublicScreen({role:'public',transport:b,open:()=>null,...timing})
  try {view.markReady();assert(await admin.ensure());assert(admin.available.value)}
  finally {
    admin.dispose();view.dispose();a.dispose();b.dispose();assert.equal(listeners.size,0)
    for(const [key,value] of Object.entries(saved)){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key]}
  }
})
