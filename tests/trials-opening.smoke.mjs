import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createProfile } from '../src/profile.ts'
import { createCeremony, ceremonyColors } from '../src/ceremony.ts'
import { newChallenge } from '../src/challenges.ts'

const base = new URL(process.env.SMOKE_URL || 'http://127.0.0.1:5173/')
const port = process.env.FINALE_CDP_PORT || '9224'
const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const socket = new WebSocket(info.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
let id = 0
const pending = new Map(), errors = [], external = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const requestId = ++id
    const timer = setTimeout(() => { pending.delete(requestId); reject(Error(method + ' timed out')) }, 15000)
    pending.set(requestId, { resolve, reject, timer })
    socket.send(JSON.stringify({ id: requestId, method, params, sessionId }))
  })
}
socket.addEventListener('message', ({ data }) => {
  const event = JSON.parse(data)
  if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails)
  if (event.method === 'Network.requestWillBeSent') {
    const url = new URL(event.params.request.url)
    if (/^https?:$/.test(url.protocol) && url.origin !== base.origin) external.push(url.href)
  }
  const request = pending.get(event.id)
  if (!request) return
  pending.delete(event.id)
  clearTimeout(request.timer)
  if (event.error) request.reject(Error(JSON.stringify(event.error)))
  else request.resolve(event.result)
})
const { browserContextId } = await send('Target.createBrowserContext')
async function open(path, preload = '') {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const cmd = (method, params) => send(method, params, sessionId)
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable')
  if (preload) await cmd('Page.addScriptToEvaluateOnNewDocument', { source: preload })
  await cmd('Page.navigate', { url: new URL(path, base).href })
  return {
    cmd, activate: () => send('Target.activateTarget', { targetId }),
    async eval(expression, userGesture = false) {
      const result = await cmd('Runtime.evaluate', { expression, returnByValue: true, userGesture })
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
      return result.result.value
    },
  }
}
async function wait(page, expression, timeout = 10000) {
  const deadline = Date.now() + timeout
  do {
    if (await page.eval(expression)) return
    await new Promise(resolve => setTimeout(resolve, 45))
  } while (Date.now() < deadline)
  throw Error('Timed out: ' + expression)
}
const config = createProfile('colegio')
config.participants = [{ id: 'a', name: 'Ninja A' }, { id: 'b', name: 'Ninja B' }]
config.teams.forEach((team, i) => Object.assign(team, {
  name: i ? 'Tormentas' : 'Dragones', color: ceremonyColors[i].hex, memberIds: [config.participants[i].id], captainId: config.participants[i].id,
}))
const trial = { ...newChallenge(), title: 'La primera prueba visible' }
config.challenges = [{ ...newChallenge(), title: 'Prueba oculta', visible: false }, trial]
const ceremony = { ...createCeremony(config.id), phase: 'complete', confirmedColors: [true, true], confirmedNames: [true, true] }
const seed = Object.entries({
  'ninja-profile-v2:colegio': config,
  'ninja-ceremony-v1:colegio': ceremony,
  'ninja-control-v3': { profileId: config.id, sceneId: 'wu', revision: 1, token: 'trials-smoke' },
}).map(([key, value]) => `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(JSON.stringify(value))});`).join('')
const stage = "document.querySelector('main.trials-opening')"
const next = "[...document.querySelectorAll('button')].find(button => button.textContent.includes('Siguiente →'))"
const visibleAction = "getComputedStyle(document.querySelector('.trials-action')).opacity === '1'"
const output = new URL('../.preview.local/despertar-pruebas/', import.meta.url)
try {
  const admin = await open('?screen=admin', seed)
  const audience = await open('./')
  await audience.activate()
  await wait(audience, '!!document.querySelector(".video-scene video")')
  await wait(admin, '!!document.querySelector("[data-module=presentation]")')
  await admin.eval('document.querySelector("[data-module=presentation]").click()')
  const card = "[...document.querySelectorAll('.scene-card')].find(button => button.textContent.includes('El despertar de las pruebas'))"
  await wait(admin, '!!' + card)
  await admin.eval(card + '.click()')
  await wait(admin, '!!document.querySelector(".trials-preview")')
  assert.equal(await admin.eval('document.querySelector(".trials-preview").querySelector("button") === null'), true)
  assert.equal(await audience.eval('!!' + stage), false)
  await audience.eval(`(() => {
    const video = document.querySelector('video')
    const finish = () => {
      video.currentTime = Math.max(0, video.duration - .3)
      void video.play().catch(() => {})
    }
    if (video.readyState) finish()
    else video.addEventListener('loadedmetadata', finish, { once: true })
  })()`, true)
  let nativeEnd = true
  try { await wait(audience, '!!' + stage, 5000) }
  catch {
    nativeEnd = false
    await audience.eval("document.querySelector('video').dispatchEvent(new Event('ended'))")
    await wait(audience, '!!' + stage)
  }
  assert.equal(await audience.eval('!!document.querySelector("video")'), false)
  await wait(admin, card + '?.getAttribute("aria-current") === "step"')
  const timing = await audience.eval(`[...document.querySelector('.trials-action').getAnimations()].map(a => a.effect.getComputedTiming().endTime)`)
  assert(timing.some(end => end >= 3000 && end <= 6000))
  await wait(audience, visibleAction)
  mkdirSync(output, { recursive: true })
  for (const [width, height] of [[1920,1080], [1366,768], [1280,720]]) {
    await audience.cmd('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    await wait(audience, `innerWidth===${width} && innerHeight===${height} && document.documentElement.scrollHeight<=innerHeight`)
    assert(await audience.eval("[...document.querySelectorAll('.trials-title, .trials-continue, .trials-audio button')].every(el => {const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight})"))
    assert(await audience.eval('document.querySelector(".trials-title").scrollWidth <= document.querySelector(".trials-title").clientWidth'))
    const { data } = await audience.cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    writeFileSync(new URL(`despertar-${width}x${height}.png`, output), Buffer.from(data, 'base64'))
  }
  await audience.eval('document.querySelector(".trials-audio button").click()', true)
  await wait(audience, 'document.querySelector(".trials-audio button").getAttribute("aria-pressed")==="true"')
  await audience.eval('document.querySelector(".trials-audio button").click()')
  assert.equal(await audience.eval('document.querySelector(".trials-audio button").getAttribute("aria-pressed")'), 'false')
  await audience.cmd('Page.addScriptToEvaluateOnNewDocument', { source: 'globalThis.AudioContext = undefined' })
  await audience.cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await audience.cmd('Page.reload')
  await wait(audience, '!!' + stage)
  await wait(audience, visibleAction)
  assert.equal(await audience.eval("document.querySelector('.trials-action').getAnimations().length"), 0)
  await audience.eval('document.querySelector(".trials-audio button").click()')
  await wait(audience, '!!document.querySelector(".trials-audio [role=status]")')
  await audience.activate()
  await audience.eval('document.querySelector(".trials-continue").focus()')
  for (const type of ['rawKeyDown','keyUp']) await audience.cmd('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  const trialScene = `JSON.parse(localStorage.getItem('ninja-control-v3'))?.sceneId===${JSON.stringify('challenge:' + trial.id)}`
  await wait(audience, trialScene)
  await wait(admin, 'document.querySelector(".scene-card[aria-current=step]")?.textContent.includes("La primera prueba visible")')
  await admin.eval(card + '.click()')
  await admin.eval('[...document.querySelectorAll("button")].find(button => button.textContent.trim() === "Mostrar esta escena").click()')
  await wait(audience, '!!' + stage)
  await admin.eval(next + '.click()')
  await wait(audience, trialScene)
  assert.deepEqual(errors, [])
  assert.deepEqual(external, [])
  console.log(`Chrome: ${nativeEnd ? 'fin nativo del vídeo' : 'evento ended simulado'}, tres resoluciones, audio, fallo de audio, teclado, recarga y control desde ambas ventanas.`)
} finally {
  await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {})
  socket.close()
}
