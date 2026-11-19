<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createEnigmaAudio } from './enigmaAudio'
import './trials-opening.css'

const props = defineProps<{ preview?: boolean; busy?: boolean; advance?: () => Promise<boolean> }>()
const artwork = `${import.meta.env.BASE_URL}private-media/finale-sanctuary.png`
const heading = ref<HTMLHeadingElement | null>(null)
const artworkFailed = ref(false)
const sound = ref(false), unlocking = ref(false), soundNotice = ref('')
const moving = ref(false), navigationNotice = ref('')
const audio = props.preview ? undefined : createEnigmaAudio()
let mounted = true

onMounted(() => { if (!props.preview) heading.value?.focus({ preventScroll: true }) })
onUnmounted(() => { mounted = false; audio?.dispose() })

async function toggleSound() {
  if (!audio || unlocking.value) return
  if (sound.value) {
    audio.stop()
    sound.value = false
    return
  }
  unlocking.value = true
  try {
    // Resume from the actual click and leave video playback under native controls.
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
    if (!await audio.unlock()) throw Error('Audio unavailable')
    if (!mounted) return
    audio.play('trials')
    sound.value = true
    soundNotice.value = ''
  } catch {
    audio.stop()
    if (mounted) soundNotice.value = 'La escena continúa sin sonido.'
  } finally {
    unlocking.value = false
  }
}

async function continueToTrial() {
  if (moving.value || props.busy || !props.advance) return
  moving.value = true
  navigationNotice.value = ''
  try {
    if (!await props.advance() && mounted) navigationNotice.value = 'El recorrido ha cambiado. Pide al organizador que revise las pruebas.'
  } finally {
    moving.value = false
  }
}
</script>

<template>
  <component :is="preview ? 'div' : 'main'" class="trials-opening" :class="{ 'trials-preview': preview }"
    :aria-label="preview ? 'Vista previa de El despertar de las pruebas' : undefined">
    <img v-if="!artworkFailed" class="trials-sanctuary" :src="artwork" alt="" @error="artworkFailed = true">
    <div class="trials-energy trials-fire" aria-hidden="true"></div>
    <div class="trials-energy trials-ice" aria-hidden="true"></div>
    <div class="trials-seal" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="trials-wave" aria-hidden="true"></div>
    <div class="trials-embers" aria-hidden="true">
      <i v-for="n in 18" :key="n" :style="{ '--spark': n }"></i>
    </div>
    <div class="trials-content">
      <div class="trials-inscription">
        <component :is="preview ? 'p' : 'h1'" ref="heading" class="trials-title" :tabindex="preview ? undefined : -1">¿ESTÁIS<br>PREPARADOS?</component>
      </div>
      <div class="trials-action">
        <span v-if="preview" class="trials-continue"><span>CONTINUAR</span></span>
        <button v-else type="button" class="trials-continue" :disabled="busy || moving" @click="continueToTrial"><span>CONTINUAR</span></button>
        <p v-if="navigationNotice" class="trials-notice" role="alert">{{ navigationNotice }}</p>
      </div>
    </div>
    <div v-if="!preview" class="trials-audio">
      <button type="button" :disabled="unlocking" :aria-pressed="sound" @click="toggleSound">{{ sound ? 'Silenciar escena' : 'Activar sonido' }}</button>
      <p v-if="soundNotice" class="trials-notice" role="status">{{ soundNotice }}</p>
    </div>
  </component>
</template>
