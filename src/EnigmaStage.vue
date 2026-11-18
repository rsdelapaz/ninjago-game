<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { MAX_ENIGMA_INPUT } from './enigma'
import { useEnigma } from './useEnigma'
import './enigma.css'

const { phase, proposal, proposalDisplay, busy, solution, error, problem, reducedMotion, soundEnabled, soundNotice, canRestart, submit, retry, replay, restart, toggleSound } = useEnigma()
const stage = ref<HTMLElement | null>(null), heading = ref<HTMLHeadingElement | null>(null), input = ref<HTMLInputElement | null>(null)
const fullscreen = ref(false), fullscreenNotice = ref('')
const fullscreenAvailable = typeof document !== 'undefined' && document.fullscreenEnabled === true
const artworkReady = ref(false), artworkFailed = ref(false)
const artworkUrl = `${import.meta.env.BASE_URL}private-media/enigma-sanctuary.png`
const victorious = computed(() => ['celebrating', 'success'].includes(phase.value))
const defeated = computed(() => ['collapsing', 'extinguishing', 'falling', 'failure'].includes(phase.value))
const title = computed(() => defeated.value ? '¡EL ENIGMA NO HA SIDO RESUELTO!' : victorious.value ? '¡EL ENIGMA HA SIDO RESUELTO!' : 'EL DESPERTAR DEL ENIGMA')
const words = computed(() => {
  let order = 0
  return (solution.value || proposalDisplay.value).split(' ').filter(Boolean).map(word => [...word].map(letter => ({ letter, order: order++ })))
})
const longWord = computed(() => (solution.value || proposalDisplay.value).length > 24)
const announcement = computed(() => phase.value === 'success' ? `¡El enigma ha sido resuelto! ${solution.value}` : phase.value === 'failure' ? '¡El enigma no ha sido resuelto! El Oráculo aún guarda su secreto. Podéis volver a intentarlo.' : defeated.value ? 'El hechizo pierde su energía. Esperad un momento.' : busy.value ? 'El Oráculo está despertando. Esperad la revelación.' : '')
function syncFullscreen() { fullscreen.value = document.fullscreenElement === stage.value }
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await stage.value?.requestFullscreen()
    syncFullscreen()
  } catch { fullscreenNotice.value = 'No se pudo activar pantalla completa. Puedes continuar en esta ventana.' }
}
watch(phase, async value => {
  await nextTick()
  if (value === 'ready') input.value?.focus()
  if (['failure', 'success', 'invalid'].includes(value)) heading.value?.focus()
})
onMounted(() => {
  document.title = 'El despertar del enigma · El secreto del maestro Wu'
  document.addEventListener('fullscreenchange', syncFullscreen)
  if (phase.value === 'ready') input.value?.focus(); else heading.value?.focus()
})
onUnmounted(() => document.removeEventListener('fullscreenchange', syncFullscreen))
</script>

