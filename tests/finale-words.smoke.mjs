import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createProfile } from '../src/profile.ts'
import { createFinaleProgress } from '../src/finale.ts'
import { finaleWords } from '../src/finaleWords.ts'

const base = new URL(process.env.SMOKE_URL || 'http://127.0.0.1:5173/')
const port = process.env.FINALE_CDP_PORT || '9224'
const browser = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json()
const socket = new WebSocket(browser.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
const pending = new Map(), errors = [], external = []
let serial = 0
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial
    const timeout = setTimeout(() => { pending.delete(id); reject(Error(method + ' timed out')) }, 15000)
    pending.set(id, { resolve, reject, timeout })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
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
  clearTimeout(request.timeout)
  if (event.error) request.reject(Error(JSON.stringify(event.error)))
  else request.resolve(event.result)
})
const { browserContextId } = await send('Target.createBrowserContext')
async function open(path, seed = '') {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const cmd = (method, params) => send(method, params, sessionId)
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable')
  if (seed) await cmd('Page.addScriptToEvaluateOnNewDocument', { source: seed })
  await cmd('Page.navigate', { url: new URL(path, base).href })
  return {
    cmd, activate: () => send('Target.activateTarget', { targetId }),
    async eval(expression) {
      const result = await cmd('Runtime.evaluate', { expression, returnByValue: true })
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
      return result.result.value
    },
  }
}
async function wait(page, expression) {
  const deadline = Date.now() + 10000
  do {
    if (await page.eval(expression)) return
    await new Promise(resolve => setTimeout(resolve, 50))
  } while (Date.now() < deadline)
  throw Error('Timed out: ' + expression)
}
const config = createProfile('colegio')
const answer = 'Un ninja en solitario es muy fuerte, pero juntos son invencibles'
config.finale = { answer, secret: 'Inscripción sintética que solo aparece tras ganar.', videoFilename: '', audioFilename: '', failureMessage: '' }
config.participants = [{ id: 'captain-a', name: 'Ninja A' }, { id: 'captain-b', name: 'Ninja B' }]
config.teams.forEach((team, i) => Object.assign(team, { name: 'Clan de prueba ' + i, color: i ? '#359bdb' : '#e34b42', memberIds: [config.participants[i].id], captainId: config.participants[i].id }))
const finale = { ...createFinaleProgress(config.finale), ceremonyPhase: 'truth', attempts: [1, 1, 0] }
const seed = Object.entries({
  'ninja-profile-v2:colegio': config,
  'ninja-control-v3': { profileId: 'colegio', sceneId: 'finale', revision: 1, token: 'words-smoke', finales: { colegio: finale } },
}).map(([key, value]) => `localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(JSON.stringify(value))});`).join('')
const words = "[...document.querySelectorAll('.word-tile')].map(tile => tile.textContent.trim())"
const phase = "document.querySelector('.finale-stage')?.dataset.storyPhase"
const advance = "document.querySelector('[data-action=advance]')"
const output = new URL('../.preview.local/palabras-del-destino/', import.meta.url)
try {
  const admin = await open('?screen=admin', seed)
  const audience = await open('./')
  await wait(audience, phase + '==="truth"')
  assert.deepEqual(await audience.eval(words), [])
  assert.equal(await audience.eval(`document.body.textContent.includes(${JSON.stringify(config.finale.secret)})`), false)
  await audience.eval(advance + '.click()')
  await wait(audience, phase + '==="captain"')
  assert.deepEqual(await audience.eval(words), [])
  await audience.eval(advance + '.click()')
  await wait(audience, phase + '==="words"')
  const initial = await audience.eval(words)
  const correct = finaleWords(answer)
  assert.deepEqual([...initial].sort(), [...correct].sort())
  assert(initial.every((word, index) => word !== correct[index]))
  assert.equal(await audience.eval('!!document.querySelector(".finale-response")'), false)

  await audience.activate()
  await wait(audience, "getComputedStyle(document.querySelector('.finale-dialogue')).opacity==='1' && getComputedStyle(document.querySelector('.finale-dialogue-lines p')).opacity==='1'")
  mkdirSync(output, { recursive: true })
  for (const [width, height] of [[1920, 1080], [1366, 768], [1280, 720]]) {
    await audience.cmd('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    await wait(audience, `innerWidth===${width} && innerHeight===${height}`)
    try {
      await wait(audience, 'document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight')
    } catch (error) {
      const measured = await audience.eval(`[innerWidth, innerHeight, document.documentElement.scrollWidth, document.documentElement.scrollHeight,
        ...['.finale-stage', '.finale-story', '.word-fragments'].map(selector => document.querySelector(selector).getBoundingClientRect().toJSON())]`)
      throw Error(JSON.stringify(measured), { cause: error })
    }
    assert(await audience.eval("[...document.querySelectorAll('.word-tile')].every(tile => { const r=tile.getBoundingClientRect(); return r.x>=0 && r.right<=innerWidth && r.y>=0 && r.bottom<=innerHeight })"))
    if (width !== 1280) {
      const { data } = await audience.cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      writeFileSync(new URL(`palabras-${width}x${height}.png`, output), Buffer.from(data, 'base64'))
    }
  }
  await wait(admin, "!!document.querySelector('[data-module=finale]')")
  await admin.eval("document.querySelector('[data-module=finale]').click()")
  await wait(admin, "document.querySelector('.word-tile')?.getAttribute('aria-disabled')==='false'")
  await admin.eval(`(() => {
    const tiles = document.querySelectorAll('.word-tile'), dataTransfer = new DataTransfer()
    for (const [target, type] of [[tiles[0], 'dragstart'], [tiles[2], 'dragover'], [tiles[2], 'drop'], [tiles[0], 'dragend']]) {
      target.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }))
    }
  })()`)
  const moved = [initial[1], initial[2], initial[0], ...initial.slice(3)]
  const sameOrder = order => `JSON.stringify(${words})===${JSON.stringify(JSON.stringify(order))}`
  await wait(audience, sameOrder(moved))
  await audience.cmd('Page.reload')
  await wait(audience, sameOrder(moved))
  await wait(audience, "document.activeElement?.id === 'finale-title'")
  await audience.cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  assert.equal(await audience.eval("getComputedStyle(document.querySelector('.word-tile')).animationName"), 'none')
  await audience.activate()
  await audience.eval("document.querySelector('.word-tile').focus()")
  await wait(audience, "document.activeElement === document.querySelector('.word-tile')")
  await audience.cmd('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  await audience.cmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  const keyboard = [moved[1], moved[0], ...moved.slice(2)]
  await wait(audience, sameOrder(keyboard))
  await wait(admin, sameOrder(keyboard))
  await wait(audience, "document.activeElement === document.querySelectorAll('.word-tile')[1]")
  await admin.eval(advance + '.click()')
  await wait(audience, phase + '==="joint"')
  assert.equal(await audience.eval("document.querySelector('#finale-public-proposal').value"), '')
  await audience.eval(`(() => {
    const input = document.querySelector('#finale-public-proposal')
    input.value = 'FRASE INCOMPLETA'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await wait(audience, "!!document.querySelector('[data-action=submit]:enabled')")
  await audience.eval("document.querySelector('[data-action=submit]').click()")
  await wait(audience, phase + '==="jointFail"')
  await audience.eval("document.querySelector('[data-action=retry]').click()")
  await wait(audience, sameOrder(keyboard))
  await audience.eval("document.querySelector('[data-action=reset]').click()")
  await wait(audience, '!!document.querySelector("dialog[open]")')
  await audience.eval('document.querySelector("dialog[open] .destructive").click()')
  await wait(audience, phase + '==="intro"')
  assert.equal(await audience.eval("document.querySelector('#finale-title').textContent"), 'EL ÚLTIMO SECRETO')
  const progress = await audience.eval("JSON.parse(localStorage.getItem('ninja-control-v3')).finales.colegio")
  assert.deepEqual(progress.attempts, [0, 0, 0])
  assert.equal(progress.wordBoard, undefined)
  await audience.eval(advance + '.click()')
  await wait(audience, phase + '==="call1"')
  await admin.eval("document.querySelector('[data-action=reset]').click()")
  await wait(admin, '!!document.querySelector("dialog[open]")')
  await admin.eval('document.querySelector("dialog[open] .destructive").click()')
  await wait(audience, phase + '==="intro"')
  assert.deepEqual(errors, [])
  assert.deepEqual(external, [])
  console.log('Chrome: capturas, arrastre, teclado, sincronización, recarga, reintento y restablecimiento desde ambas ventanas.')
} finally {
  await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {})
  socket.close()
}
