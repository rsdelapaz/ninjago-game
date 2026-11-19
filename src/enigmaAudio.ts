export type EnigmaCue = 'charge' | 'awaken' | 'victory' | 'sparkle' | 'reject' | 'trials'

// A low impact, a rising seal and a gold chime, scheduled on the audio clock.
const trialsVoices = [
  { frequency: 86, target: 40, offset: 0, duration: .82, peak: .13, attack: .025, shape: 'triangle' },
  { frequency: 98, target: 196, offset: .16, duration: 1.45, peak: .07, attack: .65, shape: 'sine' },
  { frequency: 147, target: 294, offset: .32, duration: 1.56, peak: .045, attack: .8, shape: 'triangle' },
  { frequency: 392, target: 392, offset: 1.45, duration: 1.16, peak: .075, attack: .06, shape: 'sine' },
  { frequency: 587.33, target: 587.33, offset: 1.61, duration: 1.2, peak: .045, attack: .035, shape: 'sine' },
  { frequency: 783.99, target: 783.99, offset: 2.02, duration: 1.25, peak: .037, attack: .045, shape: 'sine' },
] satisfies { frequency: number; target: number; offset: number; duration: number; peak: number; attack: number; shape: OscillatorType }[]

// Original synthesized effects. Construct/resume only from an explicit user gesture.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
export function createEnigmaAudio() {
  let context: AudioContext | undefined, disposed = false
  const voices = new Set<OscillatorNode>()
  async function unlock() {
    try {
      if (disposed || typeof globalThis.AudioContext !== 'function') return false
      context ??= new AudioContext()
      await context.resume()
      return !disposed && context.state === 'running'
    } catch { return false } // Sound is optional, never a prerequisite to reveal.
  }
  function stop() {
    for (const voice of voices) { try { voice.stop() } catch { /* Already ended. */ } voice.disconnect() }
    voices.clear()
  }
  function play(cue: EnigmaCue) {
    if (disposed || !context || context.state !== 'running') return
    const ctx = context, now = ctx.currentTime
    if (cue === 'trials') {
      trialsVoices.forEach(({ frequency, target, offset, duration, peak, attack, shape }) => {
        const start = now + offset, end = start + duration
        const voice = ctx.createOscillator(), gain = ctx.createGain()
        voice.type = shape
        voice.frequency.setValueAtTime(frequency, start)
        voice.frequency.exponentialRampToValueAtTime(target, end)
        gain.gain.setValueAtTime(.0001, start)
        gain.gain.exponentialRampToValueAtTime(peak, start + attack)
        gain.gain.exponentialRampToValueAtTime(.0001, end)
        voice.connect(gain); gain.connect(ctx.destination); voices.add(voice)
        voice.onended = () => { voices.delete(voice); voice.disconnect(); gain.disconnect() }
        voice.start(start); voice.stop(end + .02)
      })
      return
    }
    const notes = cue === 'sparkle' ? [783.99, 1046.5] : cue === 'victory' ? [261.63, 329.63, 392, 523.25] : cue === 'awaken' ? [196, 392, 587.33] : cue === 'reject' ? [73.42, 55, 41.2] : [98, 196]
    notes.forEach((frequency, i) => {
      const voice = ctx.createOscillator(), gain = ctx.createGain()
      const start = now + i * .09, end = start + (cue === 'victory' ? .8 : .5)
      voice.type = cue === 'reject' ? 'triangle' : 'sine'; voice.frequency.setValueAtTime(frequency, start)
      if (cue === 'charge') voice.frequency.exponentialRampToValueAtTime(frequency * 2, end)
      if (cue === 'reject') voice.frequency.exponentialRampToValueAtTime(frequency * .65, end)
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.035, start + .06)
      gain.gain.exponentialRampToValueAtTime(.0001, end)
      voice.connect(gain); gain.connect(ctx.destination); voices.add(voice)
      voice.onended = () => { voices.delete(voice); voice.disconnect(); gain.disconnect() }
      voice.start(start); voice.stop(end + .02)
    })
  }
  function dispose() { disposed = true; stop(); void context?.close().catch(() => {}) }
  return { unlock, play, stop, dispose }
}
