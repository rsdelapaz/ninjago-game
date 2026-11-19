import { ref, watch } from 'vue'

type MusicStatus = 'idle' | 'starting' | 'playing' | 'unavailable'

export function useIntroMusic(active: () => boolean, src: string) {
  const status = ref<MusicStatus>('idle')
  let audio: HTMLAudioElement | undefined
  let silenced = false
  let attempt = 0

  async function play() {
    const track = audio
    if (!track || status.value === 'unavailable') return
    const current = ++attempt
    status.value = 'starting'
    try {
      // play() must run in the original click for browsers that require activation.
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
      await track.play()
      if (current === attempt) status.value = 'playing'
    } catch (error) {
      if (current !== attempt) return
      status.value = error instanceof DOMException && error.name === 'NotAllowedError' ? 'idle' : 'unavailable'
    }
  }

  function toggleMusic() {
    if (!audio || status.value === 'unavailable') return
    silenced = status.value === 'playing' || status.value === 'starting'
    if (silenced) {
      ++attempt
      audio.pause()
      status.value = 'idle'
    } else {
      void play()
    }
  }

  // Pause before Vue renders the next scene or starts the exit animation.
  // https://vuejs.org/guide/essentials/watchers.html#sync-watchers
  watch(active, (enabled, _, onCleanup) => {
    if (!enabled) return
    const track = new Audio()
    audio = track
    track.loop = true
    track.volume = 0.3
    const failed = () => {
      ++attempt
      track.pause()
      status.value = 'unavailable'
    }
    track.addEventListener('error', failed)
    onCleanup(() => {
      ++attempt
      audio = undefined
      track.removeEventListener('error', failed)
      track.pause()
      track.removeAttribute('src')
      track.load()
      status.value = 'idle'
    })
    track.preload = silenced ? 'none' : 'auto'
    track.src = src
    if (!silenced) void play()
  }, { immediate: true, flush: 'sync' })

  return { musicStatus: status, toggleMusic }
}
