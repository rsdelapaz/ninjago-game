// Normal Chrome/CDP. All writes stay in a temporary, synthetic browser context.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createProfile } from '../src/profile.ts'

const base = process.env.SMOKE_URL || 'http://localhost:5173'
const port = process.env.FINALE_CDP_PORT || '9224'
const output = new URL('../.preview.local/finale-11-3/', import.meta.url)
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
  await showFinal(); await story('intro'); await noSpoiler(); await screenshot(audience, 'introduction-1920')
  await action(audience, 'advance'); await story('call1'); await roster(school, 0); await noSpoiler()
  await screenshot(audience, 'clan-one-1920'); await action(audience, 'advance'); await story('clues1')
  await action(audience, 'clues-no'); await story('clues1')
  assert.equal((await progress()).cluesMissing, true)
  await reload(audience); await story('clues1'); await noSpoiler()
  await action(audience, 'clues-yes'); await story('answer1')
  await input(audience, '#finale-public-proposal', 'PRIMERA FRASE INCOMPLETA')
  await input(admin, '#finale-proposal', 'PRIMERA FRASE INCOMPLETA')
  await Promise.all([
    audience.evaluate('document.querySelector(".finale-stage [data-action=submit]").click()'),
    admin.evaluate('document.querySelector(".finale-controls [data-action=submit]").click()'),
  ])
  await settled('fail1'); await noSpoiler(); assert.equal((await progress()).attempts[0], 1)
  await checkGeometry('first-failure', 1920, 1080)
  await checkGeometry('first-failure', 1366, 768); await checkGeometry('first-failure', 390, 844); await size(audience,1920,1080)
  checks.push('first roster includes all members and marked captain, NO waits and reloads, simultaneous public/private wrong deliveries persist one attempt, no cooperation spoiler')
  await action(audience, 'advance'); await story('call2'); await roster(school, 1); await noSpoiler()
  await action(audience, 'advance'); await story('clues2'); await action(audience, 'clues-yes'); await story('answer2')
  await submit('SEGUNDA FRASE INCOMPLETA', true); await settled('fail2')
  await checkGeometry('second-failure', 1920, 1080); await checkGeometry('second-failure', 1366, 768); await checkGeometry('second-failure', 390, 844); await size(audience,1920,1080)
  assert.equal((await progress()).attempts[1], 1)
  await action(audience, 'advance'); await story('truth')
  assert((await publicText()).includes('Cada clan guarda una parte del mensaje'))
  assert((await publicText()).includes(customFailure))
  await checkGeometry('cooperation-revelation', 1366, 768)
  const connection = await audience.evaluate('(()=>{const left=document.querySelector(".finale-stream-left"),right=document.querySelector(".finale-stream-right");return {left:Number(getComputedStyle(left).opacity),right:Number(getComputedStyle(right).opacity),joined:left.getBoundingClientRect().right>=right.getBoundingClientRect().left,leftColor:getComputedStyle(left).color,rightColor:getComputedStyle(right).color,leftStroke:getComputedStyle(document.querySelector(".finale-fracture-left")).stroke,rightStroke:getComputedStyle(document.querySelector(".finale-fracture-right")).stroke}})()')
  assert(connection.left>.2&&connection.right>.2&&connection.joined, 'Wu reveals a visible connection after the two sectors were extinguished')
  assert.equal(connection.leftStroke,connection.leftColor);assert.equal(connection.rightStroke,connection.rightColor)
  await action(audience, 'advance'); await story('captain')
  assert((await publicText()).includes(school.participants.find(p => p.id === school.teams[0].captainId).name))
  await checkGeometry('captain', 1920, 1080); await checkGeometry('captain', 1366, 768); await checkGeometry('captain', 390, 844)
  await action(audience, 'advance'); await story('joint'); await reduced()
  await submit('TODAVÍA INCOMPLETA', false, true); await settled('jointFail'); await screenshot(audience, 'joint-failure-390')
  await action(audience, 'retry'); await story('joint'); await wait(audience, 'document.activeElement?.id==="finale-public-proposal"')
  checks.push('second wrong attempt reveals the twist only then; first captain leads final act; joint errors stay cooperative with focus recovery')
  await size(audience, 1920, 1080); await reduced(false)
  await audience.evaluate('window.__ceremonySamples=[];new MutationObserver(()=>{const el=document.querySelector(".finale-stage");if(el)window.__ceremonySamples.push({at:performance.now(),classes:el.className})}).observe(document.querySelector(".finale-stage"),{attributes:true,attributeFilter:["class"]})')
  recording = true
  await audience.command('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: 1280, maxHeight: 720, everyNthFrame: 3 })
  await submit(answer)
  await wait(audience, '!!document.querySelector(".finale-phase-convergence")'); await screenshot(audience, 'convergence-1920', false)
  await wait(audience, '!!document.querySelector(".finale-phase-burst")'); await screenshot(audience, 'explosion-1920', false)
  await settled('victory'); await screenshot(audience, 'parchment-open-1920')
  await audience.command('Page.stopScreencast'); recording = false
  const samples = await audience.evaluate('window.__ceremonySamples')
  writeFileSync(new URL('motion.json', output), JSON.stringify({ frames, samples }, null, 2))
  assert(samples.some(s => s.classes.includes('finale-phase-opening')), 'opening phase occurred in the real render')
  assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'), shortSecret)
  const winningRun = (await progress()).runId
  assert.equal((await progress()).attempts[2], 2)
  for (const [width, height] of [[1920,1080], [1366,768], [390,844]]) await checkGeometry('parchment-short', width, height)
  checks.push('real GSAP climax, convergence, explosion, seal opening and open parchment; exact short configured secret in all three sizes')
  await action(admin, 'replay', true); await wait(admin, `(${progressExpression}).status==='revealing'`)
  await action(admin, 'restore', true); await settled('victory')
  assert.deepEqual((await progress()).attempts, [1,1,2]); assert.notEqual((await progress()).runId, winningRun)
  await action(admin, 'replay', true); await wait(admin, `(${progressExpression}).status==='revealing'`)
  const replayRun = (await progress()).runId
  await reload(audience); await settled('victory')
  assert.equal((await progress()).runId, replayRun)
  await action(admin, 'home', true); await wait(admin, '!!document.querySelector("dialog[open]")')
  await clickText(admin, 'Continuar', 'document.querySelector("dialog[open]")'); await wait(admin, `(${stateExpression}).sceneId==='intro'`)
  await showFinal(); await settled('victory')
  await restart(); assert.deepEqual((await progress()).attempts, [0,0,0]); await noSpoiler()
  assert.equal(await admin.evaluate('localStorage.getItem("ninja-profile-v2:colegio")'), schoolSaved)
  checks.push('restore cancels a replay without erasing victory or attempts; reload settles without replay; home preserves progress; confirmed restart resets only finale')
  await reduced(); await firstAnswer(); await submit(answer); await story('captain')
  assert.equal((await progress()).earlyCorrect, true)
  assert.equal((await progress()).attempts[1], 0)
  await screenshot(audience, 'early-correct-captain-390')
  await action(audience, 'advance'); await story('joint'); await submit(answer, true); await settled('victory')
  checks.push('unexpected individual correct answer is acknowledged truthfully, skips forced failures and reaches captain proclamation')
  const savedSchoolProgress = await progress()
  await changeProfile('urbanizacion'); await showFinal(); await story('intro'); await noSpoiler()
  await action(audience, 'advance'); await story('call1'); await roster(urban, 0)
  assert(!(await publicText()).includes(school.participants[0].name), 'Previous profile names are absent')
  await action(audience, 'advance'); await story('clues1'); await action(audience, 'clues-yes'); await story('answer1')
  await submit(answer); await story('captain'); await action(audience, 'advance'); await story('joint'); await submit(answer); await settled('victory')
  assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'), urban.finale.secret)
  await wait(audience, '!!document.querySelector(".finale-video-frame [role=status]")')
  await audience.evaluate('document.querySelector("audio")?.play().catch(()=>{})')
  await screenshot(audience, 'missing-local-media-390')
  await changeProfile('colegio'); await showFinal(); await settled('victory')
  assert.deepEqual(await progress(), savedSchoolProgress)
  checks.push('profiles remain independent; missing optional local video/audio preserve the parchment')
  await input(admin, '.finale-editor textarea', longSecret); await clickText(admin, 'Guardar cambios')
  await wait(admin, 'document.querySelector(".save-status").textContent.includes("Perfil guardado")'); await showFinal(); await story('intro')
  await firstAnswer(); await submit(answer); await story('captain'); await action(audience, 'advance'); await story('joint'); await submit(answer); await settled('victory')
  assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'), longSecret)
  await checkGeometry('parchment-long', 1920, 1080); await checkGeometry('parchment-long', 1366, 768); await checkGeometry('parchment-long', 390, 844)
  await audience.evaluate('(()=>{const el=document.querySelector(".finale-secret-copy");el.scrollTop=el.scrollHeight;document.querySelector(".finale-parchment").scrollIntoView({block:"end"})})()')
  const longReading = await audience.evaluate('(()=>{const el=document.querySelector(".finale-secret-copy");return {characters:el.textContent.length,client:el.clientHeight,scroll:el.scrollHeight,position:el.scrollTop,bottom:el.scrollTop+el.clientHeight>=el.scrollHeight-2}})()')
  assert.equal(longReading.bottom, true, 'The final paragraph can be reached without truncation')
  await screenshot(audience, 'parchment-long-bottom-390')
  await audience.command('Network.setBlockedURLs', { urls: ['*private-media/*.png*'] })
  await reload(audience); await settled('victory')
  assert.equal(await audience.evaluate('document.querySelector(".finale-secret-copy").textContent'), longSecret)
  await screenshot(audience, 'missing-art-reduced-motion-390')
  checks.push('long multi-paragraph secret remains exact with readable scroll and no horizontal overflow; missing artwork and reduced motion retain ceremony content')
  assert.deepEqual(runtimeErrors, []); assert.deepEqual(externalRequests, [])
  writeFileSync(new URL('motion.json', output), JSON.stringify({ frames, samples }, null, 2))
  writeFileSync(new URL('animation-review.html', output), `<!doctype html><meta charset="utf-8"><title>Hito 11.3 · ceremonia capturada</title><style>body{background:#07111c;color:#fff3d2;font:16px Arial;padding:24px}img{display:block;width:min(100%,1280px)}button{padding:12px}</style><h1>Convergencia · explosión · pergamino</h1><p>Fotogramas reales de Chrome con sus tiempos originales. No certifica FPS de un monitor.</p><button id="play">Reproducir captura</button><img id="frame" src="${frames[0]?.file || 'explosion-1920.png'}"><script>const frames=${JSON.stringify(frames)};document.querySelector('#play').onclick=()=>{if(!frames.length)return;const start=performance.now(),first=frames[0].time;function step(now){const frame=frames.findLast(f=>(f.time-first)*1000<=now-start)||frames[0];document.querySelector('#frame').src=frame.file;if(now-start<(frames.at(-1).time-first)*1000)requestAnimationFrame(step)}requestAnimationFrame(step)}</script>`)
  writeFileSync(new URL('qa.json', output), JSON.stringify({ browser: version.Browser, context: 'temporary isolated synthetic data; disposed; CDP active-page emulation for Windows occlusion', checks, geometry, longReading, phases: samples, motionFrames: frames.length, motionSeconds: frames.length ? frames.at(-1).time-frames[0].time : 0, runtimeErrors, externalRequests, missingMediaResponses: responses }, null, 2))
  console.log('PASS Hito 11.3 real Chrome: ' + checks.join('; '))
  console.log('Private evidence: ' + output.pathname)
} catch (error) {
  if (audience) await screenshot(audience, 'failure-debug-public', false).catch(() => {})
  if (admin) await screenshot(admin, 'failure-debug-admin', false).catch(() => {})
  writeFileSync(new URL('failure.json', output), JSON.stringify({ error: String(error), checks, runtimeErrors, externalRequests, responses, progress: admin ? await progress().catch(() => null) : null }, null, 2))
  throw error
} finally {
  await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {})
  socket.close(); for (const item of pending.values()) clearTimeout(item.timer)
}
