import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { enigmaRevealMs, isEnigmaBusy, isEnigmaCorrect, prepareEnigmaText, readEnigmaSecret, type EnigmaPhase } from './enigma.ts'
import { createEnigmaAudio, type EnigmaCue } from './enigmaAudio.ts'

export function useEnigma() {
  const secret = shallowRef(readEnigmaSecret(window.location.hash))
  const phase = ref<EnigmaPhase>(secret.value.ok ? 'ready' : 'invalid'), proposal = ref(''), problem = ref('')
  const soundEnabled = ref(false), soundNotice = ref('')
  const runOrigin = ref<'answer' | 'replay'>('answer')
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  const reducedMotion = ref(media?.matches ?? false), audio = createEnigmaAudio()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let disposed = false, correctRun = false, soundRequest = 0
  const busy = computed(() => isEnigmaBusy(phase.value))
  const canRestart = computed(() => phase.value === 'success' || (runOrigin.value === 'replay' && busy.value))
  const solution = computed(() => secret.value.ok && (['revealing', 'celebrating', 'success'].includes(phase.value) || canRestart.value) ? secret.value.answer : '')
  const proposalDisplay = computed(() => prepareEnigmaText(proposal.value) || '')
  const error = computed(() => secret.value.ok ? '' : secret.value.error)
  function stop() { timers.forEach(clearTimeout); timers.clear(); audio.stop() }
  function later(ms: number, action: () => void) {
    const timer = setTimeout(() => { timers.delete(timer); if (!disposed) action() }, ms)
    timers.add(timer)
  }
  function sound(cue: EnigmaCue) {
    if (!soundEnabled.value) return
    try { audio.play(cue) }
    catch {
      soundEnabled.value = false; audio.stop()
      soundNotice.value = 'El sonido se ha interrumpido. La experiencia visual continúa.'
    }
  }
  function settle() { phase.value = correctRun ? 'success' : 'failure'; sound(correctRun ? 'victory' : 'reject') }
  function start(correct: boolean, replaying = false) {
    stop(); correctRun = correct; problem.value = ''
    runOrigin.value = replaying ? 'replay' : 'answer'
    if (reducedMotion.value) { settle(); return }
    phase.value = 'charging'; sound('charge')
    later(700, () => {
      if (!correctRun) {
        audio.stop(); phase.value = 'collapsing'; sound('reject')
        later(600, () => {
          phase.value = 'extinguishing'
          later(650, () => {
            phase.value = 'falling'
            later(950, () => { audio.stop(); phase.value = 'failure' })
          })
        })
        return
      }
      phase.value = 'awakening'; sound('awaken')
      later(850, () => {
        phase.value = 'revealing'
        later(enigmaRevealMs(solution.value.length), () => {
          phase.value = 'celebrating'; sound('victory')
          later(950, () => sound('sparkle'))
          later(1950, () => sound('sparkle'))
          later(3200, () => { audio.stop(); phase.value = 'success' })
        })
      })
    })
  }
  function submit() {
    if (disposed || busy.value || phase.value !== 'ready' || !secret.value.ok) return
    if (!prepareEnigmaText(proposal.value)) {
      problem.value = 'Escribid una palabra o expresión de hasta 48 letras y espacios. Se admiten tildes y Ñ.'
      return
    }
    start(isEnigmaCorrect(proposal.value, secret.value))
  }
  function retry() {
    if (phase.value !== 'failure' || disposed) return
    resetToReady()
  }
  function resetToReady() {
    stop(); runOrigin.value = 'answer'; correctRun = false
    proposal.value = ''; problem.value = ''; phase.value = 'ready'
  }
  function restart() { if (!disposed && canRestart.value) resetToReady() }
  function replay() { if (phase.value === 'success' && !disposed) start(true, true) }
  async function toggleSound() {
    const request = ++soundRequest
    if (soundEnabled.value) { soundEnabled.value = false; audio.stop(); return }
    const enabled = await audio.unlock()
    if (disposed || request !== soundRequest) return
    soundEnabled.value = enabled
    soundNotice.value = enabled ? '' : 'El sonido no está disponible. La experiencia visual continúa.'
  }
  function updateHash() {
    stop(); runOrigin.value = 'answer'; secret.value = readEnigmaSecret(window.location.hash); proposal.value = ''; problem.value = ''
    phase.value = secret.value.ok ? 'ready' : 'invalid'
  }
  function updateMotion() {
    reducedMotion.value = media?.matches ?? false
    if (reducedMotion.value && busy.value) { stop(); settle() }
  }
  onMounted(() => {
    window.addEventListener('hashchange', updateHash)
    media?.addEventListener('change', updateMotion)
  })
  onUnmounted(() => {
    disposed = true; soundRequest++; stop(); audio.dispose()
    window.removeEventListener('hashchange', updateHash)
    media?.removeEventListener('change', updateMotion)
  })
  return { phase, proposal, proposalDisplay, busy, solution, error, problem, reducedMotion, soundEnabled, soundNotice, canRestart, submit, retry, replay, restart, toggleSound }
}
