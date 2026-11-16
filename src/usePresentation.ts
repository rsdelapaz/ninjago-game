import { computed, onUnmounted, ref } from 'vue'
import { ceremonyProblems, isProfileId, profileIds, type GameProgress, type ProfileConfig, type ProfileId } from './profile.ts'
import { initializeProfiles, profileKey, presentationKey, readProfile, withLocalWrite } from './profileStorage.ts'
import { applyCeremony, applyProfileReset, ceremonyKey, readCeremony, recoverCeremony, type ProfileResetRequest } from './ceremonyStorage.ts'
import { ceremonyFinalProblems, type CeremonyAction, type CeremonyProgress } from './ceremony.ts'
import { orderedScenes, sceneById } from './scenes.ts'
import { changeReveal, createReveal, revealPlan, validReveal, type RevealState, type RevealAction } from './reveal.ts'
import { readResults, saveResult, resultsKey, type ChallengeResults } from './challengeResults.ts'
export type Scene = string
export type PresentationState = Omit<GameProgress, 'profileId'> & { profileId: ProfileId | null; reveal?: RevealState; announcement?: { challengeId: string; winner: string }; imageView?: { challengeId: string; expanded: boolean } }
const key = presentationKey
function valid(value: unknown): value is PresentationState {
  if (!value || typeof value !== 'object') return false
  const s = value as PresentationState
  return isProfileId(s.profileId) && typeof s.sceneId === 'string' && s.sceneId.length <= 160 && Number.isSafeInteger(s.revision) && s.revision >= 0 && typeof s.token === 'string' && (s.reveal === undefined || validReveal(s.reveal)) && (s.imageView === undefined || !!s.imageView && typeof s.imageView.challengeId === 'string' && s.imageView.challengeId.length <= 120 && typeof s.imageView.expanded === 'boolean')
}
export function usePresentation() {
  const state = ref<PresentationState>({ profileId: null, sceneId: orderedScenes[0].id, revision: 0, token: '' })
  const profile = ref<ProfileConfig | null>(null), ceremony = ref<CeremonyProgress | null>(null)
  const results = ref<ChallengeResults>({}), resultsVersion = ref<string | null>(null)
  const warning = ref(''), busy = ref(false)
  let controlBaseline: string | null = null, configBaseline: string | null = null, ceremonyBaseline: string | null = null
  let disposed = false, channel: BroadcastChannel | undefined
  const report = (e: unknown) => { warning.value = e instanceof Error ? e.message : 'No se ha podido guardar. Conserva tus datos y recarga.' }
  function refreshProfile() {
    try {
      controlBaseline = localStorage.getItem(key)
      const saved: unknown = JSON.parse(controlBaseline || 'null')
      if (!valid(saved)) return
      const id = saved.profileId!
      const config = readProfile(localStorage, id), progress = readCeremony(localStorage, id)
      configBaseline = localStorage.getItem(profileKey(id)); ceremonyBaseline = localStorage.getItem(ceremonyKey(id))
      profile.value = config; ceremony.value = progress; state.value = saved; results.value = readResults(localStorage, config); resultsVersion.value = localStorage.getItem(resultsKey(id))
      // An edited/imported setup cannot leave the public display on an unearned final video.
      try { checkScene(saved.sceneId, config, progress) }
      catch (e) { state.value = { ...saved, sceneId: 'intro', announcement: undefined }; report(e) }
    } catch (e) { report(e) }
  }
  const initialized = withLocalWrite(() => {
    if (disposed) return
    initializeProfiles(localStorage)
    profileIds.forEach(id => recoverCeremony(localStorage, id))
    refreshProfile()
  }).catch(report)
  try { channel = new BroadcastChannel(key); channel.onmessage = () => refreshProfile() }
  catch { /* Same-origin storage events remain available. */ }
  const storage = (event: StorageEvent) => {
    const id = state.value.profileId
    if (event.key === key || id && [profileKey(id), ceremonyKey(id), resultsKey(id)].includes(event.key || '')) refreshProfile()
  }
  window.addEventListener('storage', storage)
  function checkCurrent(expected: string | null) {
    if (localStorage.getItem(key) !== expected) throw Error('Otra ventana cambió la presentación. Revisa la fase actual antes de volver a confirmar.')
  }
  function checkScene(sceneId: string, config: ProfileConfig, progress: CeremonyProgress) {
    if (!sceneById(sceneId, config)) throw Error('La prueba ya no está visible o disponible. La pantalla ha vuelto a la portada; elige otra escena.')
    if (sceneId === 'ceremony') {
      const errors = ceremonyProblems(config); if (errors.length) throw Error(errors.join(' '))
    }
    if (sceneId === 'wu') {
      const errors = ceremonyFinalProblems(config, progress)
      if (!['ready', 'complete'].includes(progress.phase) || errors.length) throw Error('Completa la ceremonia antes de mostrar el vídeo. ' + errors.join(' '))
    }
  }
  function nextControl(sceneId: string, id: ProfileId): GameProgress & { reveal: RevealState } {
    return { profileId: id, sceneId, revision: Math.max(Date.now(), state.value.revision + 1), token: Array.from(crypto.getRandomValues(new Uint32Array(2))).join('-'), reveal: sceneId === 'ceremony' && state.value.sceneId === sceneId && state.value.profileId === id && state.value.reveal ? { ...state.value.reveal } : createReveal(Date.now()) }
  }
  function writeControl(sceneId: string, id: ProfileId, reveal?: RevealState, announcement?: PresentationState['announcement'], imageView?: PresentationState['imageView']) {
    const next: PresentationState = nextControl(sceneId, id)
    if (reveal) next.reveal = reveal; if (announcement) next.announcement = announcement
    if (imageView) next.imageView = imageView
    localStorage.setItem(key, JSON.stringify(next))
    refreshProfile(); channel?.postMessage(next) // no participant names in channel messages
  }
  async function run(write: () => void) {
    if (busy.value) return false
    busy.value = true
    try { await initialized; await withLocalWrite(write); warning.value = ''; return true }
    catch (e) { refreshProfile(); report(e); return false }
    finally { busy.value = false }
  }
  function publish(sceneId: string, id: ProfileId) {
    const expected = controlBaseline
    return run(() => {
      checkCurrent(expected)
      recoverCeremony(localStorage, id)
      checkScene(sceneId, readProfile(localStorage, id), readCeremony(localStorage, id))
      writeControl(sceneId, id)
    })
  }
  function select(sceneId: string) { if (state.value.profileId) return publish(sceneId, state.value.profileId) }
  // The profile's ceremony is preserved; choose its catalogue entry to resume it.
  function selectProfile(id: ProfileId) { return publish('intro', id) }
  function actCeremony(action: CeremonyAction) {
    const id = state.value.profileId, expected = controlBaseline, config = configBaseline, progress = ceremonyBaseline
    if (!id || !config || state.value.sceneId !== 'ceremony') return
    return run(() => {
      checkCurrent(expected)
      const result = applyCeremony(localStorage, id, config, progress, action)
      writeControl(result.progress.phase === 'complete' ? 'wu' : 'ceremony', id, result.progress.phase !== ceremony.value?.phase ? createReveal(Date.now()) : undefined)
    })
  }
  function actReveal(action: RevealAction) {
    const id = state.value.profileId, expected = controlBaseline
    if (!id || state.value.sceneId !== 'ceremony' || !['arrival','ready','complete'].includes(ceremony.value?.phase || '')) return
    return run(() => {
      checkCurrent(expected)
      const config = readProfile(localStorage, id)
      const next = changeReveal(state.value.reveal || createReveal(state.value.revision), action, revealPlan(config).count, Date.now())
      writeControl('ceremony', id, next)
    })
  }
  function recordResult(challengeId: string, winner: string | null, reviewed = resultsVersion.value, reviewedProfile = state.value.profileId) {
    const id = state.value.profileId, expected = controlBaseline, config = configBaseline
    if (!id || id !== reviewedProfile) return Promise.resolve(false)
    return run(() => {
      checkCurrent(expected)
      if (localStorage.getItem(profileKey(id)) !== config) throw Error('La configuración cambió. Revisa la prueba antes de guardar su resultado.')
      saveResult(localStorage, readProfile(localStorage, id), challengeId, winner, reviewed)
      refreshProfile(); channel?.postMessage({ profileId: id })
    })
  }
  function setImageExpanded(challengeId: string, expanded: boolean) {
    const id = state.value.profileId, expected = controlBaseline
    if (!id || state.value.sceneId !== `challenge:${challengeId}` || state.value.announcement) return Promise.resolve(false)
    return run(() => {
      checkCurrent(expected)
      const config = readProfile(localStorage, id), sceneId = `challenge:${challengeId}`
      checkScene(sceneId, config, readCeremony(localStorage, id))
      if (expanded && !config.challenges.find(c => c.id === challengeId)?.imageFilename) throw Error('Configura una imagen para ampliar esta prueba.')
      writeControl(sceneId, id, undefined, undefined, { challengeId, expanded })
    })
  }
  function announceResult(challengeId: string, expectedWinner: string) {
    const id = state.value.profileId, expected = controlBaseline
    if (!id) return Promise.resolve(false)
    return run(() => {
      checkCurrent(expected)
      const config = readProfile(localStorage, id), winner = readResults(localStorage, config)[challengeId]
      if (!winner || winner !== expectedWinner) throw Error('El resultado cambió. Revisa antes de anunciarlo.')
      const sceneId = `challenge:${challengeId}`
      checkScene(sceneId, config, readCeremony(localStorage, id))
      writeControl(sceneId, id, undefined, { challengeId, winner })
    })
  }
  function resetProfile(request: ProfileResetRequest): Promise<boolean> {
    const expected = request.expectedControl
    return run(() => {
      checkCurrent(expected)
      if (state.value.profileId !== request.profileId) throw Error('El perfil que quieres restablecer ya no es el activo.')
      const next = nextControl('intro', request.profileId)
      applyProfileReset(localStorage, request, next)
      refreshProfile(); channel?.postMessage(next)
    })
  }
  onUnmounted(() => { disposed = true; channel?.close(); window.removeEventListener('storage', storage) })
  const activeScene = computed(() => sceneById(state.value.sceneId, profile.value) || orderedScenes[0]!)
  const reveal = computed(() => state.value.reveal || createReveal(state.value.revision))
  const imageExpanded = computed(() => state.value.imageView?.challengeId === activeScene.value.challengeId && state.value.imageView?.expanded === true && !state.value.announcement)
  return { state, profile, ceremony, reveal, results, resultsVersion, recordResult, announceResult, imageExpanded, setImageExpanded, busy, activeScene, select, selectProfile, actCeremony, actReveal, resetProfile, refreshProfile, warning, initialized }
}
