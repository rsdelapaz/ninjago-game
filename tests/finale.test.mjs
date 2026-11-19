import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyFinale, normalizeFinaleAnswer, MAX_FINALE_ANSWER, parseFinale, finaleProblems, finaleSignature, createFinaleProgress, validFinaleProgress, currentFinale, transitionFinale, settledFinale, finaleCeremony, finaleTeamIndex, finaleCanAnswer, finaleHasProgress, finalePreparationProblems, finaleRoster } from '../src/finale.ts'
import { createProfile, cloneProfile, parseProfile, exportProfile } from '../src/profile.ts'
import { initializeProfiles, readProfile, saveProfile, profileKey, presentationKey } from '../src/profileStorage.ts'
import { newChallenge } from '../src/challenges.ts'
import { scenesFor, adjacentScene } from '../src/scenes.ts'

class MemoryStorage {
  data = new Map()
  get length() { return this.data.size }
  key(index) { return [...this.data.keys()][index] ?? null }
  getItem(key) { return this.data.get(key) ?? null }
  setItem(key, value) { this.data.set(key, value) }
  removeItem(key) { this.data.delete(key) }
}
const configured = () => ({ ...emptyFinale(), answer: 'UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES', secret: 'Secreto sintético para ensayo: misión completada.' })
function firstAnswer(config) {
  let progress = createFinaleProgress(config)
  for (const action of [{type:'advance'},{type:'advance'},{type:'clues',ready:true}]) progress=transitionFinale(config,progress,action,crypto.randomUUID())
  return progress
}
function jointReady(config) {
  let progress=transitionFinale(config,firstAnswer(config),{type:'submit',proposal:config.answer},'early-answer')
  return transitionFinale(config,progress,{type:'advance'},'joint-ready')
}

test('finale validates the long canonical phrase with punctuation, vowel accents, case and redundant spaces while preserving Ñ', () => {
  const config = configured()
  assert.equal(normalizeFinaleAnswer(config.answer), 'UN NINJA EN SOLITARIO ES MUY FUERTE PERO JUNTOS SON INVENCIBLES')
  assert.equal(normalizeFinaleAnswer('  ¡Ún ninja en SOLITARIO es muy fuerte;  pero juntos son invencibles!  '), normalizeFinaleAnswer(config.answer))
  assert.equal(normalizeFinaleAnswer('¿Mañana, pingüino? ¡Sí!'), 'MAÑANA PINGUINO SI')
  assert.equal(normalizeFinaleAnswer('NIN\u0303OS'), 'NIÑOS')
  assert.notEqual(normalizeFinaleAnswer('niño'), normalizeFinaleAnswer('nino'))
})

test('finale answer rejects emptiness, control/format characters and excessive input without truncating accepted text', () => {
  assert.equal(MAX_FINALE_ANSWER, 256)
  assert.equal(normalizeFinaleAnswer('Á'.repeat(256)), 'A'.repeat(256))
  for (const invalid of ['', '    ', '?!…', 'x'.repeat(257), ' '.repeat(1025), 'nin\u0000ja', 'ninja\n', 'ninja\t', 'ninja\r', 'ninja\u200b', 'ninja\u202e']) assert.equal(normalizeFinaleAnswer(invalid), null, JSON.stringify(invalid))
})

test('finale has no invented default answer or secret and cannot transition until both are configured', () => {
  const config = emptyFinale(), initial = createFinaleProgress(config)
  assert.deepEqual(parseFinale(config), config)
  assert.equal(config.answer, ''); assert.equal(config.secret, '')
  assert.equal(finaleProblems(config).length, 2)
  assert.equal(finaleProblems({ ...config, answer: 'NINJAS' }).length, 1)
  assert.equal(finaleProblems({ ...config, secret: 'Un secreto configurado.' }).length, 1)
  for (const action of [{ type: 'submit', proposal: 'NINJAS' }, { type: 'replay' }, { type: 'reset' }]) assert.throws(() => transitionFinale(config, initial, action, 'blocked'), /Configura/)
  assert.deepEqual(initial, createFinaleProgress(config))
})

