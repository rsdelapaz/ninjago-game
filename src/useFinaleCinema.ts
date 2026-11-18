import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import type { FinaleProgress } from './finale.ts'
import { createFinaleParticles } from './finaleParticles.ts'

export type FinaleCinemaPhase = 'ready' | 'anticipation' | 'symbols' | 'convergence' | 'acceleration' | 'burst' | 'opening' | 'phrase' | 'secret' | 'success' | 'destabilizing' | 'failure'
export function recoveredFinalePhase(status: FinaleProgress['status'], preview = false): FinaleCinemaPhase {
  if (preview) return 'ready'
  return status === 'revealing' ? 'success' : status === 'rejecting' ? 'failure' : status
}
type Source = { progress: FinaleProgress; preview?: boolean; colors: [string, string] }

/** A persisted command starts one local execution; mounting only restores its outcome. */
export function useFinaleCinema(root: Ref<HTMLElement | null>, canvas: Ref<HTMLCanvasElement | null>, source: () => Source, finish: (runId: string) => void, cue: (name: 'gather' | 'burst' | 'reject') => void) {
  const phase = ref<FinaleCinemaPhase>('ready'), reducedMotion = ref(false), canvasAvailable = ref(true)
  let mounted = false, generation = 0, context: gsap.Context | undefined, timeline: gsap.core.Timeline | undefined
  let particles: ReturnType<typeof createFinaleParticles> | undefined
  let currentRun = '', finishedRun = ''
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  function cancel() {
    generation++; timeline?.kill(); timeline = undefined; context?.revert(); context = undefined; particles?.clear()
  }
  function complete() {
    const state = source()
    phase.value = recoveredFinalePhase(state.progress.status, !!state.preview)
    particles?.clear()
    if (!state.preview && ['revealing', 'rejecting'].includes(state.progress.status) && finishedRun !== state.progress.runId) {
      finishedRun = state.progress.runId; finish(state.progress.runId)
    }
  }
  function changePhase(value: FinaleCinemaPhase) { phase.value = value }
  async function awakenLetters(run: number) {
    await nextTick()
    if (!mounted || generation !== run || !root.value || !context) return
    context.add(() => {
      const letters = root.value!.querySelectorAll('.finale-glyph')
      return gsap.fromTo(letters, { opacity: 0, y: 18, rotateX: -45 }, { opacity: 1, y: 0, rotateX: 0, duration: .65, stagger: Math.min(.018, 1.3 / Math.max(1, letters.length)), ease: 'power3.out' })
    })
  }
  async function unfoldParchment(run: number) {
    await nextTick()
    if (!mounted || generation !== run || !root.value || !context) return
    context.add(() => {
      gsap.fromTo('.finale-parchment', { opacity: 0, y: 12, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .4, ease: 'power3.out' })
      gsap.fromTo('.finale-parchment header,.finale-wu-closing', { opacity: 0 }, { opacity: 1, duration: .35, delay: .15, stagger: .08 })
    })
  }
  function execute() {
    cancel()
    if (!root.value || source().preview || reducedMotion.value) { complete(); return }
    const command = source().progress
    if (!['revealing', 'rejecting'].includes(command.status)) { complete(); return }
    const run = generation
    phase.value = command.status === 'revealing' ? 'anticipation' : 'destabilizing'
    context = gsap.context(() => {
      const secondClan = command.ceremonyPhase === 'answer2', jointAttempt = command.ceremonyPhase === 'joint'
      const sector = secondClan ? '.finale-seal-right' : '.finale-seal-left'
      const fracture = secondClan ? '.finale-fracture-right' : '.finale-fracture-left'
      const stream = secondClan ? '.finale-stream-right' : '.finale-stream-left'
      const failureDuration = secondClan ? 5.5 : 3.5
      let particleMode: 'convergence' | 'burst' | 'fall' | null = null, particleStart = 0
      const clock = { value: 0 }
      timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onUpdate: () => {
        if (particleMode) particles?.draw(clock.value - particleStart, particleMode, secondClan ? 1 : 0)
      }, onComplete: () => { particles?.clear(); complete() } })
      if (command.status === 'rejecting') {
        timeline.addLabel('pulse', 0).call(() => cue('reject'), [], 'pulse')
          .fromTo('.finale-ignition', { opacity: 0, scale: .8 }, { opacity: secondClan ? .38 : .24, scale: 1.05, duration: .65 }, 'pulse')
          .fromTo(sector, { opacity: .2 }, { opacity: .85, duration: .65 }, 'pulse')
          .addLabel('fracture', .65).to('.finale-sigil', { rotation: secondClan ? 2 : 1, duration: .25 }, 'fracture')
          .to('.finale-sigil', { rotation: -1, duration: .3 }).to('.finale-sigil', { rotation: 0, duration: .4 })
          .fromTo(fracture, { opacity: 0, scaleY: .25 }, { opacity: .9, scaleY: 1, duration: .8, ease: 'power1.out' }, 'fracture')
          .to(sector, { opacity: .08, duration: 1.2 }, 1.1)
          .to(jointAttempt ? '.finale-clan-stream' : stream, { opacity: .12, scale: .88, duration: 1.5 }, 1)
          .to('.finale-ignition', { opacity: 0, duration: 1.1 }, 1.3)
          .call(() => { particleMode = 'fall'; particleStart = 1.4 }, [], 1.4)
          .to(fracture, { opacity: .12, duration: 1.1 }, 1.8)
          .addLabel('extinguished', 2.6).to('.finale-cinematic-shade', { opacity: secondClan ? .67 : .4, duration: secondClan ? 1.7 : .7 }, 'extinguished')
          .to(clock, { value: failureDuration, duration: failureDuration, ease: 'none' }, 0)
        if (secondClan) {
          timeline.to('.finale-sanctuary', { scale: 1.055, duration: 4.8, ease: 'power1.inOut' }, .5)
            .to('.finale-seal-left,.finale-seal-right,.finale-clan-stream', { opacity: .08, duration: 1.5 }, 2.5)
            .to('.finale-wu', { opacity: .35, duration: 1.5 }, 2.8)
        }
      } else {
        timeline.addLabel('silence', 0).to('.finale-cinematic-shade', { opacity: .48, duration: .8 }, 'silence')
          .to('.finale-wu', { opacity: .24, duration: 1.2 }, 'silence')
          .to('.finale-sanctuary', { scale: 1.055, duration: 11.2, ease: 'power1.inOut' }, 0)
          .addLabel('symbols', 1.1).call(() => { changePhase('symbols'); cue('gather') }, [], 'symbols')
          .fromTo('.finale-seal-left,.finale-seal-right', { opacity: .08 }, { opacity: .9, duration: 2, stagger: .45, immediateRender: false }, 'symbols')
          .to('.finale-fracture-left,.finale-fracture-right', { opacity: .7, duration: 1.7 }, 'symbols')
          .fromTo('.finale-rune', { opacity: .12 }, { opacity: 1, duration: 1.4, stagger: .08, immediateRender: false }, 'symbols')
          .addLabel('convergence', 3.7).call(() => { changePhase('convergence'); particleMode = 'convergence'; particleStart = 3.7 }, [], 'convergence')
          .to('.finale-stream-left', { xPercent: 27, scale: .83, opacity: 1, duration: 3.4 }, 'convergence')
          .to('.finale-stream-right', { xPercent: -27, scale: .83, opacity: 1, duration: 3.4 }, 'convergence')
          .addLabel('acceleration', 7.3).call(() => changePhase('acceleration'), [], 'acceleration')
          .to('.finale-sigil', { rotation: 35, scale: 1.06, duration: 1.3, ease: 'power2.in' }, 'acceleration')
          .to('.finale-ignition', { opacity: .62, duration: 1.3 }, 'acceleration')
          .addLabel('burst', 8.6).call(() => { changePhase('burst'); cue('burst'); particleMode = 'burst'; particleStart = 8.6 }, [], 'burst')
          .fromTo('.finale-wave', { scale: .35, opacity: .5 }, { scale: 2.4, opacity: 0, duration: 2.2, ease: 'power3.out', immediateRender: false }, 'burst')
          .to('.finale-ignition', { opacity: .7, scale: 1.3, duration: .7 }, 'burst')
          .fromTo('.finale-wave-outer', { scale: .2, opacity: .35 }, { scale: 3.2, opacity: 0, duration: 2.7, ease: 'power2.out', immediateRender: false }, 8.95)
          .to('.finale-ignition', { opacity: .28, scale: 1.1, duration: 1.5 }, 9.3)
          .addLabel('opening', 10.7).call(() => changePhase('opening'), [], 'opening')
          .fromTo('.finale-door-light', { scaleX: .015, opacity: 0 }, { scaleX: 1, opacity: .8, duration: 1.5, ease: 'power2.out', immediateRender: false }, 'opening')
          .to('.finale-seal-left', { xPercent: -78, rotationY: -24, opacity: .18, duration: 1.8 }, 'opening')
          .to('.finale-seal-right', { xPercent: 78, rotationY: 24, opacity: .18, duration: 1.8 }, 'opening')
          .fromTo('.finale-chamber', { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, immediateRender: false }, 'opening')
          .to('.finale-sigil', { scale: 1.18, opacity: .2, rotation: 45, duration: 1.4 }, 'opening')
          .to('.finale-cinematic-shade', { opacity: .18, duration: 1.2 }, 'opening')
          .addLabel('phrase', 11.2).call(() => { changePhase('phrase'); void awakenLetters(run) }, [], 'phrase')
          .call(() => { particleMode = null; particles?.clear() }, [], 12.1)
          .addLabel('secret', 13.3).call(() => { changePhase('secret'); void unfoldParchment(run) }, [], 'secret')
          .to('.finale-door-light', { opacity: .28, duration: 1.5 }, 'secret')
          .to(clock, { value: 15, duration: 15, ease: 'none' }, 0)
      }
      // Preserve cue order and cancellation in a four-second climax.
      // https://gsap.com/docs/v3/GSAP/Timeline/timeScale()/
      timeline.timeScale(command.status === 'revealing' ? 15 / 4 : 1).play(0)
    }, root.value)
  }
  function updateMotion() {
    reducedMotion.value = media?.matches ?? false
    if (reducedMotion.value && timeline?.isActive()) { cancel(); complete() }
  }
  function resize() { particles?.resize() }
  watch(() => [source().progress.runId, source().progress.status, source().progress.signature, source().preview] as const, () => {
    if (!mounted) return
    const command = source().progress
    if (command.runId !== currentRun && !source().preview) { currentRun = command.runId; execute() }
    else if (!['revealing', 'rejecting'].includes(command.status) || source().preview) { cancel(); complete() }
  }, { flush: 'post' })
  onMounted(() => {
    mounted = true; reducedMotion.value = media?.matches ?? false; currentRun = source().progress.runId
    particles = createFinaleParticles(canvas.value, () => source().colors); canvasAvailable.value = particles.available; resize()
    media?.addEventListener('change', updateMotion); window.addEventListener('resize', resize)
    complete()
  })
  onUnmounted(() => {
    mounted = false; cancel(); particles?.dispose(); media?.removeEventListener('change', updateMotion); window.removeEventListener('resize', resize)
  })
  return { phase, reducedMotion, canvasAvailable }
}
