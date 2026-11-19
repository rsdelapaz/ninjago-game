import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { usePresentation } from '../src/usePresentation.ts'
import { readProfile, profileKey, presentationKey, withLocalWrite } from '../src/profileStorage.ts'
import { applyProfileConfig, ceremonyKey } from '../src/ceremonyStorage.ts'
const snapshot = value => JSON.parse(JSON.stringify(value))

// Real composable and persistence; only browser storage, Web Lock and transport are simulated.
async function environment(work) {
  const keys = ['window', 'localStorage', 'navigator', 'BroadcastChannel']
  const saved = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const data = new Map(), channels = new Set(), messages = [], storageListeners = new Set()
  const storage = {
    get length() { return data.size }, key: index => [...data.keys()][index] ?? null,
    getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key),
  }
  let queue = Promise.resolve()
  const define = (key, value) => Object.defineProperty(globalThis, key, { configurable: true, value })
  define('localStorage', storage)
  define('window', { addEventListener(name, listener) { if (name === 'storage') storageListeners.add(listener) }, removeEventListener(name, listener) { if (name === 'storage') storageListeners.delete(listener) } })
  define('navigator', { locks: { request(name, write) { assert.equal(name, 'ninja-local-write'); const next = queue.then(write); queue = next.catch(() => {}); return next } } })
  define('BroadcastChannel', class {
    constructor(name) { assert.equal(name, presentationKey); channels.add(this) }
    postMessage(message) { messages.push(structuredClone(message)); for (const channel of channels) if (channel !== this) channel.onmessage?.({ data: message }) }
    close() { channels.delete(this) }
  })
  async function controller() {
    let api
    await renderToString(createSSRApp({ setup() { api = usePresentation(); return () => h('div') } }))
    await api.initialized; return api
  }
  async function configure(id, mutate = () => {}) {
    return withLocalWrite(() => {
      const config = readProfile(storage, id)
      config.finale = { answer: 'NIÑOS UNIDOS', secret: `Secreto sintético ${id}.`, videoFilename: '', audioFilename: '', failureMessage: 'Reunid vuestras ideas.' }
      config.participants=[{id:'synthetic-a',name:'Ninja Alba'},{id:'synthetic-b',name:'Ninja Bruno'}]
      config.teams.forEach((team,index)=>{team.name=`Clan sintético ${index+1}`;team.color=index?'#55c4de':'#d36b3d';team.memberIds=[config.participants[index].id];team.captainId=team.memberIds[0]})
      mutate(config)
      applyProfileConfig(storage, config, storage.getItem(profileKey(id)), storage.getItem(ceremonyKey(id)))
      return config
    })
  }
  const notify = () => { for (let repeat = 0; repeat < 3; repeat++) for (const channel of channels) channel.onmessage?.({ data: { profileId: 'colegio' } }) }
  const storageEvent = key => { for (const listener of storageListeners) listener({ key, newValue: storage.getItem(key) }) }
  try { await work({ storage, data, controller, configure, notify, storageEvent, messages }) }
  finally { channels.clear(); storageListeners.clear(); for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key] } }
}

async function prepared(context, id = 'colegio') {
  const admin = await context.controller(); assert.equal(await admin.selectProfile(id), true)
  await context.configure(id); admin.refreshProfile()
  assert.equal(await admin.select('finale'), true)
  await toJoint(admin)
  return admin
}
async function toJoint(admin) {
  for(const action of [{type:'advance'},{type:'advance'},{type:'clues',ready:true},{type:'submit',proposal:admin.profile.value.finale.answer},{type:'advance'}])assert.equal(await admin.actFinale(action),true)
}

test('simultaneous public and private proposals produce one persisted run under the shared lock and CAS', async()=>{
  await environment(async context=>{
    const admin=await prepared(context), audience=await context.controller()
    const revision=admin.state.value.revision
    const accepted=await Promise.all([admin.actFinale({type:'submit',proposal:'OTRA FRASE'}),audience.actFinale({type:'submit',proposal:'NIÑOS UNIDOS'})])
    assert.equal(accepted.filter(Boolean).length,1)
    const state=JSON.parse(context.storage.getItem(presentationKey))
    assert(state.revision>revision);assert.equal(state.finales.colegio.status,'rejecting')
    assert.equal(state.finales.colegio.rejectedAnswer.text,'OTRA FRASE');assert(!JSON.stringify(context.messages).includes('OTRA FRASE'))
    const run=state.finales.colegio.runId;context.notify()
    assert.equal(admin.finale.value.runId,run);assert.equal(audience.finale.value.runId,run)
  })
})

