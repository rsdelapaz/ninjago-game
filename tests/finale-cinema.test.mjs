import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, h, nextTick, ref } from 'vue'
import { gsap } from 'gsap'
import { createProfile } from '../src/profile.ts'
import { createFinaleProgress } from '../src/finale.ts'
import { createFinaleParticles } from '../src/finaleParticles.ts'

test('actual finale keeps preview secret-free, restores without replay, respects reduced motion, cancels runs and handles failed media', async () => {
  const { descriptor } = parse(readFileSync(new URL('../src/FinaleStage.vue', import.meta.url), 'utf8'))
  const compiled = compileScript(descriptor, { id: 'finale-cinema-test', inlineTemplate: true, templateOptions: { compilerOptions: { hoistStatic: false } } }).content
  const js = ts.transpileModule(compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/from ['"]vue['"]/g, `from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/(useFinaleCinema|finale|finaleNarrative|confirmation)['"]/g, (_, name) => `from '${new URL('../src/' + name + '.ts', import.meta.url).href}'`)
    .replace(/import ['"].*finale\.css['"];?\r?\n/g, '')
    .replaceAll('import.meta.env.BASE_URL', "'./'")
  const Stage = (await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))).default
  const keys = ['window', 'document', 'Document', 'ShadowRoot', 'localStorage', 'BroadcastChannel']
  const saved = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)])), mediaListeners = new Map(), windowListeners = new Map()
  const define = (key, value) => Object.defineProperty(globalThis, key, { configurable: true, value })
  const media = { matches: true, addEventListener: (name, fn) => mediaListeners.set(name, fn), removeEventListener: name => mediaListeners.delete(name) }
  const doc = { createElement: tag => node(tag) }
  const node = tag => ({ tag, nodeType: 1, children: [], props: {}, addEventListener() {}, removeEventListener() {}, focus() { if (!this.props.disabled) this.focused = true }, pause() {}, getContext() { return null }, getRootNode() { return doc }, querySelectorAll() { return [] },querySelector(selector){const search=n=>n.props.class===selector.slice(1)?n:n.children.map(search).find(Boolean);return search(this)||null} })
  define('window', { matchMedia: () => media, addEventListener: (name, fn) => windowListeners.set(name, fn), removeEventListener: name => windowListeners.delete(name) })
  define('document', doc); define('Document', class {}); define('ShadowRoot', class {})
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('Renderer touched game storage') } })
  define('BroadcastChannel', class { constructor() { throw Error('Renderer opened a channel') } })
  const renderer = createRenderer({
    createElement: node, createText: text => ({ ...node('text'), text }), createComment: text => ({ ...node('comment'), text }),
    insert(child, parent, anchor) { if (child.parent) child.parent.children = child.parent.children.filter(value => value !== child); const index = anchor ? parent.children.indexOf(anchor) : -1; if (index < 0) parent.children.push(child); else parent.children.splice(index, 0, child); child.parent = parent },
    remove(child) { if (child?.parent) child.parent.children = child.parent.children.filter(value => value !== child) },
    patchProp(el, key, old, value) { el.props[key] = value }, setText(el, text) { el.text = text }, setElementText(el, text) { el.text = text },
    parentNode: el => el?.parent, nextSibling: el => el?.parent?.children[el.parent.children.indexOf(el) + 1] || null,
  })
  const root = node('root'), all = n => [n, ...n.children.flatMap(all)], text = n => all(n).filter(el=>el.tag!=='comment').map(el => el.text || '').join(' '), find = tag => all(root).find(el => el.tag === tag)
  const config = createProfile('colegio'); config.finale = { answer: 'UNIDOS ÑANDÚ', secret: 'SECRETO SINTÉTICO: EL FUTURO OS ESPERA.', videoFilename: 'final-ausente.mp4', audioFilename: 'narracion-ausente.ogg', failureMessage: 'Seguid unidos. Podéis intentarlo de nuevo.' }
  config.participants=[{id:'z',name:'Zoe sintética'},{id:'a',name:'Álvaro sintético'},{id:'b',name:'Bruno sintético'},{id:'p',name:'Paz sintética'}]
  config.teams.forEach((team,index)=>{team.name=index?'Clan del Río':'Clan del Cobre';team.color=index?'#55c4de':'#d36b3d';team.memberIds=index?['p','b']:['z','a'];team.captainId=index?'p':'z'})
  const progress = ref({ ...createFinaleProgress(config.finale), runId: 'completed', status: 'success',ceremonyPhase:'victory',attempts:[1,1,1] }), preview = ref(true), completed = []
  const actions = []; let accept
  const sendAction = action => { actions.push(action); return new Promise(resolve => { accept = resolve }) }
  const app = renderer.createApp({ render: () => h(Stage, { config, progress: progress.value, preview: preview.value, sendAction, onFinish: id => completed.push(id) }) })
  let activeApp = app
  const originalWarn = gsap.config().nullTargetWarn; gsap.config({ nullTargetWarn: false })
  const tick = async () => { await nextTick(); await nextTick() }
  try {
    app.mount(root); await tick()
    assert(!text(root).includes(config.finale.secret)); assert(!text(root).includes(config.finale.answer)); assert.equal(find('video'), undefined); assert.deepEqual(completed, [])
    assert.equal(find('textarea'), undefined); assert(!text(root).includes('Unid vuestras pistas'));assert(!text(root).includes('Zoe sintética'));assert(!text(root).includes('Paz sintética'))
    preview.value = false; await tick()
    assert(text(root).includes(config.finale.secret)); assert(!all(root).some(el => el.props['aria-label'] === config.finale.answer)); assert.deepEqual(completed, [])
    assert(all(root).some(el=>el.tag==='article'&&el.props['aria-label']==='Pergamino del último secreto'))
    const secretBody=()=>all(root).find(el=>el.props.class==='finale-secret-copy')?.children.find(el=>el.tag==='p')?.text
    assert.equal(secretBody(),config.finale.secret,'The final artifact presents the exact configured secret')
    find('video').props.onError(); await tick(); assert.equal(find('video'), undefined); assert(text(root).includes('El mensaje escrito del pergamino sigue disponible.'))
    find('audio').props.onError(); await tick(); assert(text(root).includes('Podéis seguir leyendo el pergamino.'))
    preview.value = true; await tick(); assert(!text(root).includes(config.finale.secret)); assert.equal(find('audio'), undefined)
    progress.value = { ...progress.value, runId: 'reduced-success', status: 'revealing',ceremonyPhase:'explosion' }; preview.value = false; await tick()
    assert(text(root).includes(config.finale.secret)); assert.deepEqual(completed, ['reduced-success'])
    progress.value = { ...progress.value }; await tick(); assert.deepEqual(completed, ['reduced-success'])
    progress.value = { ...progress.value, runId: 'reduced-failure', status: 'rejecting',ceremonyPhase:'answer1',attempts:[1,0,0] }; await tick()
    assert(!text(root).includes(config.finale.secret)); assert(!all(root).some(el => el.props['aria-label'] === config.finale.answer));assert(!text(root).includes(config.finale.failureMessage));assert.deepEqual(completed, ['reduced-success', 'reduced-failure'])
    progress.value={...progress.value,status:'failure',ceremonyPhase:'fail1'};await tick()
    assert(text(root).includes('Ahora escucharemos al segundo clan.'));assert(!text(root).includes('Unid vuestras pistas'));assert(!text(root).includes(config.finale.failureMessage))
    assert(!text(root).includes('Zoe sintética'));assert(!text(root).includes('Álvaro sintético'))
    progress.value={...progress.value,runId:'second-failure',status:'failure',ceremonyPhase:'fail2',attempts:[1,1,0]};await tick()
    assert(!text(root).includes('Paz sintética'));assert(!text(root).includes('Bruno sintético'));assert(!text(root).includes('Zoe sintética'))
    assert(!text(root).includes(config.finale.failureMessage));assert(!text(root).includes('Unid vuestras pistas'))
    progress.value={...progress.value,status:'ready',ceremonyPhase:'truth'};await tick()
    assert(text(root).includes('Cada clan guarda una parte del mensaje. Ninguno tiene la frase completa.'));assert(text(root).includes('Unid vuestras pistas'));assert(text(root).includes(config.finale.failureMessage))
    assert.equal(config.finale.failureMessage,'Seguid unidos. Podéis intentarlo de nuevo.','The private custom message is preserved, not rewritten')
    progress.value={...progress.value,runId:'early-captain',ceremonyPhase:'captain',earlyCorrect:true,attempts:[1,0,0]};await tick()
    assert(text(root).includes('El sello ha reconocido vuestras palabras.'));assert(text(root).includes('Zoe sintética'));assert(!text(root).includes('Ninguno tiene la frase completa'));assert(!text(root).includes(config.finale.answer));assert(!text(root).includes(config.finale.secret))
    media.matches = false; mediaListeners.get('change')(); progress.value = { ...progress.value, runId: 'animated', status: 'revealing',ceremonyPhase:'explosion' }; await tick()
    const timeline = gsap.globalTimeline.getChildren().find(child => child.labels?.opening !== undefined)
    assert(timeline, 'One real GSAP timeline starts for the command'); assert.equal(timeline.duration()/timeline.timeScale(),4,'The victory sequence completes in four seconds'); assert.equal(timeline.labels.phrase, 11.2)
    timeline.time(10, false); await tick(); assert(!text(root).includes(config.finale.secret)); assert(!all(root).some(el => el.props['aria-label'] === config.finale.answer))
    timeline.time(11.3, false); await tick(); assert(all(root).some(el => el.props['aria-label'] === config.finale.answer)); assert(!text(root).includes(config.finale.secret))
    timeline.time(13.4,false);await tick();assert.equal(secretBody(),config.finale.secret);assert(!all(root).some(el=>el.props['aria-label']===config.finale.answer),'The phrase yields to the parchment rather than competing with its contents')
    progress.value = { ...progress.value, runId: 'reset', status: 'ready',ceremonyPhase:'answer1' }; await tick()
    assert.equal(timeline.parent, null); assert(!text(root).includes(config.finale.secret)); assert(!all(root).some(el => el.props['aria-label'] === config.finale.answer))
    assert.deepEqual(completed, ['reduced-success', 'reduced-failure'])
    assert(text(root).includes('Muy bien. Ha llegado vuestra oportunidad.'));assert(!text(root).includes('Zoe sintética'))
    assert(!text(root).includes('Unid vuestras pistas'));assert(!text(root).includes(config.finale.failureMessage))
    const field = find('textarea'), form = find('form'), event = { preventDefault() {}, stopPropagation() {} }
    field.props['onUpdate:modelValue']('UNA RESPUESTA'); await tick()
    form.props.onSubmit(event); form.props.onSubmit(event); await tick()
    assert.deepEqual(actions, [{ type: 'submit', proposal: 'UNA RESPUESTA' }], 'Public form suppresses concurrent deliveries')
    field.focused = false; progress.value = { ...progress.value, runId: 'public-retry', status: 'ready' }; await tick()
    assert.equal(field.focused, false, 'A disabled textarea cannot receive focus before delivery resolves')
    accept(true); await tick()
    assert.equal(find('textarea').focused, true, 'Ready public field receives focus after the pending delivery resolves')
    app.unmount()
    progress.value = { ...progress.value, runId: 'reload-during-reveal', status: 'revealing',ceremonyPhase:'explosion' }
    activeApp = renderer.createApp({ render: () => h(Stage, { config, progress: progress.value, onFinish: id => completed.push(id) }) })
    activeApp.mount(root); await tick()
    assert(text(root).includes(config.finale.secret)); assert.equal(completed.at(-1), 'reload-during-reveal')
    const exactLongSecret='CAMPEONES DEL MUNDO\n\n'+ 'Mensaje ancestral íntegro. '.repeat(110)
    config.finale.secret=exactLongSecret;progress.value={...progress.value,status:'success',ceremonyPhase:'victory'};await tick()
    assert.equal(secretBody(),exactLongSecret,'Long multi-paragraph content is neither trimmed nor replaced')
    assert.equal(gsap.globalTimeline.getChildren().filter(child => child.labels?.opening !== undefined).length, 0, 'Reload restores a stable outcome without a second timeline')
  } finally {
    activeApp.unmount(); assert.equal(mediaListeners.size, 0); assert.equal(windowListeners.size, 0)
    assert.equal(gsap.globalTimeline.getChildren().filter(child => child.labels?.opening !== undefined).length, 0)
    gsap.config({ nullTargetWarn: originalWarn }); gsap.ticker.sleep()
    for (const [key, value] of Object.entries(saved)) { if (value) Object.defineProperty(globalThis, key, value); else delete globalThis[key] }
  }
})

test('canvas fallback is harmless and active finale particles are bounded and cleared on disposal', () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'window'); Object.defineProperty(globalThis, 'window', { configurable: true, value: { devicePixelRatio: 4 } })
  try {
    const missing = createFinaleParticles({ getContext() { throw Error('No GPU context') } }, () => ['#ff0000', '#0000ff']); assert.equal(missing.available, false); missing.resize(); missing.draw(1, 'burst'); missing.dispose()
    let strokes = 0, clears = 0
    const context = { clearRect() { clears++ }, setTransform() {}, save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() { strokes++ } }
    const canvas = { getContext: () => context, getBoundingClientRect: () => ({ width: 1000, height: 600 }) }
    const effect = createFinaleParticles(canvas, () => ['#ff0000', '#0000ff']); effect.resize(); assert.equal(canvas.width, 1500); assert.equal(canvas.height, 900)
    effect.draw(1, 'burst'); assert.equal(strokes, 156); effect.clear(); effect.dispose(); effect.draw(1, 'burst'); assert.equal(strokes, 156); assert(clears >= 3)
  } finally { if (saved) Object.defineProperty(globalThis, 'window', saved); else delete globalThis.window }
})
