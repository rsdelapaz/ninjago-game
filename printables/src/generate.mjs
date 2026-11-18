import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, relative, isAbsolute } from 'node:path'
import { createHash } from 'node:crypto'
import { renderClue } from './template.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const input = resolve(process.argv[2] || resolve(root, 'content/demostracion.json'))
const contentPath = relative(resolve(root, 'content'), input)
assert(contentPath && !contentPath.startsWith('..') && !isAbsolute(contentPath), 'El JSON debe estar en printables/content/')
const data = JSON.parse(await readFile(input, 'utf8'))
assert(/^[a-z0-9][a-z0-9-]{0,79}$/.test(data.id), 'ID de archivo no válido')
assert(typeof data.demonstration === 'boolean', 'Indicar si es demostración')
assert(typeof data.title === 'string' && data.title.trim(), 'Falta título')
assert(typeof data.identification === 'string', 'Identificación literal; vacía si no consta')
assert(data.footer === undefined || typeof data.footer === 'string', 'Pie literal no válido')
assert(Array.isArray(data.paragraphs) && data.paragraphs.length && data.paragraphs.every(p => typeof p === 'string' && p.trim()), 'Falta texto literal')
assert(Number.isFinite(data.reservedHeightMm) && data.reservedHeightMm >= 20 && data.reservedHeightMm <= 80, 'Altura útil reservada: 20–80 mm')
assert(data.demonstration || (typeof data.source === 'string' && data.source.trim()), 'Una pista real necesita referencia al original revisado')
let originalSha256
if (!data.demonstration) {
  const original = resolve(root, '..', data.source)
  const privatePath = relative(resolve(root, '../public/private-media'), original)
  assert(privatePath && !privatePath.startsWith('..') && !isAbsolute(privatePath), 'El original debe estar en medios privados')
  originalSha256 = createHash('sha256').update(await readFile(original)).digest('hex')
  assert.equal(originalSha256, data.sourceSha256, 'El original ha cambiado desde el cotejo visual')
}
const html = renderClue(data, await readFile(new URL('./print.css', import.meta.url), 'utf8'))
const output = resolve(root, 'output'), previews = resolve(root, 'previews')
await mkdir(output, { recursive: true }); await mkdir(previews, { recursive: true })
const stem = `${data.demonstration ? 'demo-' : ''}${data.id}`
let pdfBytes
// Only the generated document and PDF.js are served, on a temporary loopback port.
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname
    if (path === '/') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; worker-src 'self' blob:; connect-src 'self'; font-src blob: data:; img-src data: blob:")
      response.end(html); return
    }
    if (path === '/document.pdf' && pdfBytes) { response.setHeader('Content-Type', 'application/pdf'); response.end(pdfBytes); return }
    if (path === '/pdf.mjs' || path === '/pdf.worker.mjs') {
      response.setHeader('Content-Type', 'text/javascript')
      response.end(await readFile(resolve(root, 'node_modules/pdfjs-dist/build', path.slice(1)))); return
    }
    response.writeHead(404); response.end()
  } catch { response.writeHead(500); response.end('No se pudo cargar el recurso local.') }
})
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
const origin = `http://127.0.0.1:${server.address().port}`
let socket, browserContextId, sequence = 0
const pending = new Map(), externalRequests = [], errors = []
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)) }, 60000)
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
try {
  const port = process.env.PRINTABLES_CDP_PORT || '9224'
  assert(/^\d+$/.test(port), 'Puerto CDP no válido')
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  socket = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const item = pending.get(message.id); if (!item) return
      pending.delete(message.id); clearTimeout(item.timer)
      message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text)
    if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url) && new URL(message.params.request.url).origin !== origin) externalRequests.push(message.params.request.url)
  })
  ;({ browserContextId } = await send('Target.createBrowserContext'))
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const c = (method, params = {}) => send(method, params, sessionId)
  async function evaluate(expression) {
    const result = await c('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  await c('Page.enable'); await c('Runtime.enable')
  await c('Network.enable')
  await c('Emulation.setEmulatedMedia', { media: 'print' })
  await c('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1300, deviceScaleFactor: 1, mobile: false })
  await c('Page.navigate', { url: origin })
  // Wait for the real document and locally installed fonts, without a fixed delay.
  for (let attempt = 0; ; attempt++) {
    if (await evaluate('!!document.querySelector(".sheet")')) break
    assert(attempt < 100, 'No se cargó la plantilla')
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  await evaluate('document.fonts.ready.then(() => true)')
  console.log('Plantilla cargada; comprobando composición.')
  const layout = await evaluate(`(() => {
    const sheet = document.querySelector('.sheet'), content = [...sheet.children].filter(el => !el.classList.contains('paper-art'));
    const rects = content.map(el => ({ name:el.tagName, top:el.getBoundingClientRect().top, bottom:el.getBoundingClientRect().bottom }));
    const space = document.querySelector('.usable-space').getBoundingClientRect();
    return { overflow:sheet.scrollHeight > sheet.clientHeight + 1, rects,
      reservedMm:{width:space.width * 25.4 / 96, height:space.height * 25.4 / 96},
      source:[...document.querySelectorAll('[data-source]')].map(el => el.textContent), visibleText:sheet.innerText };
  })()`)
  assert.equal(layout.overflow, false, 'Contenido desbordado: revisar composición; no reducir texto automáticamente')
  for (let index = 1; index < layout.rects.length; index++) assert(layout.rects[index].top >= layout.rects[index - 1].bottom - 1, 'Elementos superpuestos')
  assert.deepEqual(layout.source, [data.title, ...data.paragraphs], 'El HTML debe conservar el texto exacto')
  const printed = await c('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, paperWidth: 210 / 25.4, paperHeight: 297 / 25.4, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, generateTaggedPDF: true })
  console.log('PDF generado; renderizando y extrayendo texto del PDF.')
  pdfBytes = Buffer.from(printed.data, 'base64')
  // Neutralize only Chromium's clock fields, preserving byte lengths and xref offsets.
  pdfBytes = Buffer.from(pdfBytes.toString('latin1').replace(/\/(CreationDate|ModDate) \(D:\d{14}\+00'00'\)/g, "/$1 (D:20000101000000+00'00')"), 'latin1')
  assert(pdfBytes.subarray(0, 5).toString() === '%PDF-', 'No es PDF')
  // Read and rasterize the PDF itself; a screenshot of the HTML is not PDF QA.
  const inspected = await evaluate(`(async () => {
    const pdfjs = await import('/pdf.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const loadingTask = pdfjs.getDocument({url:'/document.pdf', useSystemFonts:false, isEvalSupported:false});
    const documentPdf = await loadingTask.promise;
    const page = await documentPdf.getPage(1), viewport = page.getViewport({scale:300/72});
    const canvas = document.createElement('canvas'); canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height);
    const text = await page.getTextContent();
    // Print intent avoids relying on animation frames in a background Chrome tab.
    await page.render({canvasContext:canvas.getContext('2d'),viewport,intent:'print'}).promise;
    const result = { pages:documentPdf.numPages, points:page.view, text:text.items.map(item => item.str).join(' '),
      png:canvas.toDataURL('image/png').split(',')[1], pixels:[canvas.width,canvas.height] };
    await loadingTask.destroy(); return result;
  })()`)
  assert.equal(inspected.pages, 1, 'Cada pista debe ocupar exactamente una página')
  const [x1, y1, x2, y2] = inspected.points
  const widthMm = (x2 - x1) * 25.4 / 72, heightMm = (y2 - y1) * 25.4 / 72
  assert(Math.abs(widthMm - 210) < .3 && Math.abs(heightMm - 297) < .3, 'El PDF no es A4')
  const normalize = value => value.normalize('NFC').replace(/\s+/gu, '')
  const expectedText = [data.title, data.identification, ...data.paragraphs, data.footer].filter(Boolean)
  for (const paragraph of expectedText) assert(normalize(inspected.text).includes(normalize(paragraph)), 'Texto PDF incompleto o alterado')
  assert.equal(normalize(inspected.text), normalize(layout.visibleText), 'La extracción PDF no conserva todo el texto visible')
  const descriptors = [...pdfBytes.toString('latin1').matchAll(/\d+ 0 obj\s*<<[^]*?endobj/g)].map(match => match[0]).filter(object => /\/Type\s*\/FontDescriptor\b/.test(object))
  assert(descriptors.length && descriptors.every(object => /\/FontFile[23]?\s+\d+ 0 R/.test(object)), 'Hay fuentes no incrustadas')
  assert.deepEqual(errors, []); assert.deepEqual(externalRequests, [])
  const report = { demonstration: data.demonstration, input: contentPath, browser: version.Browser, pages: inspected.pages,
    sizeMm: [widthMm, heightMm], safeMarginMm: 12, previewDpi: 300, previewPixels: inspected.pixels,
    embeddedFontDescriptors: descriptors.length, fonts: [...new Set([...pdfBytes.toString('latin1').matchAll(/\/BaseFont\s*\/([^\s/]+)/g)].map(match => match[1]))],
    contentTextMatches: true, originalSha256, ...layout, externalRequests, errors, pdfSha256: createHash('sha256').update(pdfBytes).digest('hex') }
  await writeFile(resolve(output, stem + '.pdf'), pdfBytes)
  await writeFile(resolve(output, stem + '.html'), html)
  await writeFile(resolve(previews, stem + '.png'), Buffer.from(inspected.png, 'base64'))
  await writeFile(resolve(previews, stem + '.txt'), inspected.text + '\n')
  await writeFile(resolve(previews, stem + '.qa.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ pdf: resolve(output, stem + '.pdf'), preview: resolve(previews, stem + '.png'), ...report }, null, 2))
} finally {
  if (browserContextId) await send('Target.disposeBrowserContext', { browserContextId }).catch(() => {})
  socket?.close(); for (const item of pending.values()) clearTimeout(item.timer)
  await new Promise(resolve => server.close(resolve))
}