test('an immediate reduced-motion completion waits for its own public delivery to release the existing write lock',async()=>{
  await environment(async context=>{
    const audience=await prepared(context)
    const delivered=audience.actFinale({type:'submit',proposal:'OTRA FRASE'})
    for(let turn=0;turn<20&&audience.finale.value.status!=='rejecting';turn++)await Promise.resolve()
    assert.equal(audience.finale.value.status,'rejecting');assert.equal(audience.busy.value,true)
    const run=audience.finale.value.runId,completed=audience.finishFinale(run)
    assert.equal(await delivered,true);assert.equal(await completed,true)
    assert.equal(audience.finale.value.status,'failure');assert.equal(audience.finale.value.runId,run)
    assert.equal(await audience.finishFinale('obsolete'),false)
  })
})

test('real finale controller blocks an unconfigured scene and enters ready only after an explicit saved configuration', async () => {
  await environment(async context => {
    const { controller, configure, storage } = context, admin = await controller()
    await admin.selectProfile('colegio')
    const before = storage.getItem(presentationKey)
    assert.equal(await admin.select('finale'), false); assert.match(admin.warning.value, /bloqueado.*Configura/)
    assert.equal(storage.getItem(presentationKey), before); assert.equal(admin.state.value.sceneId, 'intro')
    assert.equal(await admin.actFinale({ type: 'submit', proposal: 'Cualquier frase' }), false)
    const config = await configure('colegio'); admin.refreshProfile()
    assert.equal(admin.state.value.sceneId, 'intro')
    assert.equal(await admin.select('finale'), true); assert.equal(admin.finale.value.status, 'ready')
    assert.equal(admin.finale.value.runId, ''); assert(!storage.getItem(presentationKey).includes(config.finale.secret))
    const ready = storage.getItem(presentationKey)
    assert.equal(await admin.actFinale({ type: 'submit', proposal: '' }), false)
    assert.equal(storage.getItem(presentationKey), ready)
  })
})

test('real finale transport completes three failure/retry cycles without proposals/secrets in notifications or duplicate runs', async () => {
  await environment(async context => {
    const admin = await prepared(context), audience = await context.controller()
    const { storage, notify, storageEvent, messages } = context
    const originalConfig = storage.getItem(profileKey('colegio')), other = storage.getItem(profileKey('urbanizacion'))
    for (let attempt = 0; attempt < 3; attempt++) {
      assert.equal(await admin.actFinale({ type: 'submit', proposal: 'RESPUESTA INCORRECTA' }), true)
      assert.equal(audience.finale.value.status, 'rejecting')
      const run = audience.finale.value.runId, revision = audience.state.value.revision
      const snapshot = storage.getItem(presentationKey)
      notify(); storageEvent(presentationKey)
      assert.equal(audience.finale.value.runId, run); assert.equal(audience.state.value.revision, revision)
      assert.equal(storage.getItem(presentationKey), snapshot)
      assert.equal(await admin.actFinale({ type: 'submit', proposal: 'NIÑOS UNIDOS' }), false)
      assert.equal(await audience.finishFinale(run), true); assert.equal(admin.finale.value.status, 'failure')
      const finished = storage.getItem(presentationKey), settledRevision = admin.state.value.revision
      assert.equal(await audience.finishFinale(run), false); assert.equal(storage.getItem(presentationKey), finished)
      assert.equal(admin.state.value.revision, settledRevision)
      assert.equal(await admin.actFinale({ type: 'retry' }), true); assert.equal(audience.finale.value.status, 'ready')
    }
    assert.equal(storage.getItem(profileKey('colegio')), originalConfig); assert.equal(storage.getItem(profileKey('urbanizacion')), other)
    assert(messages.length > 0); assert(messages.every(message => Object.keys(message).join() === 'profileId'))
    assert(!JSON.stringify(messages).includes('RESPUESTA INCORRECTA')); assert(!JSON.stringify(messages).includes('NIÑOS UNIDOS'))
  })
})

