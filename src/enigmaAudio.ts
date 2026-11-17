export type EnigmaCue = 'charge' | 'awaken' | 'victory' | 'sparkle' | 'reject'

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
