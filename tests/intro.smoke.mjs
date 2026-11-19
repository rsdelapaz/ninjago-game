// Chrome/CDP with synthetic profiles in a disposable context.
import assert from 'node:assert/strict'
import { createProfile } from '../src/profile.ts'
import { ceremonyColors, createCeremony } from '../src/ceremony.ts'

const base = new URL(process.env.SMOKE_URL || 'http://127.0.0.1:5173/')
const port = process.env.FINALE_CDP_PORT || '9224'
const version = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json()
const socket = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
let serial = 0
const pending = new Map()
const errors = [], external = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial
    const timer = setTimeout(() => { pending.delete(id); reject(Error(method + ' timed out')) }, 10000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
  if (message.method === 'Fetch.requestPaused') {
    const { request, requestId } = message.params
    const local = new URL(request.url).origin === base.origin
    if (!local) external.push(request.url)
    const method = local ? 'Fetch.continueRequest' : 'Fetch.failRequest'
    const params = local ? { requestId } : { requestId, errorReason: 'InternetDisconnected' }
    void send(method, params, message.sessionId).catch(error => errors.push(error.message))
  }
  if (message.method === 'Network.requestWillBeSent') {
    const url = new URL(message.params.request.url)
    if (/^https?:$/.test(url.protocol) && url.origin !== base.origin) external.push(url.href)
  }
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  clearTimeout(request.timer)
  if (message.error) request.reject(Error(JSON.stringify(message.error)))
  else request.resolve(message.result)
})
const { browserContextId } = await send('Target.createBrowserContext')
async function open(path, preload = '') {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const cmd = (method, params) => send(method, params, sessionId)
  await cmd('Page.enable')
  await cmd('Runtime.enable')
  await cmd('Network.enable')
  await cmd('Fetch.enable', { patterns: [{ urlPattern: 'http*://*/*' }] })
  if (preload) await cmd('Page.addScriptToEvaluateOnNewDocument', { source: preload })
  await cmd('Page.navigate', { url: new URL(path, base).href })
  const evaluate = async expression => {
    const result = await cmd('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      .catch(error => { throw Error(expression, { cause: error }) })
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  return Object.assign(evaluate, {
    activate: () => send('Target.activateTarget', { targetId }),
    close: () => send('Target.closeTarget', { targetId }),
    space: type => cmd('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32 }),
  })
}
async function wait(page, expression) {
  const deadline = Date.now() + 10000
  do {
    if (await page(expression)) return
    await new Promise(resolve => setTimeout(resolve, 40))
  } while (Date.now() < deadline)
  throw Error('Timed out: ' + expression)
}
const start = "document.querySelector('.start-button')"
const music = "document.querySelector('.intro-music button')"
const alert = "document.querySelector('.public-warning[role=alert]')"
const control = "localStorage.getItem('ninja-control-v3')"
const scene = "JSON.parse(" + control + ")?.sceneId"
const track = 'tracks.at(-1)'
const mock = `
globalThis.tracks = []
globalThis.rejectFirstPlay = true
globalThis.Audio = class extends EventTarget {
  constructor() { super(); this.paused = true; tracks.push(this) }
  async play() {
    if (rejectFirstPlay) {
      globalThis.rejectFirstPlay = false
      throw new DOMException('Autoplay denied by test double', 'NotAllowedError')
    }
    this.paused = false
  }
  pause() { this.paused = true }
  removeAttribute() { this.src = '' }
  load() {}
}
`
const config = createProfile('colegio')
config.participants = [{ id: 'test-a', name: 'Ninja A' }, { id: 'test-b', name: 'Ninja B' }]
config.teams.forEach((team, i) => {
  team.memberIds = [config.participants[i].id]
  team.captainId = team.memberIds[0]
})
const save = profile => "localStorage.setItem('ninja-profile-v2:colegio'," + JSON.stringify(JSON.stringify(profile)) + ")"
const initial = "localStorage.setItem('ninja-control-v3', JSON.stringify({profileId:'colegio',sceneId:'intro',revision:1,token:'test'}))"
try {
  const chooser = await open('./', mock)
  await wait(chooser, '!!document.querySelector("button")')
  assert.equal(await chooser('tracks.length'), 0)
  assert.equal(await chooser(music), null)
  await chooser.close()

  const admin = await open('?screen=admin', mock + initial)
  await wait(admin, "!!document.querySelector('[data-module=presentation]')")
  const audience = await open('./', mock)
  await wait(audience, music + '?.textContent.trim() === "Activar música"')
  await audience(music + '.click()')
  await wait(audience, music + '?.textContent.trim() === "Silenciar música"')
  assert.deepEqual(await audience('tracks.map(t => [t.paused,t.volume,t.loop,t.src])'), [[false, 0.3, true, new URL('private-media/intro-theme.mp3', base).pathname]])
  const before = await audience(control)
  await audience.activate()
  await audience(start + '.focus()')
  await audience.space('rawKeyDown')
  await audience.space('keyUp')
  await wait(audience, alert + ' === document.activeElement')
  assert.match(await audience(alert + '.textContent'), /^La aventura aún no está preparada\./)
  assert.equal(await audience(control), before)
  assert.equal(await audience("!!document.querySelector('.is-transitioning') || " + track + '.paused'), false)
  await audience(save(config))
  await admin("document.querySelector('[data-module=presentation]').click()")
  const next = "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Siguiente →'))"
  await wait(admin, next + '?.matches(":enabled")')
  await admin(next + '.click()')
  await wait(audience, scene + ' === "ceremony" && !document.querySelector(".intro-music")')
  assert.equal(await audience('tracks.every(t => t.paused && !t.src)'), true)
  assert.equal(await admin('tracks.length'), 0)
  const previous = "[...document.querySelectorAll('button')].find(b => b.textContent.trim() === '← Anterior')"
  await wait(admin, previous + '?.matches(":enabled")')
  await admin(previous + '.click()')
  await wait(audience, music + '?.textContent.trim() === "Silenciar música"')
  assert.deepEqual(await audience('tracks.map(t => t.paused)'), [true, false])
  await audience(music + '.click()')
  assert.equal(await audience(track + '.paused'), true)
  await audience(music + '.click()')
  await wait(audience, '!' + track + '.paused')
  await audience(start + '.click()')
  assert.equal(await audience(track + '.paused'), true)
  await wait(audience, scene + ' === "ceremony"')
  await wait(admin, previous + '?.matches(":enabled")')
  await admin(previous + '.click()')
  await wait(audience, scene + ' === "intro"')

  const invalid = structuredClone(config)
  invalid.teams[0].captainId = null
  // Hold the real browser lock until the public click has passed its early check.
  await admin(`void navigator.locks.request('ninja-local-write', async () => {
    await new Promise(resolve => { globalThis.releaseStartTest = resolve })
    ${save(invalid)}
  })`)
  await wait(admin, 'typeof globalThis.releaseStartTest === "function"')
  await wait(audience, start + '?.matches(":enabled")')
  const beforeRace = await audience(control)
  await audience(start + '.click()')
  await admin('globalThis.releaseStartTest()')
  await wait(audience, alert + ' === document.activeElement')
  assert.match(await audience(alert + '.textContent'), /^No se ha podido comenzar/)
  assert.equal(await audience(control), beforeRace)
  await admin(save(config))

  // Native audio element with an intentionally unreachable URL, even when a real MP3 is installed.
  const missing = await open('./', `
    const NativeAudio = Audio
    globalThis.Audio = class extends NativeAudio {
      set src(_) { super.src = '/private-media/__missing-intro-smoke__.mp3' }
    }
  `)
  await wait(missing, "document.querySelector('.intro-music [role=status]')?.textContent === 'Música no disponible'")
  await missing(start + '.click()')
  await wait(missing, scene + ' === "ceremony"')
  await missing.close()

  // Check that the existing video scene keeps its native controls and local source.
  config.teams.forEach((team, i) => { team.name = 'Clan ' + i; team.color = ceremonyColors[i].hex })
  const ceremony = { ...createCeremony('colegio'), phase: 'complete', confirmedColors: [true, true], confirmedNames: [true, true] }
  await admin(save(config) + ";localStorage.setItem('ninja-ceremony-v1:colegio'," + JSON.stringify(JSON.stringify(ceremony)) + ");localStorage.setItem('ninja-control-v3',JSON.stringify({profileId:'colegio',sceneId:'wu',revision:Date.now()+100,token:'wu'}))")
  await wait(audience, "!!document.querySelector('video, .message-placeholder')")
  const video = await audience("document.querySelector('video')?.controls === true")
  if (video) assert.equal(await audience("document.querySelector('video').src"), new URL('private-media/colegio/master-wu.mp4', base).href)
  assert.equal(await audience('tracks.every(t => t.paused && !t.src)'), true)
  assert.deepEqual(errors, [])
  assert.deepEqual(external, [])
  console.log('Selector, portada, bloqueo simulado, activación, ausencia nativa, foco, concurrencia, navegación y pausa aprobados. Vídeo: ' + (video ? 'fuente local y controles nativos' : 'respaldo sin medio reproducible'))
} finally {
  await send('Target.disposeBrowserContext', { browserContextId })
  socket.close()
}