test('real finale success survives controller reload with the same run, settles once, replays explicitly and cancels by reset', async () => {
  await environment(async context => {
    const admin = await prepared(context)
    assert.equal(await admin.actFinale({ type: 'submit', proposal: '¡Niños, unidos!' }), true)
    const run = admin.finale.value.runId, persisted = context.storage.getItem(presentationKey)
    assert.equal(admin.finale.value.status, 'revealing')
    const reload = await context.controller()
    assert.equal(reload.finale.value.runId, run); assert.equal(reload.finale.value.status, 'revealing')
    assert.equal(context.storage.getItem(presentationKey), persisted, 'mounting the composable must not create another execution')
    assert.equal(await reload.finishFinale(run), true); assert.equal(admin.finale.value.status, 'success')
    assert.equal(await admin.finishFinale(run), false)
    assert.equal(await admin.actFinale({ type: 'sound', enabled: true }), true)
    assert.equal(await admin.actFinale({ type: 'replay' }), true)
    const replay = admin.finale.value.runId
    assert.notEqual(replay, run); assert.equal(admin.finale.value.status, 'revealing')
    assert.equal(await reload.finishFinale(run), false, 'an old completion cannot complete the replay')
    assert.equal(await admin.actFinale({ type: 'reset' }), true)
    assert.equal(reload.finale.value.status, 'ready'); assert.equal(reload.finale.value.sound, true)
    assert.equal(await reload.finishFinale(replay), false)
    assert.equal(admin.profile.value.finale.answer, 'NIÑOS UNIDOS')
  })
})

test('leaving a finale execution settles its outcome; return preserves the result rather than starting again', async () => {
  await environment(async context => {
    const admin = await prepared(context)
    for (const [proposal, expected] of [['otra frase', 'failure'], ['niños unidos', 'success']]) {
      assert.equal(await admin.actFinale({ type: 'submit', proposal }), true)
      const run = admin.finale.value.runId
      assert.equal(await admin.select('intro'), true)
      assert.equal(admin.state.value.finales.colegio.status, expected)
      assert.equal(await admin.finishFinale(run), false)
      assert.equal(await admin.select('finale'), true)
      assert.equal(admin.finale.value.status, expected); assert.equal(admin.finale.value.runId, run)
      const reloaded = await context.controller(); assert.equal(reloaded.finale.value.status, expected)
      if (expected === 'failure') assert.equal(await admin.actFinale({ type: 'retry' }), true)
    }
  })
})

test('profile-specific finale progress stays independent while competing controllers and changed config reject stale actions', async () => {
  await environment(async context => {
    const admin = await prepared(context)
    await context.configure('urbanizacion', config => { config.finale.answer = 'OTRA FRASE' })
    assert.equal(await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }), true)
    assert.equal(await admin.finishFinale(admin.finale.value.runId), true)
    const school = snapshot(admin.finale.value), schoolConfig = context.storage.getItem(profileKey('colegio'))
    await admin.selectProfile('urbanizacion'); await admin.select('finale'); await toJoint(admin)
    assert.equal(admin.finale.value.status, 'ready')
    assert.equal(await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }), true)
    assert.equal(admin.finale.value.status, 'rejecting')
    assert.deepEqual(admin.state.value.finales.colegio, school); assert.equal(context.storage.getItem(profileKey('colegio')), schoolConfig)
    await admin.selectProfile('colegio'); await admin.select('finale')
    assert.equal(admin.finale.value.status, 'success'); await admin.actFinale({ type: 'reset' }); await toJoint(admin)
    const competitor = await context.controller()
    const simultaneous = await Promise.all([admin.actFinale({ type: 'submit', proposal: 'niños unidos' }), competitor.actFinale({ type: 'submit', proposal: 'niños unidos' })])
    assert.deepEqual(simultaneous, [true, false]); assert.match(competitor.warning.value, /Otra ventana/)
    await admin.actFinale({ type: 'reset' }); await toJoint(admin)
    const unchangedControl = context.storage.getItem(presentationKey)
    await withLocalWrite(() => {
      const config = readProfile(context.storage, 'colegio'); config.media.video = 'otro-video-sintetico.mp4'
      applyProfileConfig(context.storage, config, context.storage.getItem(profileKey('colegio')), context.storage.getItem(ceremonyKey('colegio')))
    })
    assert.equal(context.storage.getItem(presentationKey), unchangedControl)
    assert.equal(await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }), false)
    assert.match(admin.warning.value, /desenlace cambió/)
    assert.equal(context.storage.getItem(presentationKey), unchangedControl)
    const beforeChange = context.storage.getItem(presentationKey)
    await context.configure('colegio', config => { config.finale.failureMessage = 'Mensaje cambiado de ensayo.' })
    assert.equal(await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }), false)
    assert.match(admin.warning.value, /Otra ventana|desenlace cambió/)
    assert.notEqual(context.storage.getItem(presentationKey), beforeChange)
    assert.equal(admin.state.value.sceneId, 'intro'); assert.equal(admin.finale.value.status, 'ready')
  })
})