test('finale configuration permits local optional media and bounded private text, rejecting unknown fields, paths and binaries', () => {
  const config = { ...configured(), videoFilename: 'wu-final 2.webm', audioFilename: 'final.ogg', failureMessage: 'Reunid vuestras ideas.' }
  assert.deepEqual(parseFinale(config), config)
  assert.deepEqual(parseFinale({ ...config, secret: 'S'.repeat(3000), failureMessage: 'Á'.repeat(280) }).secret, 'S'.repeat(3000))
  for (const videoFilename of ['../wu.mp4', 'colegio/wu.mp4', 'colegio\\wu.mp4', 'https://host/wu.mp4', 'data:video/mp4,AAA', 'wu.png', 'wu..mp4']) assert.throws(() => parseFinale({ ...config, videoFilename }))
  for (const audioFilename of ['https://host/final.mp3', '../final.wav', 'final.mp4', 'data:audio/ogg,AA']) assert.throws(() => parseFinale({ ...config, audioFilename }))
  for (const extra of ['binary', 'progress', 'winner', 'constructor']) assert.throws(() => parseFinale({ ...config, [extra]: 'no permitido' }), /desconocidos/, extra)
  for (const malformed of [null, [], { ...config, answer: ' ' }, { ...config, answer: 'a'.repeat(257) }, { ...config, secret: 's'.repeat(3001) }, { ...config, failureMessage: 'm'.repeat(281) }, { ...config, secret: '\u0000' }, { ...config, audioFilename: null }]) assert.throws(() => parseFinale(malformed))
})

test('multiple finale failures never reveal the secret and retry preserves sound while rejecting duplicate submissions', () => {
  const config = configured(); let progress = transitionFinale(config, jointReady(config), { type: 'sound', enabled: true }, 'sound')
  for (let attempt = 1; attempt <= 5; attempt++) {
    const before = structuredClone(progress)
    progress = transitionFinale(config, progress, { type: 'submit', proposal: 'Otra respuesta' }, `attempt-${attempt}`)
    assert.deepEqual(before.status, 'ready'); assert.equal(progress.status, 'rejecting'); assert.equal(progress.runId, `attempt-${attempt}`)
    assert.throws(() => transitionFinale(config, progress, { type: 'submit', proposal: config.answer }, 'duplicate'), /turno/)
    assert(!JSON.stringify(progress).includes(config.answer)); assert(!JSON.stringify(progress).includes(config.secret))
    progress = settledFinale(progress); assert.equal(progress.status, 'failure')
    progress = transitionFinale(config, progress, { type: 'retry' }, `retry-${attempt}`)
    assert.equal(progress.status, 'ready'); assert.equal(progress.sound, true)
  }
})

test('finale success, replay, cancellation/reset and settling are explicit immutable transitions', () => {
  const config = configured(), initial = jointReady(config)
  const accepted = transitionFinale(config, initial, { type: 'submit', proposal: config.answer }, 'victory-1')
  assert.equal(initial.status, 'ready'); assert.equal(accepted.status, 'revealing')
  assert.throws(() => transitionFinale(config, initial, { type: 'retry' }, 'bad'))
  assert.throws(() => transitionFinale(config, initial, { type: 'replay' }, 'bad'))
  assert.throws(() => transitionFinale(config, accepted, { type: 'replay' }, 'duplicate'))
  const success = settledFinale(accepted); assert.equal(success.status, 'success'); assert.equal(success.runId, accepted.runId)
  assert.deepEqual(settledFinale(success), success)
  const replay = transitionFinale(config, success, { type: 'replay' }, 'victory-2')
  assert.equal(replay.status, 'revealing'); assert.equal(replay.runId, 'victory-2')
  const muted = transitionFinale(config, replay, { type: 'sound', enabled: true }, 'sound')
  assert.equal(muted.runId, 'victory-2'); assert.equal(muted.status, 'revealing')
  const reset = transitionFinale(config, muted, { type: 'reset' }, 'cancelled')
  assert.equal(reset.status, 'ready'); assert.equal(reset.sound, true); assert.equal(reset.runId, 'cancelled')
  assert.equal(config.answer, configured().answer); assert.equal(config.secret, configured().secret)
})

