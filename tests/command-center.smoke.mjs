// Requires Chromium/Edge with --remote-debugging-port=9223 and a local preview server.
// Uses a fresh browser context; never clears the organizer's real storage.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createConfig } from '../src/session.ts'
const base = process.env.SMOKE_URL || 'http://127.0.0.1:4173'
mkdirSync(new URL('../.preview.local/', import.meta.url), { recursive: true })
const version = await (await fetch('http://127.0.0.1:9223/json/version')).json()
const socket = new WebSocket(version.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let sequence = 0
const pending = new Map(), errors = [], external = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
socket.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data)
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result) }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text)
  if (m.method === 'Page.javascriptDialogOpening') void send('Page.handleJavaScriptDialog', { accept: true }, m.sessionId)
  if (m.method === 'Fetch.requestPaused') {
    const local = new URL(m.params.request.url).origin === new URL(base).origin
    if (!local) external.push(m.params.request.url)
    void send(local ? 'Fetch.continueRequest' : 'Fetch.failRequest', local ? { requestId: m.params.requestId } : { requestId: m.params.requestId, errorReason: 'InternetDisconnected' }, m.sessionId)
  }
})
const { browserContextId } = await send('Target.createBrowserContext')
async function page(url, noChannel = false) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const c = (m, p = {}) => send(m, p, sessionId)
  const e = async expression => {
    if (expression.trimStart().startsWith('const ')) expression = `(() => { ${expression} })()`
    const r = await c('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true })
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails))
    return r.result.value
  }
  const wait = async expression => {
    for (let i = 0; i < 100; i++) { if (await e(expression)) return; await new Promise(r => setTimeout(r, 100)) }
    throw Error(`Timeout: ${expression}`)
  }
  await c('Page.enable'); await c('Runtime.enable')
  await c('Fetch.enable', { patterns: [{ urlPattern: 'http*', requestStage: 'Request' }] })
  if (noChannel) await c('Page.addScriptToEvaluateOnNewDocument', { source: 'window.BroadcastChannel = undefined' })
  await c('Page.navigate', { url }); await wait('!!document.querySelector("main")')
  const click = text => e(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`)
  const reload = async () => { await e('window.__smokePreviousDocument = true'); await c('Page.reload'); await wait('!window.__smokePreviousDocument && !!document.querySelector("main")') }
  return { c, e, wait, click, reload }
}
try {
  const admin = await page(base + '/?screen=admin')
  await admin.wait('!!document.querySelector(".profile-chooser") && !!localStorage.getItem("ninja-profile-v2:urbanizacion")')
  assert.equal(await admin.e('localStorage.getItem("ninja-control-v3")'), null)
  for (const id of ['colegio','urbanizacion']) {
    const p=await admin.e('JSON.parse(localStorage.getItem('+JSON.stringify('ninja-profile-v2:'+id)+'))')
    assert.equal(p.teams.length,2);assert(p.teams.every(t=>t.name===null&&t.color===null&&t.memberIds.length===0&&t.suggestedNames.length===3))
  }
  await admin.c('Emulation.setFocusEmulationEnabled', { enabled: true })
  await admin.e('document.querySelector(".profile-options button").focus()')
  await admin.c('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
  await admin.c('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await admin.wait('!!document.querySelector(".command-center")')
  const module = async id => { await admin.e(`document.querySelector('[data-module="${id}"]').click()`); await new Promise(r=>setTimeout(r,80)) }
  const getConfig = id => admin.e('JSON.parse(localStorage.getItem('+JSON.stringify('ninja-profile-v2:'+id)+'))')
  const switchProfile = async id => {
    await admin.e('const selector=document.querySelector(".active-profile select");selector.value='+JSON.stringify(id)+';selector.dispatchEvent(new Event("change",{bubbles:true}))')
    await admin.wait('document.querySelector(".active-profile select").value === '+JSON.stringify(id))
  }
  await admin.e('document.querySelector(".active-profile select").focus()')
  await admin.c('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  await admin.c('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  assert.equal(await admin.e('document.activeElement.classList.contains("open-public")'), true)
  await admin.e('document.querySelector("[data-module=participants]").focus()')
  await admin.c('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  await admin.c('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  await admin.wait('!!document.querySelector("#participants-title")')
  await module('overview')
  for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844]]) {
    await admin.c('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
    await admin.e('window.scrollTo(0,0)')
    assert.equal(await admin.e('document.documentElement.scrollWidth <= innerWidth'),true)
    const {data}=await admin.c('Page.captureScreenshot',{format:'png'})
    writeFileSync(new URL('../.preview.local/profiles-overview-'+width+'.png',import.meta.url),Buffer.from(data,'base64'))
    for(const id of ['participants','teams','media','presentation','settings']) {
      await module(id);assert.equal(await admin.e('document.documentElement.scrollWidth <= innerWidth'),true,'overflow '+id+' '+width)
      if ((width === 1920 || width === 390) && ['teams','presentation'].includes(id)) {
        await admin.e('window.scrollTo(0,0)')
        const {data}=await admin.c('Page.captureScreenshot',{format:'png'})
        writeFileSync(new URL(`../.preview.local/profiles-${id}-${width}.png`,import.meta.url),Buffer.from(data,'base64'))
      }
    }
    await module('overview')
  }
  await admin.c('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false})
  await admin.reload();await admin.wait('!!document.querySelector(".command-center")')
  assert.equal(await admin.e('document.querySelector(".active-profile select").value'),'colegio')
  const publicPage=await page(base+'/')
  await publicPage.wait('!!document.querySelector(".start-button")')
  assert((await publicPage.e('document.querySelector(".key-art").getAttribute("src")')).includes('/colegio/'))
  await module('participants')
  for(let i=1;i<=7;i++) {
    await admin.e('const input=document.querySelector("#participants-title").parentElement.querySelector("form input");input.value="Participante de prueba '+i+'";input.dispatchEvent(new Event("input",{bubbles:true}));input.form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
    await new Promise(r=>setTimeout(r,20))
  }
  await admin.click('Guardar cambios')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).participants.length === 7')
  assert.equal((await getConfig('colegio')).participants.length,7)
  await module('teams')
  // Direct multi-selection and captain transfer, before the explicit random draw.
  await admin.e('document.querySelectorAll(".add-ninjas")[0].click()')
  await admin.e('Array.from(document.querySelectorAll(".member-options input")).slice(0,3).forEach(input=>input.click())')
  await admin.click('Confirmar 3 integrantes')
  await admin.e('document.querySelector(".team-member-list button").click()')
  await admin.e('document.querySelectorAll(".add-ninjas")[1].click()')
  await admin.e('document.querySelectorAll(".candidate-group")[1].querySelector("input").click()')
  await admin.click('Confirmar 1 integrante')
  assert.equal(await admin.e('document.querySelectorAll(".captain-chip").length'),0)
  await admin.click('Guardar cambios')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).teams[1].memberIds.length === 1')
  await admin.e('const mode=document.querySelector(".teams-module select");mode.value="automatic";mode.dispatchEvent(new Event("change",{bubbles:true}))')
  await admin.click('Sortear y guardar reparto')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).assignmentMode === "automatic"')
  let saved=await getConfig('colegio')
  assert.equal(saved.assignmentMode,'automatic');assert.equal(Math.abs(saved.teams[0].memberIds.length-saved.teams[1].memberIds.length),1)
  await admin.reload();await admin.wait('!!document.querySelector(".command-center")')
  assert.deepEqual(await getConfig('colegio'),saved)
  // Prepare captains and per-team proposals using only dashboard controls.
  await module('teams')
  for (let i=0;i<2;i++) {
    await admin.e(`const panel=document.querySelectorAll('.team-panel')[${i}];const captain=panel.querySelector('select');captain.value=${JSON.stringify(saved.teams[i].memberIds[0])};captain.dispatchEvent(new Event('change',{bubbles:true}));const proposals=panel.querySelector('textarea');proposals.value=${JSON.stringify(i?'Llamas\nVientos':'Llamas\nRayos')};proposals.dispatchEvent(new Event('input',{bubbles:true}))`)
  }
  await admin.click('Guardar cambios')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).teams.every(t=>!!t.captainId)')
  await module('presentation')
  // START GAME is the real entrance. Controls stay in the organizer window.
  await publicPage.e('document.querySelector(".start-button").click()')
  await publicPage.wait('!!document.querySelector(".ceremony-stage")')
  await admin.wait('!!document.querySelector(".ceremony-controls")')
  assert.equal(await publicPage.e('document.querySelectorAll(".ceremony-stage button").length'),0)
  await publicPage.c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  const phase=async expected=>{
    await admin.wait(`JSON.parse(localStorage.getItem('ninja-ceremony-v1:colegio')).phase === ${JSON.stringify(expected)}`)
    await new Promise(r=>setTimeout(r,100))
  }
  const capture=async label=>{
    for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844]]) {
      await publicPage.c('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
      assert.equal(await publicPage.e('document.documentElement.scrollWidth <= innerWidth'),true,'ceremony overflow '+label+' '+width)
      if(width >= 1366) {
        assert.equal(await publicPage.e('document.documentElement.scrollHeight <= innerHeight + 1'),true,'desktop vertical overflow '+label+' '+width)
        assert.equal(await publicPage.e('Array.from(document.querySelectorAll(".ninja-name,.name-revelation h2")).every(n=>n.getBoundingClientRect().bottom <= innerHeight && n.getBoundingClientRect().top >= 0)'),true,'hidden names '+label)
      }
      await new Promise(r=>setTimeout(r,100))
      const {cssContentSize:size}=await publicPage.c('Page.getLayoutMetrics')
      const {data}=await publicPage.c('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:size.width,height:size.height,scale:1}})
      writeFileSync(new URL(`../.preview.local/ceremony-${label}-${width}.png`,import.meta.url),Buffer.from(data,'base64'))
    }
    await publicPage.c('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false})
  }
  await capture('arrival')
  const prepared=await getConfig('colegio')
  const captainNames=prepared.teams.map(t=>prepared.participants.find(p=>p.id===t.captainId).name)
  assert.deepEqual(await publicPage.e('Array.from(document.querySelectorAll(".ninja-roster")).map(l=>l.firstElementChild.querySelector(".ninja-name").textContent)'),captainNames)
  await admin.click('Avanzar fase →');await phase('color-1');await capture('color')
  await admin.e('document.querySelector(".ceremony-controls .command-row button").click()')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-ceremony-v1:colegio")).confirmedColors[0]')
  await admin.click('Avanzar fase →');await phase('name-1');await capture('name')
  await admin.click('NO · Siguiente propuesta')
  await publicPage.wait('document.querySelector(".name-revelation h2").textContent === "Rayos"')
  await admin.click('SÍ · Aceptar nombre')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).teams[0].name === "Rayos"')
  await capture('accepted')
  await admin.reload();await admin.wait('!!document.querySelector(".command-center")');await module('presentation')
  await phase('name-1')
  await admin.click('Avanzar fase →');await phase('color-2')
  assert.equal(await publicPage.e('document.querySelectorAll(".element-choice").length'),2)
  await admin.e('document.querySelector(".ceremony-controls .command-row button").click()')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-ceremony-v1:colegio")).confirmedColors[1]')
  await admin.click('Avanzar fase →');await phase('name-2')
  await admin.click('NO · Siguiente propuesta');await publicPage.wait('document.querySelector(".name-revelation h2").textContent === "Vientos"')
  await admin.click('NO · Siguiente propuesta');await admin.wait('!!document.querySelector(".ceremony-controls form")')
  await publicPage.wait('!!document.querySelector(".empty-scroll")');await capture('exhausted')
  await admin.e('const input=document.querySelector(".ceremony-controls form input");input.value="Tormentas";input.dispatchEvent(new Event("input",{bubbles:true}))')
  await admin.click('Confirmar nombre manual')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).teams[1].name === "Tormentas"')
  await admin.click('Avanzar fase →');await phase('ready');await capture('final')
  saved=await getConfig('colegio')
  assert.notEqual(saved.teams[0].color,saved.teams[1].color)
  await admin.click('← Fase anterior');await phase('name-2')
  assert.deepEqual(await getConfig('colegio'),saved)
  await admin.click('Avanzar fase →');await phase('ready')
  await admin.click('Continuar al mensaje de Wu →');await publicPage.wait('!!document.querySelector(".encounter")')
  assert((await publicPage.e('document.querySelector("video").getAttribute("src")')).includes('/colegio/'))
  await admin.click('← Anterior');await publicPage.wait('!!document.querySelector(".ceremony-finale")')
  await admin.e('document.querySelector(".scene-catalogue").open = true')
  await admin.e('const n=document.querySelector(".scene-list input[type=number]");n.value="3";n.dispatchEvent(new Event("input",{bubbles:true}))')
  await admin.click('Mostrar número');await publicPage.wait('!!document.querySelector(".encounter")')
  await admin.e('document.querySelector(".scene-card").click()')
  assert.equal(await publicPage.e('!!document.querySelector(".encounter")'),true)
  await admin.click('Mostrar esta escena');await publicPage.wait('!!document.querySelector(".start-button")')
  await admin.click('Siguiente →');await publicPage.wait('!!document.querySelector(".ceremony-stage")')
  await switchProfile('urbanizacion');await publicPage.wait('!!document.querySelector(".start-button")')
  assert.equal((await getConfig('urbanizacion')).participants.length,0)
  assert((await publicPage.e('document.querySelector(".key-art").getAttribute("src")')).includes('/urbanizacion/'))
  // Per-profile drafts survive a switch without leaking into another profile.
  await switchProfile('colegio');await module('participants')
  await admin.e('const field=document.querySelector(".participant-row input");field.value="Borrador de prueba";field.dispatchEvent(new Event("input",{bubbles:true}))')
  await switchProfile('urbanizacion');await switchProfile('colegio')
  assert.equal(await admin.e('document.querySelector(".participant-row input").value'),'Borrador de prueba')
  await admin.click('Descartar borrador…')
  await module('settings')
  await admin.e('const original=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.exportedConfigText=blob.text();return original(blob)}')
  await admin.click('Exportar perfil JSON')
  const exported=await admin.e('window.exportedConfigText')
  assert.deepEqual(JSON.parse(exported),saved);assert.equal('sceneId' in JSON.parse(exported),false)
  await switchProfile('urbanizacion')
  const path=new URL('../.preview.local/profile-import.json',import.meta.url);writeFileSync(path,exported)
  const {root}=await admin.c('DOM.getDocument');const {nodeId}=await admin.c('DOM.querySelector',{nodeId:root.nodeId,selector:'input[type=file]'})
  const {fileURLToPath}=await import('node:url');await admin.c('DOM.setFileInputFiles',{nodeId,files:[fileURLToPath(path)]})
  await admin.wait('!!document.querySelector(".import-preview")')
  assert.equal((await getConfig('urbanizacion')).participants.length,0)
  await admin.click('Reemplazar perfil activo…')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:urbanizacion")).participants.length === 7')
  const imported=await getConfig('urbanizacion');assert.deepEqual(imported.teams,saved.teams);assert.deepEqual(imported.participants,saved.participants)
  assert.deepEqual(await getConfig('colegio'),saved)
  // Explicit recovery never deletes old configuration or old progress.
  const old=createConfig();old.participants=[{id:'legacy-synthetic',name:'Prueba de migración'}];old.teams[0].memberIds=['legacy-synthetic']
  const oldRaw=JSON.stringify(old), oldKey='ninja-config-v1:'+old.id
  await admin.e(`localStorage.setItem(${JSON.stringify(oldKey)},${JSON.stringify(oldRaw)});localStorage.setItem('ninja-presentation-v2',JSON.stringify({scene:'wu',sessionId:'legacy-test',revision:1}))`)
  await admin.reload();await admin.wait('!!document.querySelector(".command-center")');await module('settings')
  await admin.e('const s=document.querySelector(".transfer-module select");s.value='+JSON.stringify(oldKey)+';s.dispatchEvent(new Event("change",{bubbles:true}))')
  await admin.click('Previsualizar conversión');await admin.wait('!!document.querySelector(".import-preview")')
  await admin.click('Reemplazar perfil activo…')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:urbanizacion")).participants[0]?.id === "legacy-synthetic"')
  assert.equal(await admin.e('localStorage.getItem('+JSON.stringify(oldKey)+')'),oldRaw)
  assert.equal((await getConfig('urbanizacion')).participants[0].id,'legacy-synthetic')
  assert.deepEqual(await getConfig('colegio'),saved)
  await switchProfile('colegio')
  const fallback=await page(base+'/',true)
  await module('presentation')
  await admin.e('const n=document.querySelector(".scene-list input[type=number]");n.value="3";n.dispatchEvent(new Event("input",{bubbles:true}))')
  await admin.click('Mostrar número');await fallback.wait('!!document.querySelector(".encounter")')
  await fallback.c('Network.enable');await fallback.c('Network.setBlockedURLs',{urls:['*colegio/master-wu.mp4','*colegio/ninjago-key-art.png']})
  await fallback.reload();await fallback.wait('!!document.querySelector(".message-placeholder") && !document.querySelector(".key-art")')
  assert.equal(await fallback.e('!!document.querySelector(".landscape")'),true)
  await admin.e('document.querySelector(".scene-card").click()');await admin.click('Mostrar esta escena');await fallback.wait('!!document.querySelector(".start-button")')
  assert.equal(await fallback.e('document.querySelector(".public-profile").textContent.includes("Colegio")'),true)
  // Reset only the synthetic active profile; export first, require explicit acknowledgement, reload.
  const untouched=await getConfig('urbanizacion')
  await module('settings');await admin.click('Restablecer perfil a su estado inicial')
  assert.equal(await admin.e('document.querySelector(".confirm-reset").disabled'),true)
  await admin.click('Exportar configuración guardada antes de restablecer')
  assert.deepEqual(JSON.parse(await admin.e('window.exportedConfigText')),saved)
  await admin.e('document.querySelector(".reset-ack input").click()')
  await admin.click('Sí, restablecer Colegio')
  await admin.wait('JSON.parse(localStorage.getItem("ninja-profile-v2:colegio")).participants.length === 0')
  await fallback.wait('!!document.querySelector(".start-button")')
  const initial=await getConfig('colegio')
  assert(initial.teams.every(t=>t.name===null&&t.color===null&&t.captainId===null&&t.memberIds.length===0&&t.suggestedNames.length===3))
  assert.deepEqual(await getConfig('urbanizacion'),untouched)
  assert.equal(await admin.e('JSON.parse(localStorage.getItem("ninja-control-v3")).sceneId'),'intro')
  await admin.reload();await admin.wait('!!document.querySelector(".command-center")')
  assert.deepEqual(await getConfig('colegio'),initial)
  assert.equal(await admin.e('localStorage.getItem('+JSON.stringify(oldKey)+')'),oldRaw)
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  console.log('PASS profiles and ceremony: captain preparation, START GAME, all ceremony phases, two distinct colors, name yes/no/manual, reload/back recovery, final teams and Wu; isolated configs/drafts/media, JSON, legacy migration, scene catalogue, storage fallback, 4 responsive sizes, no JS exceptions/external requests. Screenshots: .preview.local/ceremony-{arrival,color,name,final}-*.png')
} finally {
  await send('Target.disposeBrowserContext',{browserContextId});socket.close()
}