test('editing finale configuration through the journal invalidates a victory permanently even when settings are changed back', async () => {
  await environment(async context => {
    const admin = await prepared(context)
    await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }); await admin.finishFinale(admin.finale.value.runId)
    const oldRun = admin.finale.value.runId, original = snapshot(admin.profile.value.finale)
    await context.configure('colegio', config => { config.finale.secret = 'Un nuevo secreto de ensayo.' })
    admin.refreshProfile(); assert.equal(admin.state.value.sceneId, 'intro'); assert.equal(admin.finale.value.status, 'ready')
    assert.equal(JSON.parse(context.storage.getItem(presentationKey)).finales.colegio, undefined)
    await context.configure('colegio', config => { config.finale = original })
    admin.refreshProfile(); await admin.select('finale')
    assert.equal(admin.finale.value.status, 'ready'); assert.equal(admin.finale.value.runId, '')
    assert.equal(await admin.finishFinale(oldRun), false)
  })
})

test('interrupted journal cleanup of one profile recovers without deleting the other profile finale or configuration', async () => {
  await environment(async context => {
    const admin = await prepared(context)
    await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }); await admin.finishFinale(admin.finale.value.runId)
    await context.configure('urbanizacion'); await admin.selectProfile('urbanizacion'); await admin.select('finale'); await toJoint(admin)
    await admin.actFinale({ type: 'submit', proposal: 'niños unidos' }); await admin.finishFinale(admin.finale.value.runId)
    const { storage } = context, urbanProgress = snapshot(admin.finale.value)
    const urbanConfig = storage.getItem(profileKey('urbanizacion')), urbanCeremony = storage.getItem(ceremonyKey('urbanizacion'))
    const originalSet = storage.setItem; let interrupt = true
    storage.setItem = (key, value) => { if (key === presentationKey && interrupt) { interrupt = false; throw Error('simulated finale control quota') } originalSet(key, value) }
    await assert.rejects(context.configure('colegio', config => { config.finale.secret = 'Secreto cambiado mientras otro perfil sigue activo.' }), /quota/)
    assert(storage.getItem('ninja-ceremony-pending:colegio'))
    assert(JSON.parse(storage.getItem(presentationKey)).finales.colegio)
    const reloaded = await context.controller() // Initialization recovers the existing journal under the same simulated Web Lock.
    assert.equal(storage.getItem('ninja-ceremony-pending:colegio'), null)
    const control = JSON.parse(storage.getItem(presentationKey))
    assert.equal(control.profileId, 'urbanizacion'); assert.equal(control.sceneId, 'finale')
    assert.equal(control.finales.colegio, undefined); assert.deepEqual(control.finales.urbanizacion, urbanProgress)
    assert.equal(storage.getItem(profileKey('urbanizacion')), urbanConfig); assert.equal(storage.getItem(ceremonyKey('urbanizacion')), urbanCeremony)
    assert.deepEqual(reloaded.finale.value, urbanProgress)
    await reloaded.selectProfile('colegio'); await reloaded.select('finale')
    assert.equal(reloaded.finale.value.status, 'ready')
  })
})