test('finale progress can recover after reload but changed configuration invalidates it without containing a secret', () => {
  const config = configured(), progress = transitionFinale(config, jointReady(config), { type: 'submit', proposal: config.answer }, 'recoverable')
  const loaded = JSON.parse(JSON.stringify(progress))
  assert(validFinaleProgress(loaded)); assert.deepEqual(currentFinale(config, loaded), progress)
  assert.equal(settledFinale(loaded).status, 'success')
  const changed = { ...config, secret: 'Otro secreto de ensayo.' }
  assert.notEqual(finaleSignature(config), finaleSignature(changed))
  assert.equal(currentFinale(changed, loaded).status, 'ready')
  assert.equal(currentFinale(changed, loaded).runId, '')
  assert(!JSON.stringify(loaded).includes(config.answer)); assert(!JSON.stringify(loaded).includes(config.secret))
  for (const malformed of [undefined, null, {}, [], { ...loaded, runId: 'x'.repeat(161) }, { ...loaded, status: 'invalid' }, { ...loaded, signature: 1 }, { ...loaded, sound: 'true' }]) {
    assert.equal(validFinaleProgress(malformed), false)
    assert.equal(currentFinale(config, malformed).status, 'ready')
  }
})

test('legacy v2/v3/v4 profile reads add an empty finale only in memory and retain every prior field and original byte', () => {
  for (const version of [2, 3, 4]) {
    const current = createProfile('colegio'); current.teams[0].suggestedNames = []; current.challenges = [newChallenge()]
    current.challenges[0].description = 'Guion heredado íntegro\n' + 'Á'.repeat(3900)
    const old = { ...current, schemaVersion: version }; delete old.finale
    if (version === 2) delete old.challenges
    if (version === 3) old.challenges = old.challenges.map(({ publicInstruction, keyRule, ...challenge }) => challenge)
    const raw = JSON.stringify(old), storage = new MemoryStorage()
    storage.setItem(profileKey('colegio'), raw); initializeProfiles(storage)
    const snapshot = [...storage.data], normalized = readProfile(storage, 'colegio')
    assert.equal(normalized.schemaVersion, 5); assert.deepEqual(normalized.finale, emptyFinale())
    assert.deepEqual(normalized.teams, current.teams); assert.deepEqual(normalized.participants, current.participants)
    assert.deepEqual(normalized.media, current.media); assert.deepEqual(normalized.teams[0].suggestedNames, [])
    assert.equal(storage.getItem(profileKey('colegio')), raw); assert.deepEqual([...storage.data], snapshot)
    assert.equal(JSON.stringify(old), raw)
    if (version !== 2) { assert.equal(normalized.challenges[0].description, current.challenges[0].description); assert.equal(normalized.challenges[0].id, current.challenges[0].id) }
    assert.deepEqual(parseProfile(JSON.parse(exportProfile(normalized))), normalized)
  }
})

test('v5 finale configuration round trips independently per profile and never imports progress/results with JSON', () => {
  const storage = new MemoryStorage(); initializeProfiles(storage)
  const school = readProfile(storage, 'colegio'), urban = readProfile(storage, 'urbanizacion')
  const untouched = storage.getItem(profileKey('urbanizacion'))
  school.finale = configured(); saveProfile(storage, school, storage.getItem(profileKey('colegio')))
  const exported = exportProfile(school), imported = parseProfile(JSON.parse(exported))
  assert.equal(imported.schemaVersion, 5); assert.deepEqual(imported.finale, school.finale)
  assert.equal(storage.getItem(profileKey('urbanizacion')), untouched); assert.deepEqual(urban.finale, emptyFinale())
  const copy = cloneProfile(school); copy.finale.secret = 'Un cambio de borrador.'
  assert.notEqual(copy.finale.secret, school.finale.secret)
  const progress = transitionFinale(school.finale, jointReady(school.finale), { type: 'submit', proposal: school.finale.answer }, 'local-run')
  storage.setItem(presentationKey, JSON.stringify({ profileId: school.id, finales: { [school.id]: progress } }))
  assert.equal(exportProfile(readProfile(storage, school.id)), exported)
  assert(!exported.includes('local-run')); assert(!exported.includes('runId')); assert(!exported.includes('finales'))
  assert.throws(() => parseProfile({ ...school, finales: { colegio: progress } }), /desconocidos/)
  assert.throws(() => parseProfile({ ...school, results: {} }), /desconocidos/)
  const stale = storage.getItem(profileKey(school.id)); saveProfile(storage, copy, stale)
  assert.throws(() => saveProfile(storage, school, stale), /otra ventana/)
})

