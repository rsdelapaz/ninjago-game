// Real Chrome/CDP, synthetic storage in one temporary browser context only.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createProfile } from '../src/profile.ts'

const base = process.env.SMOKE_URL || 'http://localhost:5173'
const port = process.env.FINALE_CDP_PORT || '9224'
const output = new URL('../.preview.local/finale-11-1/', import.meta.url); mkdirSync(output, { recursive: true })
const answer = 'UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES'
const secret = 'Secreto sintético del ensayo: unidos habéis protegido el conocimiento del santuario.'
const school = createProfile('colegio'), urban = createProfile('urbanizacion')
school.teams[0].name = 'Clan del Cobre'; school.teams[0].color = '#d36b3d'
school.teams[1].name = 'Clan del Río'; school.teams[1].color = '#55c4de'
urban.finale = { answer: 'NIÑOS UNIDOS', secret: 'Secreto sintético del segundo perfil.', videoFilename: '', audioFilename: '', failureMessage: '' }
const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const socket = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
let serial = 0
let recording = false
const frames = []
const pending = new Map(), runtimeErrors = [], externalRequests = [], responses = [], phases = [], checks = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)) }, 20000)
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.method === 'Page.screencastFrame') {
    if (recording) {
      const file = `cinema-${String(frames.length).padStart(4, '0')}.jpg`
      writeFileSync(new URL(file, output), Buffer.from(message.params.data, 'base64'))
      frames.push({ file, time: message.params.metadata.timestamp })
    }
    void send('Page.screencastFrameAck', { sessionId: message.params.sessionId }, message.sessionId).catch(() => {})
  }
  if (message.id) {
    const item = pending.get(message.id); if (!item) return
    clearTimeout(item.timer); pending.delete(message.id)
    message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result)
  }
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  if (message.method === 'Network.requestWillBeSent') {
    const url = message.params.request.url
    if (/^https?:/.test(url) && new URL(url).origin !== new URL(base).origin) externalRequests.push(url)
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) responses.push({ url: message.params.response.url, status: message.params.response.status })
})
const { browserContextId } = await send('Target.createBrowserContext')
async function attach(targetId) {
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const command = (method, params = {}) => send(method, params, sessionId)
  await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable')
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true })
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  return { targetId, command, evaluate }
}
async function wait(page, expression, timeout = 22000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await page.evaluate(expression)) return
    await new Promise(resolve => setTimeout(resolve, 35))
  }
  throw Error(`Timed out: ${expression}`)
}
async function click(page, text, scope = 'document') {
  await page.evaluate(`(() => { const button = [...${scope}.querySelectorAll('button')].find(el => el.textContent.trim().includes(${JSON.stringify(text)})); if (!button || button.disabled) throw Error('Missing/disabled button: '+${JSON.stringify(text)}); button.click(); })()`)
}
async function input(page, selector, value) {
  await page.evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); if (!input) throw Error('Missing input'); input.value=${JSON.stringify(value)}; input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
}
async function size(page, width, height) { await page.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }) }
async function screenshot(page, name) {
  const { data } = await page.command('Page.captureScreenshot', { format: 'png' })
  writeFileSync(new URL(name + '.png', output), Buffer.from(data, 'base64'))
}
async function fits(page) {
  assert.equal(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'horizontal overflow')
  assert.equal(await page.evaluate('document.documentElement.scrollHeight <= innerHeight'), true, 'vertical overflow')
}
const progressExpression = `JSON.parse(localStorage.getItem('ninja-control-v3')).finales?.[JSON.parse(localStorage.getItem('ninja-control-v3')).profileId]`
async function progress(page) { return page.evaluate(progressExpression) }
async function phase(page, name, capture) {
  await wait(page, `!!document.querySelector('.finale-phase-${name}')`)
  phases.push({ phase: name, at: Date.now() })
  if (capture) await screenshot(page, capture)
}
let admin, audience
async function submit(proposal, keyboard = false) {
  await wait(admin, '!!document.querySelector("#finale-proposal") && !document.querySelector("#finale-proposal").disabled')
  await input(admin, '#finale-proposal', proposal)
  if (keyboard) {
    await admin.command('Page.bringToFront')
    await admin.evaluate('document.querySelector("#finale-proposal").focus()')
    await admin.command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
    await admin.command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  } else await click(admin, 'Entregar al Maestro Wu', "document.querySelector('.finale-controls')")
  await audience.command('Page.bringToFront')
}
async function reset() {
  await click(admin, 'reiniciar', "document.querySelector('.finale-controls')").catch(async () => click(admin, 'Reiniciar desenlace', "document.querySelector('.finale-controls')"))
  if (await admin.evaluate('!!document.querySelector("dialog[open]")')) {
    await click(admin, 'Sí, continuar', 'document.querySelector("dialog[open]")')
  } else {
    // The modal mounts on Vue's next tick.
    const status = (await progress(admin)).status
    if (['success', 'revealing'].includes(status)) {
      await wait(admin, '!!document.querySelector("dialog[open]")')
      await click(admin, 'Sí, continuar', 'document.querySelector("dialog[open]")')
    }
  }
  await wait(admin, `(${progressExpression})?.status === 'ready'`)
  await phase(audience, 'ready')
}
try {
 school.finale={answer,secret,videoFilename:'',audioFilename:'',failureMessage:''};
 const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId});admin=await attach(targetId);
 await admin.command('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.origin===${JSON.stringify(new URL(base).origin)}){window.name='ninja-public';if(!localStorage.getItem('ninja-profile-v2:colegio'))localStorage.setItem('ninja-profile-v2:colegio',${JSON.stringify(JSON.stringify(school))})}`});
 await admin.command('Page.navigate',{url:base+'/?screen=admin'});await wait(admin,'!!document.querySelector(".profile-options")');await click(admin,'Colegio');await wait(admin,'!!document.querySelector(".command-center")');
 assert.equal(await admin.evaluate('window.name'),'ninja-admin');
 await admin.evaluate("window.name='ninja-public'"); await click(admin,'Preparar pantalla pública');await wait(admin,'document.querySelector(".public-screen-status").classList.contains("available")');
 const targets=(await send('Target.getTargets')).targetInfos.filter(t=>t.browserContextId===browserContextId&&t.type==='page');
 const publicTarget=targets.find(t=>t.url===base+'/');assert(publicTarget);assert.notEqual(publicTarget.targetId,admin.targetId);assert((await admin.evaluate('location.search')).includes('screen=admin'));
 await click(admin,'Preparar pantalla pública');assert.equal((await send('Target.getTargets')).targetInfos.filter(t=>t.browserContextId===browserContextId&&t.type==='page').length,2);
 audience=await attach(publicTarget.targetId);
 await audience.command('Page.navigate',{url:base+'/?screen=enigma'});
 await wait(admin,'!document.querySelector(".public-screen-status").classList.contains("available")');
 await click(admin,'Preparar pantalla pública');
 await wait(admin,'document.querySelector(".public-screen-status").classList.contains("available")');
 assert.equal(await audience.evaluate('location.search'),'');
 await send('Target.closeTarget',{targetId:audience.targetId});
 await wait(admin,'!document.querySelector(".public-screen-status").classList.contains("available")');
 await click(admin,'Preparar pantalla pública');
 await wait(admin,'document.querySelector(".public-screen-status").classList.contains("available")');
 let current=(await send('Target.getTargets')).targetInfos.filter(t=>t.browserContextId===browserContextId&&t.type==='page'&&t.targetId!==admin.targetId);
 assert.equal(current.length,1);assert.notEqual(current[0].targetId,publicTarget.targetId);
 await send('Target.closeTarget',{targetId:current[0].targetId});
 await wait(admin,'!document.querySelector(".public-screen-status").classList.contains("available")');
 await admin.evaluate('window.__nativeOpen=window.open;window.open=()=>null');
 await click(admin,'Preparar pantalla pública');
 await wait(admin,'!!document.querySelector(".error-notice a")');
 await wait(admin,'!document.querySelector(".open-public").disabled');
 const link=await admin.evaluate('(()=>{const a=[...document.querySelectorAll("a")].find(a=>a.textContent.includes("manualmente"));return a?{target:a.target,rel:a.rel,href:a.href}:null})()');
 assert(link);assert.equal(link.target,'_blank');assert(link.rel.includes('noopener'));
 await admin.evaluate('[...document.querySelectorAll("a")].find(a=>a.textContent.includes("manualmente")).click()');
 await wait(admin,'document.querySelector(".public-screen-status").classList.contains("available")');
 assert.equal(await admin.evaluate('location.search'),'?screen=admin');
 current=(await send('Target.getTargets')).targetInfos.filter(t=>t.browserContextId===browserContextId&&t.type==='page'&&t.targetId!==admin.targetId);
 assert.equal(current.length,1);assert.equal(current[0].url,base+'/');
 await admin.evaluate('window.open=window.__nativeOpen;delete window.__nativeOpen');
 await click(admin,'Preparar pantalla pública');
 await wait(admin,'document.querySelector(".public-screen-status").classList.contains("available")');
 assert.equal((await send('Target.getTargets')).targetInfos.filter(t=>t.browserContextId===browserContextId&&t.type==='page').length,2);
 await screenshot(admin,'manual-window-admin');
 writeFileSync(new URL('window-qa.json',output),JSON.stringify({browser:version.Browser,checks:['inherited and late window.name','distinct actual prepare target','repeat without duplicate','old named enigma repaired','close and reopen','window.open null recovery','native manual _blank separate target with admin unchanged','manual target reused after fresh handshake'],runtimeErrors},null,2));
 assert.deepEqual(runtimeErrors,[]);
 console.log('PASS real Chrome: inherited name, distinct target, repeat, old target repair, close/reopen, simulated blocking, native manual link and reuse.');
}finally{await send('Target.disposeBrowserContext',{browserContextId});socket.close();for(const p of pending.values())clearTimeout(p.timer)}