test('ceremony phases, missing clues and both rejected turns survive reload without advancing or revealing a secret',async()=>{
  await environment(async context=>{
    const admin=await context.controller();await admin.selectProfile('colegio');await context.configure('colegio');admin.refreshProfile();await admin.select('finale')
    const audience=await context.controller()
    const act=async action=>assert.equal(await admin.actFinale(action),true)
    await act({type:'advance'});await act({type:'advance'});await act({type:'clues',ready:false})
    let reloaded=await context.controller();assert.equal(reloaded.finale.value.ceremonyPhase,'clues1');assert.equal(reloaded.finale.value.cluesMissing,true)
    const waiting=context.storage.getItem(presentationKey);context.notify();assert.equal(context.storage.getItem(presentationKey),waiting)
    await act({type:'clues',ready:true});await act({type:'submit',proposal:'PRIMER FRAGMENTO'})
    assert.equal(audience.finale.value.ceremonyPhase,'answer1');assert.equal(audience.finale.value.status,'rejecting')
    const firstRun=audience.finale.value.runId;reloaded=await context.controller();assert.equal(reloaded.finale.value.runId,firstRun)
    assert.equal(await reloaded.finishFinale(firstRun),true);assert.equal(admin.finale.value.ceremonyPhase,'fail1')
    assert.equal(await admin.actFinale({type:'retry'}),false)
    await act({type:'advance'});assert.equal(audience.finale.value.ceremonyPhase,'call2')
    await act({type:'advance'});await act({type:'clues',ready:false});assert.equal(audience.finale.value.ceremonyPhase,'clues2')
    await act({type:'clues',ready:true});await act({type:'submit',proposal:'SEGUNDO FRAGMENTO'});await audience.finishFinale(audience.finale.value.runId)
    assert.equal(admin.finale.value.ceremonyPhase,'fail2');assert.deepEqual(admin.finale.value.attempts,[1,1,0])
    await act({type:'advance'});assert.equal(audience.finale.value.ceremonyPhase,'truth')
    reloaded=await context.controller();assert.equal(reloaded.finale.value.ceremonyPhase,'truth')
    await act({type:'advance'});assert.equal(audience.finale.value.ceremonyPhase,'captain');await act({type:'advance'})
    assert.equal(audience.finale.value.ceremonyPhase,'words')
    const initial=snapshot(audience.finale.value.wordBoard)
    const moves=await Promise.all([admin.actFinale({type:'move-word',from:0,to:1}),audience.actFinale({type:'move-word',from:0,to:1})])
    assert.equal(moves.filter(Boolean).length,1)
    assert.deepEqual(audience.finale.value.wordBoard,{initial:initial.initial,order:[...initial.order].reverse()})
    reloaded=await context.controller()
    assert.deepEqual(reloaded.finale.value.wordBoard,audience.finale.value.wordBoard)
    await act({type:'advance'})
    await act({type:'submit',proposal:'NIÑOS UNIDOS'});const run=admin.finale.value.runId
    await act({type:'restore'});assert.equal(audience.finale.value.ceremonyPhase,'victory');assert.deepEqual(audience.finale.value.attempts,[1,1,1]);assert.notEqual(audience.finale.value.runId,run)
    assert.equal(await audience.finishFinale(run),false)
    await act({type:'replay'});await act({type:'restore'});assert.equal(admin.finale.value.status,'success');assert.deepEqual(admin.finale.value.attempts,[1,1,1])
    await admin.select('intro');assert.equal(admin.state.value.sceneId,'intro');assert.equal(admin.finale.value.status,'success')
    assert(!context.storage.getItem(presentationKey).includes('PRIMER FRAGMENTO'));assert(!context.storage.getItem(presentationKey).includes('SEGUNDO FRAGMENTO'))
  })
})

test('ceremony preparation rejects a missing or foreign first captain and concurrent advances cannot skip an act',async()=>{
  await environment(async context=>{
    const admin=await context.controller();await admin.selectProfile('colegio')
    await context.configure('colegio',config=>{config.teams[0].captainId=null});admin.refreshProfile()
    assert.equal(await admin.select('finale'),false);assert.match(admin.warning.value,/capitán/)
    await context.configure('colegio');admin.refreshProfile();assert.equal(await admin.select('finale'),true)
    const audience=await context.controller()
    const accepted=await Promise.all([admin.actFinale({type:'advance'}),audience.actFinale({type:'advance'})])
    assert.equal(accepted.filter(Boolean).length,1);assert.equal(admin.finale.value.ceremonyPhase,'call1');assert.equal(audience.finale.value.ceremonyPhase,'call1')
    const counts=structuredClone(admin.finale.value.attempts);assert.equal(await admin.actFinale({type:'restore'}),true)
    assert.equal(admin.finale.value.ceremonyPhase,'call1');assert.deepEqual(admin.finale.value.attempts,counts)
    assert.equal(await admin.actFinale({type:'submit',proposal:'NIÑOS UNIDOS'}),false)
  })
})
