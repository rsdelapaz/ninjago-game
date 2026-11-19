// Normal Chrome/CDP. All writes stay in a temporary, synthetic browser context.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createProfile } from '../src/profile.ts'

const base = process.env.SMOKE_URL || 'http://localhost:5173'
const port = process.env.FINALE_CDP_PORT || '9224'
const output = new URL('../.preview.local/sanctuary-quality/', import.meta.url)
mkdirSync(output, { recursive: true })
const answer = 'NIÑOS DEL SANTUARIO UNIDOS'
const shortSecret = 'CAMPEONES DEL MUNDO'
const longSecret = Array.from({ length: 12 }, (_, i) => `Párrafo ${i + 1}. ${'Mensaje ancestral de ensayo, conservado íntegramente. '.repeat(4)}`).join('\n\n')
const customFailure = 'Mensaje adicional de ensayo: reunid las pistas de ambos clanes.'
function fixture(id, title) {
  const config = createProfile(id)
  const names = ['Ágata Ensayo', 'Bruno Ensayo', 'Clara Ensayo', 'Diego Ensayo', 'Érica Ensayo', 'Félix Ensayo', 'Inés Ensayo', 'Lucía Ensayo', 'Martín Ensayo', 'Nora Ensayo', 'Óscar Ensayo', 'Pablo Ensayo', 'Raúl Ensayo', 'Sara Ensayo', 'Úrsula Ensayo', 'Zoe Ensayo']
  config.participants = names.map((name, index) => ({ id: `${id}-person-${index}`, name: `${title} ${name}` }))
  config.participants[4].name = `${title} Érica Ensayo de las Montañas del Amanecer y del Santuario de los Mil Dragones`
  config.teams.forEach((team, index) => {
    team.name = `${title} ${index ? 'Guardianes del Río' : 'Guardianes del Cobre'}`
    team.color = index ? '#55c4de' : '#d36b3d'
    team.memberIds = config.participants.filter((_, i) => i % 2 === index).map(p => p.id)
    team.captainId = team.memberIds[2]
  })
  config.finale = { answer, secret: shortSecret, videoFilename: '', audioFilename: '', failureMessage: customFailure }
  return config
}
const school = fixture('colegio', 'Colegio'), urban = fixture('urbanizacion', 'Jardín')
urban.finale.secret = 'EL SEGUNDO SANTUARIO OS RECUERDA'
urban.finale.videoFilename = 'final-ensayo-ausente.mp4'
urban.finale.audioFilename = 'final-ensayo-ausente.ogg'
const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const socket = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
let serial = 0, recording = false
const pending = new Map(), frames = [], checks = [], runtimeErrors = [], externalRequests = [], responses = [], geometry = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)) }, 25000)
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.method === 'Page.screencastFrame') {
    if (recording) {
      const file = `ceremony-${String(frames.length).padStart(4, '0')}.jpg`
      writeFileSync(new URL(file, output), Buffer.from(message.params.data, 'base64'))
      frames.push({ file, time: message.params.metadata.timestamp })
    }
    void send('Page.screencastFrameAck', { sessionId: message.params.sessionId }, message.sessionId).catch(() => {})
  }
  if (message.id) {
    const item = pending.get(message.id)
    if (item) { clearTimeout(item.timer); pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result) }
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
  // Windows may occlude this isolated window. Keep real browser rendering active, not a synthetic GSAP clock.
  await command('Emulation.setFocusEmulationEnabled', { enabled: true })
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true })
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  return { targetId, command, evaluate }
}
async function wait(page, expression, timeout = 25000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await page.evaluate(expression)) return
    await new Promise(resolve => setTimeout(resolve, 30))
  }
  throw Error(`Timed out: ${expression}`)
}
async function input(page, selector, value) {
  await page.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing input '+${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}))})()`)
}
async function clickText(page, text, scope = 'document') {
  const expression = `(()=>{const el=[...${scope}.querySelectorAll('button')].find(b=>b.textContent.trim().includes(${JSON.stringify(text)}));return !!el&&!el.disabled})()`
  await wait(page, expression)
  await page.evaluate(`(()=>{[...${scope}.querySelectorAll('button')].find(b=>b.textContent.trim().includes(${JSON.stringify(text)})).click()})()`)
}
async function action(page, name, privateControl = false, double = false) {
  const selector = `${privateControl ? '.finale-controls' : '.finale-stage'} [data-action="${name}"]`
  await wait(page, `!!document.querySelector(${JSON.stringify(selector)})&&!document.querySelector(${JSON.stringify(selector)}).disabled`)
  await page.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.click();${double ? 'el.click();' : ''}})()`)
}
const stateExpression = `JSON.parse(localStorage.getItem('ninja-control-v3'))`
const progressExpression = `(${stateExpression}).finales?.[(${stateExpression}).profileId]`
async function progress() { return admin.evaluate(progressExpression) }
async function story(name) {
  await wait(audience, `document.querySelector('.finale-stage')?.dataset.storyPhase===${JSON.stringify(name)}`)
  await wait(admin, name === 'intro' ? `(!(${progressExpression})||!(${progressExpression}).ceremonyPhase||(${progressExpression}).ceremonyPhase==='intro')` : `(${progressExpression})?.ceremonyPhase===${JSON.stringify(name)}`)
}
async function settled(name) { await story(name); await wait(admin, `!['rejecting','revealing'].includes((${progressExpression})?.status)`) }
async function screenshot(page, name, stable = true) {
  if (stable) await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>resolve())).then(()=>Promise.allSettled(document.getAnimations().filter(a=>a.playState==="running"&&Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished)))')
  const { data } = await page.command('Page.captureScreenshot', { format: 'png' })
  writeFileSync(new URL(`${name}.png`, output), Buffer.from(data, 'base64'))
}
async function size(page, width, height) { await page.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }) }
async function reload(page) {
  const origin = await page.evaluate('performance.timeOrigin')
  await page.command('Page.reload', { ignoreCache: true })
  await wait(page, `performance.timeOrigin!==${JSON.stringify(origin)}&&document.readyState!=='loading'`)
}
async function reduced(value = true) { await audience.command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: value ? 'reduce' : 'no-preference' }] }) }
async function publicText() { return audience.evaluate('document.querySelector(".finale-stage").textContent') }
async function noSpoiler() {
  const text = await publicText()
  assert(!text.includes('Cada clan guarda una parte'), 'cooperation twist must remain hidden')
  assert(!text.includes('Unid vuestras pistas'), 'cooperation instruction must remain hidden')
  assert(!text.includes(customFailure), 'custom text is withheld before the twist')
  assert(!text.includes(shortSecret), 'secret remains hidden')
}
async function roster(config, index) {
  const text = await publicText(), team = config.teams[index]
  for (const id of team.memberIds) assert(text.includes(config.participants.find(p => p.id === id).name), `Missing synthetic member ${id}`)
  assert(text.includes(team.name))
  const captain = config.participants.find(p => p.id === team.captainId)
  assert(await audience.evaluate(`(()=>{const el=document.querySelector('.finale-roster [data-captain="true"],.finale-roster .finale-captain');return !!el&&el.textContent.includes(${JSON.stringify(captain.name)})})()`), 'Captain must be visually identified')
  assert.equal(await audience.evaluate('document.querySelector(".finale-roster > li:first-child")?.dataset.captain'), 'true', 'Captain appears first')
  assert.equal(await audience.evaluate('document.querySelectorAll(".finale-roster > li").length'), team.memberIds.length, 'Every clan member has a visible inscription')
}
async function submit(value, privateControl = false, double = false) {
  const page = privateControl ? admin : audience, selector = privateControl ? '#finale-proposal' : '#finale-public-proposal'
  await wait(page, `!!document.querySelector(${JSON.stringify(selector)})&&!document.querySelector(${JSON.stringify(selector)}).disabled`)
  await input(page, selector, value)
  if (privateControl) await action(admin, 'submit', true, double)
  else {
    await audience.command('Page.bringToFront')
    await audience.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`)
    await audience.command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
    if (double) await audience.command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
    await audience.command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  }
}
async function restart() {
  await action(admin, 'reset', true)
  await wait(admin, '!!document.querySelector("dialog[open]")')
  await clickText(admin, 'Sí, continuar', 'document.querySelector("dialog[open]")')
  await story('intro')
}
async function firstAnswer() {
  await story('intro'); await action(audience, 'advance'); await story('call1')
  await action(audience, 'advance'); await story('clues1')
  await action(audience, 'clues-yes'); await story('answer1')
}
async function changeProfile(id) {
  await admin.evaluate(`(()=>{const el=document.querySelector('.active-profile select');el.value=${JSON.stringify(id)};el.dispatchEvent(new Event('change',{bubbles:true}))})()`)
  await wait(admin, '!!document.querySelector("dialog[open]")')
  await clickText(admin, 'Continuar', 'document.querySelector("dialog[open]")')
  await wait(admin, `document.querySelector('.active-profile select').value===${JSON.stringify(id)}`)
}
async function showFinal() { await clickText(admin, 'Mostrar el final'); await wait(audience, '!!document.querySelector(".finale-stage")') }
async function checkGeometry(name, width, height) {
  await size(audience, width, height)
  const measure = await audience.evaluate('(()=>{const r=document.querySelector(".finale-stage").getBoundingClientRect();return {horizontal:document.documentElement.scrollWidth>innerWidth,stageWidth:r.width,viewport:innerWidth,scroll:document.documentElement.scrollHeight>innerHeight}})()')
  assert.equal(measure.horizontal, false, `${name}: horizontal overflow`)
  geometry.push({ name, width, height, ...measure }); await screenshot(audience, `${name}-${width}`)
}
let admin, audience
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  admin = await attach(targetId)
  const seed = { 'ninja-profile-v2:colegio': school, 'ninja-profile-v2:urbanizacion': urban }
  await admin.command('Page.addScriptToEvaluateOnNewDocument', { source: `if(location.origin===${JSON.stringify(new URL(base).origin)}){const seed=${JSON.stringify(seed)};for(const [key,value]of Object.entries(seed))if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value))}` })
  await size(admin, 1440, 1000); await admin.command('Page.navigate', { url: `${base}/?screen=admin` })
  await wait(admin, '!!document.querySelector(".profile-options")'); await clickText(admin, 'Colegio')
  await wait(admin, '!!document.querySelector("[data-module=finale]")'); await admin.evaluate('document.querySelector("[data-module=finale]").click()')
  await clickText(admin, 'Preparar pantalla pública')
  let target
  for (let turn = 0; turn < 100; turn++) {
    target = (await send('Target.getTargets')).targetInfos.find(t => t.browserContextId === browserContextId && t.type === 'page' && t.targetId !== admin.targetId)
    if (target) break
    await new Promise(resolve => setTimeout(resolve, 30))
  }
  assert(target); audience = await attach(target.targetId)
  await size(audience, 1920, 1080); await wait(admin, '!!document.querySelector(".public-screen-status.available")')
  const schoolSaved = await admin.evaluate('localStorage.getItem("ninja-profile-v2:colegio")')

  async function physical(page,selector,keyboard=false){
   await wait(page,`!!document.querySelector(${JSON.stringify(selector)})&&!document.querySelector(${JSON.stringify(selector)}).disabled`)
   const position=await page.evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;b.focus();return {x,y,hit:document.elementFromPoint(x,y)?.closest('button')===b}})()`)
   assert(position.hit,'Physical target must be reachable: '+selector)
   if(keyboard){await page.command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await page.command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})}
   else{await page.command('Input.dispatchMouseEvent',{type:'mousePressed',x:position.x,y:position.y,button:'left',clickCount:1});await page.command('Input.dispatchMouseEvent',{type:'mouseReleased',x:position.x,y:position.y,button:'left',clickCount:1})}
  }
  async function roundTrip(phase,keyboard=false){
   const saved=await progress(),config=await admin.evaluate('localStorage.getItem("ninja-profile-v2:colegio")')
   await physical(audience,'[data-action=home]',keyboard);await wait(audience,'!!document.querySelector("dialog[open]")');await physical(audience,'dialog[open] .primary',!keyboard)
   await wait(audience,'!!document.querySelector(".adventure .start-button")')
   assert.deepEqual(await progress(),saved);assert.equal(await admin.evaluate('localStorage.getItem("ninja-profile-v2:colegio")'),config)
   await showFinal();await story(phase)
  }
  async function captureSizes(name){for(const [w,h]of [[1920,1080],[1366,768],[1280,720]]){await size(audience,w,h);assert.equal(await audience.evaluate('document.documentElement.scrollWidth>innerWidth'),false);
   const layout=await audience.evaluate('(()=>{const s=document.querySelector(".finale-stage").getBoundingClientRect(),d=document.querySelector(".finale-dialogue").getBoundingClientRect(),h=document.querySelector(".finale-dialogue h1").getBoundingClientRect(),wu=document.querySelector(".finale-wu").getBoundingClientRect(),badge=document.querySelector(".finale-clan-heading"),b=document.querySelector(".finale-actions button,.finale-response button").getBoundingClientRect(),q=document.querySelector(".finale-rejected-answer")?.getBoundingClientRect();return {centred:Math.abs(h.x+h.width/2-(s.x+s.width/2))<3,wuClear:wu.right<d.left,buttonAfterQuote:!q||q.bottom<=b.top,clanColor:badge?getComputedStyle(badge).color:null}})()')
   assert(layout.centred&&layout.wuClear&&layout.buttonAfterQuote,JSON.stringify(layout))
   if(layout.clanColor&&name!=='truth'){const hex=school.teams[0].color;assert.equal(layout.clanColor,`rgb(${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(', ')})`)}
   geometry.push({name,width:w,height:h,...layout});await screenshot(audience,name+'-'+w)}await size(audience,1920,1080)}
  await showFinal();await story('intro');await reduced(true)
  await captureSizes('initial');await roundTrip('intro',true)
  await action(audience,'advance');await story('call1');await roster(school,0);await captureSizes('clan')
  await action(audience,'advance');await story('clues1');await action(audience,'clues-yes');await story('answer1')
  assert.equal(await audience.evaluate('document.querySelectorAll(".finale-roster li").length'),0)
  await captureSizes('response')
  await input(audience,'#finale-public-proposal','BORRADOR TEMPORAL')
  await roundTrip('answer1')
  await wait(audience,'document.querySelector("#finale-public-proposal")?.value === ""')
  const rejected='  ¡Sombras de piedra, clan uno!  '
  await submit(rejected);await settled('fail1')
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer blockquote p").textContent'),rejected)
  assert.equal(await audience.evaluate('document.querySelectorAll(".finale-roster li").length'),0)
  await roundTrip('fail1');await captureSizes('failure')
  await changeProfile('urbanizacion');await showFinal();await story('intro')
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer")'),null);assert(!(await publicText()).includes(rejected))
  await changeProfile('colegio');await showFinal();await story('fail1')
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer blockquote p").textContent'),rejected)
  await action(audience,'advance');await story('call2');await roster(school,1)
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer")'),null)
  await action(audience,'advance');await story('clues2');await action(audience,'clues-yes');await story('answer2')
  const second='<b>Hierro & sombras</b>'
  await submit(second,true);await settled('fail2');await reload(audience);await settled('fail2')
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer blockquote p").textContent'),second)
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer b")'),null)
  await reduced(false);await wait(audience,'!document.querySelector(".finale-reduced")')
  await wait(audience,'document.querySelector(".finale-ruin-dust").getAnimations().some(a=>a.playState==="running")')
  assert.equal(await audience.evaluate('document.querySelector(".finale-rejected-answer blockquote p").textContent'),second)
  await reduced(true);await wait(audience,'!!document.querySelector(".finale-reduced")')
  assert(!(await publicText()).includes(rejected));await roundTrip('fail2',true)
  await action(audience,'advance');await story('truth');await captureSizes('truth')
  await action(audience,'advance');await story('captain');await action(audience,'advance');await story('words');await action(audience,'advance');await story('joint')
  await reduced(false);await wait(audience,'!document.querySelector(".finale-reduced")');await submit(answer);await wait(audience,'!!document.querySelector(".finale-phase-anticipation,.finale-phase-symbols")')
  await settled('victory');assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'),shortSecret)
  assert.equal((await progress()).rejectedAnswer,undefined)
  await roundTrip('victory');await screenshot(audience,'victory-preserved')
  const beforeReplay=await progress(),savedReplayConfig=await audience.evaluate('localStorage.getItem("ninja-profile-v2:colegio")')
  await physical(audience,'[data-action=replay]');await wait(audience,'!!document.querySelector("dialog[open]")');await physical(audience,'dialog[open] .primary',true)
  await wait(audience,'!!document.querySelector(".finale-phase-anticipation,.finale-phase-symbols,.finale-phase-convergence")');await settled('victory')
  assert.deepEqual((await progress()).attempts,beforeReplay.attempts,'Public replay preserves attempts')
  assert.equal(await audience.evaluate('localStorage.getItem("ninja-profile-v2:colegio")'),savedReplayConfig,'Public replay preserves exact configuration')
  assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'),shortSecret)
  assert.deepEqual(runtimeErrors,[]);assert.deepEqual(externalRequests,[])
  writeFileSync(new URL('quality-qa.json',output),JSON.stringify({browser:version.Browser,checks:['native public confirmation','physical mouse/keyboard navigation','home/return preserves story/configuration in intro,response,fail1,fail2,victory','exact rejected text scoped to turn survives reload','Vue escapes HTML proposal','no members outside clan calls'],runtimeErrors,externalRequests,geometry},null,2))
  console.log('PASS sanctuary P0 mouse/keyboard, exact rejected response, turn isolation, native confirmations, preserved victory')
}catch(error){if(audience)await screenshot(audience,'quality-failure',false).catch(()=>{});throw error}
finally{await send('Target.disposeBrowserContext',{browserContextId}).catch(()=>{});socket.close();for(const item of pending.values())clearTimeout(item.timer)}
