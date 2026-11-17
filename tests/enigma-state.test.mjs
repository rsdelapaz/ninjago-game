import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, h } from 'vue'
import { useEnigma } from '../src/useEnigma.ts'

async function environment(work, reduced=false) {
  const keys=['window','localStorage','BroadcastChannel','setTimeout','clearTimeout','AudioContext']
  const saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  const timers=new Map(), listeners=new Map(), motionListeners=new Set()
  let time=0,id=0,audioAccess=0, api
  const media={matches:reduced,addEventListener(_name,fn){motionListeners.add(fn)},removeEventListener(_name,fn){motionListeners.delete(fn)}}
  const win={location:{hash:'#palabra=%C3%81RBOL'},matchMedia(){return media},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name){listeners.delete(name)}}
  const define=(key,descriptor)=>Object.defineProperty(globalThis,key,{configurable:true,...descriptor})
  define('window',{value:win});define('setTimeout',{value:(fn,ms)=>{const key=++id;timers.set(key,{fn,at:time+ms});return key}})
  define('clearTimeout',{value:key=>timers.delete(key)})
  define('localStorage',{get(){throw Error('Forbidden storage access')}})
  Object.defineProperty(win,'localStorage',{get(){throw Error('Forbidden window storage access')}})
  define('BroadcastChannel',{value:class {constructor(){throw Error('Forbidden game transport')}}})
  define('AudioContext',{get(){audioAccess++;throw Error('No audio device')}})
  const node=()=>({children:[]})
  const renderer=createRenderer({createElement:node,createText:node,createComment:node,insert(child,parent){parent.children.push(child)},remove(){},patchProp(){},setText(){},setElementText(){},parentNode:()=>null,nextSibling:()=>null})
  const app=renderer.createApp({setup(){api=useEnigma();return()=>h('div')}})
  function advance(ms) {
    const end=time+ms
    while(true){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn()}
    time=end
  }
  let mounted=false
  try {
    app.mount(node());mounted=true
    await work({api,advance,timers,listeners,win,media,motionListeners,audioAccess:()=>audioAccess,unmount(){if(mounted){app.unmount();mounted=false}}})
  } finally {
    if(mounted)app.unmount()
    for(const [key,descriptor] of Object.entries(saved)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}
  }
}

test('standalone enigma fails, retries, reveals, settles and replays without game storage or channels',async()=>{
  await environment(({api,advance,timers,audioAccess})=>{
    assert.equal(api.phase.value,'ready');assert.equal(api.solution.value,'');assert.equal(audioAccess(),0)
    api.proposal.value='otra';api.submit();assert.equal(api.phase.value,'charging');assert.equal(api.solution.value,'')
    const count=timers.size;api.submit();assert.equal(timers.size,count)
    advance(700);assert.equal(api.phase.value,'collapsing');assert.equal(api.solution.value,'')
    advance(600);assert.equal(api.phase.value,'extinguishing')
    advance(650);assert.equal(api.phase.value,'falling')
    advance(950);assert.equal(api.phase.value,'failure');assert.equal(timers.size,0)
    for(let i=0;i<3;i++){api.retry();api.proposal.value='no';api.submit();advance(2900);assert.equal(api.phase.value,'failure')}
    api.retry();api.proposal.value='arbol';api.submit();advance(700)
    assert.equal(api.phase.value,'awakening');assert.equal(api.solution.value,'')
    advance(850);assert.equal(api.phase.value,'revealing');assert.equal(api.solution.value,'ÁRBOL')
    advance(1000);assert.equal(api.phase.value,'celebrating')
    advance(3200);assert.equal(api.phase.value,'success');assert.equal(timers.size,0)
    api.replay();assert.equal(api.phase.value,'charging');advance(10000)
    assert.equal(api.phase.value,'success');assert.equal(timers.size,0);assert.equal(audioAccess(),0)
  })
})

test('restart preserves the URL secret, cancels repeated victory runs and hides all revealed content',async()=>{
  await environment(({api,advance,timers,win})=>{
    const hash=win.location.hash
    for(let i=0;i<5;i++){
      api.proposal.value='arbol';api.submit();advance(10000)
      api.replay();api.replay();assert.equal(timers.size,1);assert.equal(api.solution.value,'ÁRBOL')
      advance(2600);assert.equal(api.canRestart.value,true)
      api.restart();assert.equal(api.phase.value,'ready');assert.equal(api.solution.value,'')
      assert.equal(api.proposal.value,'');assert.equal(timers.size,0);assert.equal(win.location.hash,hash)
      advance(10000);assert.equal(api.phase.value,'ready')
      api.proposal.value='otra';api.submit();advance(10000);assert.equal(api.phase.value,'failure');api.retry()
    }
    api.proposal.value='arbol';api.submit();advance(10000);api.restart()
    assert.equal(api.phase.value,'ready');assert.equal(api.solution.value,'')
  })
})

test('invalid proposals do not start effects; changing hash cancels a reveal and hides the old solution',async()=>{
  await environment(({api,advance,timers,listeners,win})=>{
    api.proposal.value='<img>';api.submit();assert.equal(api.phase.value,'ready');assert(api.problem.value);assert.equal(timers.size,0)
    api.proposal.value='arbol';api.submit();advance(1550);assert.equal(api.solution.value,'ÁRBOL')
    win.location.hash='#palabra=LUNA';listeners.get('hashchange')()
    assert.equal(api.solution.value,'');assert.equal(api.proposal.value,'');assert.equal(timers.size,0)
    advance(10000);assert.equal(api.phase.value,'ready')
    win.location.hash='#palabra=%FF';listeners.get('hashchange')();assert.equal(api.phase.value,'invalid');assert(api.error.value)
    api.submit();assert.equal(timers.size,0)
  })
})

test('reduced motion settles immediately and switching preference during charge cancels all effects',async()=>{
  await environment(({api,timers,media,motionListeners})=>{
    api.proposal.value='arbol';api.submit();assert.equal(api.phase.value,'success');assert.equal(timers.size,0)
    media.matches=false;motionListeners.forEach(fn=>fn());api.replay();assert.equal(api.phase.value,'charging')
    media.matches=true;motionListeners.forEach(fn=>fn());assert.equal(api.phase.value,'success');assert.equal(timers.size,0)
  },true)
})

test('unmount clears listeners/timers; unavailable optional audio cannot block the result',async()=>{
  await environment(async({api,timers,listeners,motionListeners,unmount,advance,audioAccess})=>{
    await api.toggleSound();assert.equal(audioAccess(),1);assert.equal(api.soundEnabled.value,false);assert(api.soundNotice.value)
    api.proposal.value='arbol';api.submit();assert.equal(timers.size,1)
    unmount();assert.equal(timers.size,0);assert.equal(listeners.size,0);assert.equal(motionListeners.size,0)
    advance(10000);assert.equal(api.phase.value,'charging')
    api.replay();api.retry();api.submit();assert.equal(timers.size,0)
  })
})

test('audio device failure after activation cannot interrupt or trap the visual sequence',async()=>{
  await environment(async({api,advance,timers})=>{
    Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:class {
      state='running';currentTime=0
      async resume(){}
      createOscillator(){throw Error('Audio device removed')}
      async close(){}
    }})
    await api.toggleSound();assert.equal(api.soundEnabled.value,true)
    api.proposal.value='arbol';assert.doesNotThrow(()=>api.submit());advance(10000)
    assert.equal(api.phase.value,'success');assert.equal(api.soundEnabled.value,false);assert(api.soundNotice.value);assert.equal(timers.size,0)
  })
})