test('finale remains a stable terminal scene after the last visible challenge, with reversible navigation and no automatic result', () => {
  const config = createProfile('colegio'); config.challenges = [newChallenge(), newChallenge(), newChallenge()]
  config.challenges[1].visible = false
  const scenes = scenesFor(config), finale = scenes.at(-1), lastChallenge = scenes.at(-2)
  assert.equal(finale.id, 'finale'); assert.equal(finale.type, 'finale')
  assert.equal(lastChallenge.challengeId, config.challenges[2].id)
  assert.equal(adjacentScene(lastChallenge.id, 1, config).id, 'finale')
  assert.equal(adjacentScene('finale', -1, config).id, lastChallenge.id)
  assert.equal(adjacentScene('finale', 1, config), undefined)
  assert.deepEqual(config.finale, emptyFinale()); assert.equal(createFinaleProgress(config.finale).status, 'ready')
})

test('the two-clan ceremony waits for explicit confirmations, reveals cooperation after the second rejection and keeps joint retries in their act', () => {
  const config=configured();let progress=createFinaleProgress(config)
  const step=action=>{const previous=progress,before=structuredClone(progress);progress=transitionFinale(config,progress,action,crypto.randomUUID());assert(validFinaleProgress(progress));assert.deepEqual(previous,before);return progress}
  assert.equal(finaleHasProgress(progress),false);assert.equal(finaleCanAnswer(progress),false)
  assert.throws(()=>step({type:'submit',proposal:'OTRA'}),/turno/)
  step({type:'advance'});assert.equal(finaleTeamIndex(progress),0);assert.equal(progress.ceremonyPhase,'call1')
  step({type:'advance'});step({type:'clues',ready:false});assert.equal(progress.ceremonyPhase,'clues1');assert.equal(progress.cluesMissing,true)
  const waiting=JSON.stringify(progress);assert.equal(JSON.stringify(currentFinale(config,JSON.parse(waiting))),waiting,'Reload does not expire or advance a question')
  step({type:'clues',ready:true});assert.equal(progress.ceremonyPhase,'answer1');assert.equal(progress.cluesMissing,false)
  step({type:'submit',proposal:'OTRA'});assert.equal(progress.status,'rejecting');assert.equal(progress.ceremonyPhase,'answer1');assert.deepEqual(progress.attempts,[1,0,0])
  assert.throws(()=>step({type:'advance'}));progress=settledFinale(progress);assert.equal(progress.ceremonyPhase,'fail1')
  assert.throws(()=>step({type:'retry'}),'The first rejection cannot reveal the joint answer form')
  step({type:'advance'});assert.equal(progress.ceremonyPhase,'call2');assert.equal(finaleTeamIndex(progress),1)
  step({type:'advance'});step({type:'clues',ready:false});assert.equal(progress.ceremonyPhase,'clues2')
  step({type:'clues',ready:true});step({type:'submit',proposal:'TAMPOCO'});progress=settledFinale(progress)
  assert.equal(progress.ceremonyPhase,'fail2');assert.deepEqual(progress.attempts,[1,1,0])
  step({type:'advance'});assert.equal(progress.ceremonyPhase,'truth')
  step({type:'advance'});assert.equal(progress.ceremonyPhase,'captain');assert.equal(finaleTeamIndex(progress),null)
  step({type:'advance'});assert.equal(progress.ceremonyPhase,'words')
  assert.throws(()=>step({type:'submit',proposal:config.answer}))
  const board = structuredClone(progress.wordBoard)
  step({type:'advance'});assert.equal(progress.ceremonyPhase,'joint')
  step({type:'submit',proposal:'FALTA ALGO'});progress=settledFinale(progress);assert.equal(progress.ceremonyPhase,'jointFail')
  step({type:'retry'});assert.equal(progress.ceremonyPhase,'words');assert.deepEqual(progress.attempts,[1,1,1])
  assert.deepEqual(progress.wordBoard,board)
  step({type:'advance'})
  step({type:'submit',proposal:config.answer});assert.equal(progress.ceremonyPhase,'explosion');assert.equal(progress.status,'revealing')
  const restored=step({type:'restore'});assert.equal(restored.ceremonyPhase,'victory');assert.equal(restored.status,'success');assert.deepEqual(restored.attempts,[1,1,2])
  assert.throws(()=>step({type:'submit',proposal:config.answer}))
  step({type:'replay'});assert.equal(progress.status,'revealing');assert.deepEqual(progress.attempts,[1,1,2])
  step({type:'reset'});assert.equal(progress.ceremonyPhase,'intro');assert.deepEqual(progress.attempts,[0,0,0]);assert.equal(progress.earlyCorrect,false)
})