<template>
  <main ref="stage" class="enigma-stage" :class="[`enigma-${phase}`, { 'enigma-defeated': defeated, 'enigma-reduced': reducedMotion, 'enigma-has-proposal': !!proposalDisplay, 'enigma-has-art': artworkReady && !artworkFailed }]" :aria-busy="busy">
    <div class="enigma-sanctuary" aria-hidden="true"></div>
    <img v-if="!artworkFailed" class="enigma-art" :src="artworkUrl" alt="" @load="artworkReady = true" @error="artworkFailed = true" />
    <div class="enigma-atmosphere" aria-hidden="true"></div>
    <div class="enigma-world-light" aria-hidden="true"></div>
    <div class="enigma-core" aria-hidden="true">
      <div class="enigma-core-aura"></div><div class="enigma-ring enigma-ring-outer"></div><div class="enigma-ring enigma-ring-inner"></div>
      <svg class="enigma-seal" viewBox="0 0 400 400"><path d="m200 16 130 54 54 130-54 130-130 54-130-54-54-130L70 70Z"/><circle cx="200" cy="200" r="153"/><path d="m200 68 33 66 73-10-33 76 33 76-73-10-33 66-33-66-73 10 33-76-33-76 73 10Z"/><path d="M200 16v31m0 306v31M16 200h31m306 0h31M70 70l22 22m216 216 22 22M70 330l22-22m216-216 22-22"/></svg>
      <span class="enigma-question">?</span><div class="enigma-wave"></div>
      <svg v-if="defeated" class="enigma-fractures" viewBox="0 0 400 400" aria-hidden="true"><path d="m76 80 50 46-17 36 64 31-26 43 37 35-19 64M325 73l-57 75 20 25-61 37 28 42-27 65M28 208l77-11 29 23m237 5-58-18-26 15M198 20l-12 72 24 30-8 47"/></svg>
    </div>
    <div v-if="defeated && busy && !reducedMotion" class="enigma-fallout" aria-hidden="true"><i v-for="n in 24" :key="n" :style="{ '--ash-x': `${5 + n * 37 % 90}%`, '--ash-delay': `${n % 8 * .12}s`, '--ash-drift': `${n % 2 ? -35 : 45}px` }"></i><div class="enigma-smoke"></div></div>
    <header class="enigma-header">
      <div class="enigma-brand"><span aria-hidden="true">✦</span><span>EL SECRETO<br /><strong>DEL MAESTRO WU</strong></span></div>
      <div class="enigma-tools">
        <button type="button" :aria-pressed="soundEnabled" @click="toggleSound">{{ soundEnabled ? 'Sonido activado' : 'Activar sonido' }}</button>
        <button v-if="fullscreenAvailable" type="button" :aria-pressed="fullscreen" @click="toggleFullscreen">{{ fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa' }}</button>
      </div>
    </header>
    <section class="enigma-mission" aria-labelledby="enigma-title">
      <p class="enigma-kicker">EL SANTUARIO DEL CONOCIMIENTO</p>
      <h1 id="enigma-title" ref="heading" tabindex="-1">{{ title }}</h1>
      <p v-if="phase === 'ready'" class="enigma-introduction">EL ORÁCULO AGUARDA VUESTRA RESPUESTA</p>
      <p v-else-if="phase === 'charging' || phase === 'awakening'" class="enigma-introduction">CONCENTRAD VUESTRO PODER…</p>
      <p v-else-if="defeated" class="enigma-introduction">EL ORÁCULO AÚN GUARDA SU SECRETO</p>
      <div v-if="phase !== 'invalid' && !['falling', 'failure'].includes(phase)" class="enigma-seal-tray" :class="{ 'enigma-answer': !!solution, 'enigma-long': longWord }" :key="solution ? 'answer' : 'proposal'" :aria-hidden="!solution" :aria-label="solution || undefined" :role="solution ? 'group' : undefined">
        <span v-if="!words.length" class="enigma-waiting-seal" aria-hidden="true">◆</span>
        <span v-for="(word, w) in words" :key="w" class="enigma-word" aria-hidden="true"><span v-for="(letter, l) in word" :key="l" class="enigma-letter" :style="{ '--letter': letter.order }">{{ letter.letter }}</span></span>
      </div>
      <form v-if="phase === 'ready'" class="enigma-form" @submit.prevent="submit">
        <label for="enigma-proposal">VUESTRA PROPUESTA</label>
        <input id="enigma-proposal" ref="input" v-model="proposal" type="text" :maxlength="MAX_ENIGMA_INPUT" autocomplete="off" autocapitalize="characters" :spellcheck="false" :aria-invalid="!!problem" aria-describedby="enigma-proposal-help" placeholder="Escribid la palabra o expresión" />
        <p id="enigma-proposal-help" class="enigma-help">Hasta 48 letras y espacios. También podéis pulsar Enter.</p>
        <p v-if="problem" class="enigma-notice" role="alert">{{ problem }}</p>
        <button class="enigma-reveal-button" type="submit"><span aria-hidden="true">◆</span> DESVELAR EL ENIGMA <span aria-hidden="true">◆</span></button>
      </form>
      <div v-else-if="busy" class="enigma-charging-caption" aria-hidden="true"><span></span>{{ defeated ? 'EL HECHIZO PIERDE SU ENERGÍA' : phase === 'revealing' ? 'EL CONOCIMIENTO COBRA VIDA' : phase === 'celebrating' ? 'VUESTRO PODER HA DESPERTADO' : 'EL SELLO ESTÁ DESPERTANDO' }}<span></span></div>
      <div v-else-if="phase === 'failure'" class="enigma-recovery"><div class="enigma-broken-mark" aria-hidden="true"></div><p>¡Un ninja nunca se rinde! Reunid vuestras ideas y volved a intentarlo.</p><button class="enigma-retry-button" type="button" @click="retry">VOLVER A INTENTARLO</button></div>
      <div v-else-if="phase === 'success'" class="enigma-victory-actions"><p>JUNTOS HABÉIS DESPERTADO SU PODER</p><div class="enigma-victory-controls"><button class="enigma-restart-button" type="button" @click="restart">REINICIAR ENIGMA</button><button class="enigma-replay-button" type="button" @click="replay">Repetir revelación</button></div></div>
      <button v-if="canRestart && phase !== 'success'" class="enigma-restart-button" type="button" @click="restart">REINICIAR ENIGMA</button>
      <p v-if="error" class="enigma-notice enigma-link-error" role="alert">{{ error }}</p>
    </section>
    <div v-if="phase === 'celebrating'" class="enigma-festival" aria-hidden="true">
      <div v-for="burst in 5" :key="burst" class="enigma-firework" :style="{ '--burst': burst }"><i v-for="ray in 12" :key="ray" :style="{ '--ray': ray }"></i></div>
      <i v-for="n in 48" :key="n" class="enigma-shard" :style="{ '--x': `${10 + (n * 31) % 80}%`, '--dx': `${(n % 2 ? -1 : 1) * (5 + n % 13)}vw`, '--dy': `${-(15 + n % 35)}vh`, '--delay': `${Math.floor((n - 1) / 16) * .9 + (n % 4) * .06}s`, '--turn': `${n * 29}deg` }"></i>
      <i v-for="n in 6" :key="`trail-${n}`" class="enigma-victory-trail" :style="{ '--trail': n }"></i>
    </div>
    <footer class="enigma-footer"><p>UNA RESPUESTA. UN MISMO PODER.</p><p v-if="soundNotice || fullscreenNotice" role="status">{{ soundNotice || fullscreenNotice }}</p></footer>
    <p class="enigma-sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </main>
</template>
