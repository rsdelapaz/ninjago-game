// Normal Chromium with loopback DevTools. Fresh context only; never clear owner data.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
const base=process.env.SMOKE_URL || 'http://localhost:5173'
const port=process.env.ENIGMA_CDP_PORT || '9224'
const output=new URL('../.preview.local/enigma-10-1/',import.meta.url);mkdirSync(output,{recursive:true})
const version=await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const socket=new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})})
let serial=0
const pending=new Map(),errors=[],external=[],requests=[]
let blockArtwork=false
let recording='',frames=[]
const clips={}
function send(method,params={},sessionId){return new Promise((resolve,reject)=>{
  const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP timeout: ${method}`))},15000)
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,sessionId}))
})}
socket.addEventListener('message',({data})=>{
  const message=JSON.parse(data)
  if(message.method==='Page.screencastFrame'){
    if(recording){const file=`${recording}-${String(frames.length).padStart(4,'0')}.jpg`;writeFileSync(new URL(file,output),Buffer.from(message.params.data,'base64'));frames.push({file,time:message.params.metadata.timestamp})}
    void send('Page.screencastFrameAck',{sessionId:message.params.sessionId},message.sessionId)
  }
  if(message.id){const p=pending.get(message.id);if(!p)return;clearTimeout(p.timer);pending.delete(message.id);message.error?p.reject(Error(JSON.stringify(message.error))):p.resolve(message.result)}
  if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text)
  if(message.method==='Network.requestWillBeSent')requests.push(message.params.request.url)
  if(message.method==='Fetch.requestPaused'){
    const url=message.params.request.url,local=new URL(url).origin===new URL(base).origin
    if(!local)external.push(url)
    const allowed=local&&!(blockArtwork&&url.endsWith('/private-media/enigma-sanctuary.png'))
    void send(allowed?'Fetch.continueRequest':'Fetch.failRequest',allowed?{requestId:message.params.requestId}:{requestId:message.params.requestId,errorReason:'InternetDisconnected'},message.sessionId)
  }
})
const {browserContextId}=await send('Target.createBrowserContext')
const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId})
const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true})
const c=(method,params={})=>send(method,params,sessionId)
async function evaluate(expression){const r=await c('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function wait(expression){for(let i=0;i<160;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,60))}throw Error('Timed out: '+expression)}
async function size(width,height){await c('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})}
async function screenshot(name){const {data}=await c('Page.captureScreenshot',{format:'png'});writeFileSync(new URL(name+'.png',output),Buffer.from(data,'base64'))}
async function record(name){recording=name;frames=[];await c('Page.startScreencast',{format:'jpeg',quality:65,maxWidth:960,maxHeight:540,everyNthFrame:3})}
async function finish(){await c('Page.stopScreencast');clips[recording]=frames;recording=''}
async function navigate(answer){await c('Page.navigate',{url:'about:blank'});await wait('location.href === "about:blank"');await c('Page.navigate',{url:base+'/?screen=enigma'+(answer===null?'':'#palabra='+encodeURIComponent(answer))});await wait('!!document.querySelector(".enigma-stage")')}
async function click(text){await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`)}
async function propose(value,enter=false){
  await evaluate(`(()=>{const input=document.querySelector('#enigma-proposal');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()})()`)
  if(enter){await c('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await c('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})}
  else await click('DESVELAR EL ENIGMA')
}
async function fits(){assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'horizontal overflow');assert.equal(await evaluate('document.documentElement.scrollHeight <= innerHeight'),true,'vertical overflow')}
try {
  await c('Page.enable');await c('Runtime.enable');await c('Network.enable');await c('Network.setCacheDisabled',{cacheDisabled:true})
  await c('Fetch.enable',{patterns:[{urlPattern:'http*://*/*'}]})
  await c('Page.addScriptToEvaluateOnNewDocument',{source:`window.__enigmaWrites=[];window.__enigmaChannels=[];window.__enigmaAudio=0;
    const originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){window.__enigmaWrites.push(key);return originalWrite.call(this,key,value)};
    const Channel=window.BroadcastChannel;window.BroadcastChannel=class extends Channel{constructor(name){super(name);window.__enigmaChannels.push(name)}};
    const Context=window.AudioContext;if(Context)window.AudioContext=class extends Context{constructor(...args){super(...args);window.__enigmaAudio++}};`})
  await size(1920,1080);await navigate('ÁRBOL');await fits()
  assert.equal(await evaluate('document.body.textContent.includes("ÁRBOL")'),false)
  assert.equal(await evaluate('window.__enigmaAudio'),0)
  assert.equal(await evaluate('document.activeElement.id'),'enigma-proposal')
  await screenshot('ready-1920')
  await record('defeat');await propose('otra');await wait('!!document.querySelector(".enigma-failure")');await finish();await screenshot('failure-1920');await fits()
  assert.equal(await evaluate('document.body.textContent.includes("ÁRBOL")'),false)
  assert.equal(await evaluate('document.querySelectorAll(".enigma-letter,.enigma-fallout").length'),0)
  assert((await evaluate('getComputedStyle(document.querySelector(".enigma-ring")).clipPath'))!=='none')
  await click('VOLVER A INTENTARLO');await wait('!!document.querySelector("#enigma-proposal")')
  assert.equal(await evaluate('document.querySelector(".enigma-defeated")'),null)
  await record('victory')
  await propose('arbol',true);await wait('!!document.querySelector(".enigma-charging")');await screenshot('charging-1920')
  await wait('!!document.querySelector(".enigma-revealing")');await screenshot('revealing-1920')
  await wait('!!document.querySelector(".enigma-celebrating")');await screenshot('celebration-1920')
  await wait('!!document.querySelector(".enigma-success")');await finish();await fits();await screenshot('victory-1920')
  assert.equal(await evaluate('document.querySelector(".enigma-answer").getAttribute("aria-label")'),'ÁRBOL')
  await click('Repetir revelación');await wait('!!document.querySelector(".enigma-success")')
  assert.equal(await evaluate('document.querySelectorAll(".enigma-festival").length'),0)
  const hash=await evaluate('location.hash')
  await click('REINICIAR ENIGMA');await wait('document.activeElement.id === "enigma-proposal"')
  assert.equal(await evaluate('location.hash'),hash);assert.equal(await evaluate('document.querySelector("input").value'),'')
  assert.equal(await evaluate('document.querySelectorAll(".enigma-answer,.enigma-festival,.enigma-fallout").length'),0)
  for(let cycle=0;cycle<3;cycle++){
    await propose('otra');await wait('!!document.querySelector(".enigma-failure")');await click('VOLVER A INTENTARLO')
    await propose('arbol');await wait('!!document.querySelector(".enigma-success")')
    await click('Repetir revelación');await wait('!!document.querySelector(".enigma-charging")')
    await click('REINICIAR ENIGMA');await wait('document.activeElement.id === "enigma-proposal"')
    assert.equal(await evaluate('document.body.textContent.includes("ÁRBOL")'),false)
  }
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
  await navigate('ENSAYO');await click('Activar sonido')
  await wait('document.querySelector(".enigma-tools button").getAttribute("aria-pressed") === "true" || !!document.querySelector(".enigma-footer [role=status]")')
  const audioEnabled=await evaluate('document.querySelector(".enigma-tools button").getAttribute("aria-pressed") === "true"')
  await propose('ensayo');if(audioEnabled)await click('Sonido activado')
  await wait('!!document.querySelector(".enigma-success")')
  console.log('Audio enable/mute exercised: '+audioEnabled)
  if(process.env.ENIGMA_TEST_FULLSCREEN==='1' && await evaluate('document.fullscreenEnabled')){
    await click('Pantalla completa');await wait('!!document.fullscreenElement || !!document.querySelector(".enigma-footer [role=status]")')
    const entered=await evaluate('!!document.fullscreenElement')
    if(entered){await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.includes("Salir de pantalla completa"))');await click('Salir de pantalla completa');await wait('!document.fullscreenElement')}
    console.log('Native fullscreen entered/exited: '+entered)
  }
  blockArtwork=true;await navigate('RESPALDO');await wait('!document.querySelector(".enigma-art")')
  await screenshot('fallback-1920');await propose('respaldo');await wait('!!document.querySelector(".enigma-success")')
  blockArtwork=false
  await size(1366,768);await navigate('PODER NINJA');await fits();await screenshot('ready-1366')
  await propose('poder   ninja',true);await wait('!!document.querySelector(".enigma-success")');await fits();await screenshot('victory-1366')
  await navigate('A'.repeat(48));await propose('a'.repeat(48));await wait('!!document.querySelector(".enigma-success")');await fits();await screenshot('long-1366')
  await size(390,844);await navigate('PODER NINJA');await fits();await screenshot('ready-390')
  await propose('otra');await wait('!!document.querySelector(".enigma-failure")');await fits();await screenshot('failure-390');await click('VOLVER A INTENTARLO')
  await propose('poder ninja');await wait('!!document.querySelector(".enigma-success")');await fits();await screenshot('victory-390')
  await size(1920,1080);await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await navigate('NIÑO');await propose('nino');await wait('!!document.querySelector(".enigma-failure")')
  await screenshot('reduced-failure-1920');assert.equal(await evaluate('document.querySelectorAll(".enigma-fallout").length'),0)
  await click('VOLVER A INTENTARLO');await propose('niño');await wait('!!document.querySelector(".enigma-success")');await screenshot('reduced-1920')
  assert.equal(await evaluate('document.querySelectorAll(".enigma-festival").length'),0)
  assert.deepEqual(await evaluate('window.__enigmaWrites'),[]);assert.deepEqual(await evaluate('window.__enigmaChannels'),[])
  assert.equal(await evaluate('localStorage.length'),0)
  assert(!requests.some(url=>url.includes('/src/App.vue')||url.includes('/src/usePresentation.ts')||url.includes('/src/profileStorage.ts')),'game code loaded')
  await navigate(null);await wait('!!document.querySelector(".enigma-invalid")');await screenshot('invalid-1920')
  assert.equal(await evaluate('document.querySelectorAll("form").length'),0)
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  writeFileSync(new URL('motion.json',output),JSON.stringify(clips))
  const html=`<!doctype html><meta charset="utf-8"><title>Hito 10.1 · Secuencias reales Chrome</title><style>body{background:#07121e;color:#fff;font:16px Arial;margin:24px}section{display:grid;grid-template-columns:1fr 1fr;gap:16px}img{width:100%}button{padding:12px}</style><h1>Derrota y victoria · captura continua real</h1><button id="play">Reproducir secuencias</button><section>${Object.keys(clips).map(name=>`<div><h2>${name}</h2><img id="${name}" src="${clips[name][0]?.file}"></div>`).join('')}</section><script>const clips=${JSON.stringify(clips)};document.querySelector('#play').onclick=()=>{for(const [name,frames] of Object.entries(clips)){const start=performance.now(),first=frames[0].time;function step(now){const frame=frames.findLast(f=>(f.time-first)*1000<=now-start)||frames[0];document.getElementById(name).src=frame.file;if(now-start<(frames.at(-1).time-first)*1000)requestAnimationFrame(step)}requestAnimationFrame(step)}}</script>`
  writeFileSync(new URL('animation-review.html',output),html)
  console.log('PASS real Chrome: isolated entry, error/retry, Enter, reveal/replay, 48 letters, 2 desktop sizes/mobile, reduced motion, no game writes/channels, no external HTTP.')
  console.log('Screenshots: '+output.pathname)
} catch(error) {await screenshot('failure-debug').catch(()=>{});throw error}
finally {await send('Target.disposeBrowserContext',{browserContextId});socket.close();for(const p of pending.values())clearTimeout(p.timer)}