test('an unexpectedly correct individual answer is honored and summons the first captain without inventing failed attempts',()=>{
  const config=configured()
  for(const turn of [0,1]){
    let progress=firstAnswer(config)
    if(turn){progress=settledFinale(transitionFinale(config,progress,{type:'submit',proposal:'OTRA'},'fail1'));for(const action of [{type:'advance'},{type:'advance'},{type:'clues',ready:true}])progress=transitionFinale(config,progress,action,crypto.randomUUID())}
    progress=transitionFinale(config,progress,{type:'submit',proposal:config.answer},'early')
    assert.equal(progress.ceremonyPhase,'captain');assert.equal(progress.earlyCorrect,true);assert.equal(progress.status,'ready')
    assert.deepEqual(progress.attempts,turn?[1,1,0]:[1,0,0])
    assert.equal(finaleCanAnswer(progress),false);assert.throws(()=>transitionFinale(config,progress,{type:'retry'},'bad'))
    progress=transitionFinale(config,progress,{type:'advance'},'proclamation');assert.equal(progress.ceremonyPhase,'joint')
    progress=transitionFinale(config,progress,{type:'submit',proposal:config.answer},'earned');assert.equal(progress.status,'revealing')
  }
})

test('legacy finale progress is normalized only in memory, preserves earned results and rejects contradictory modern phases',()=>{
  const config=configured()
  for(const [status,phase] of [['ready','intro'],['failure','jointFail'],['rejecting','joint'],['revealing','explosion'],['success','victory']]){
    const old={runId:'historical',status,signature:finaleSignature(config),sound:true},raw=JSON.stringify(old)
    assert(validFinaleProgress(old));assert.equal(finaleCeremony(old),phase)
    const normalized=currentFinale(config,old);assert.equal(normalized.ceremonyPhase,phase);assert(validFinaleProgress(normalized));assert.equal(JSON.stringify(old),raw)
    assert.equal(normalized.runId,'historical');assert.equal(normalized.status,status)
  }
  const base=createFinaleProgress(config)
  for(const malformed of [{...base,ceremonyPhase:'truth',status:'success'},{...base,ceremonyPhase:'intro',status:'rejecting'},{...base,ceremonyPhase:'explosion',status:'ready'},{...base,attempts:[-1,0,0]},{...base,attempts:[0,0]},{...base,attempts:[1.5,0,0]},{...base,earlyCorrect:'yes'},{...base,cluesMissing:1}])assert.equal(validFinaleProgress(malformed),false)
})

test('finale roster uses every actual member, captain first and Spanish ordering without mutating configuration',()=>{
  const config=createProfile('colegio')
  assert(finalePreparationProblems(config).length>0)
  config.finale=configured();config.participants=[{id:'z',name:'Zoe'},{id:'a',name:'Álvaro'},{id:'b',name:'Bruno'},{id:'p',name:'Paz'}]
  config.teams.forEach((team,index)=>{team.name=`Clan ${index+1}`;team.color=index?'#55c4de':'#d36b3d';team.memberIds=index?['p']:['z','a','b'];team.captainId=index?'p':'z'})
  const original=JSON.stringify(config),roster=finaleRoster(config,0)
  assert.equal(finalePreparationProblems(config).length,0);assert.equal(roster.captain.id,'z');assert.deepEqual(roster.members.map(p=>p.name),['Zoe','Álvaro','Bruno'])
  assert.equal(JSON.stringify(config),original)
  config.teams[0].captainId='p';assert(finalePreparationProblems(config).some(problem=>problem.includes('capitán')))
  assert.equal(finaleRoster(config,0).captain,null)
})
