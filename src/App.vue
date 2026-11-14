<script setup lang="ts">
import { nextTick, ref } from 'vue'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
import WuMessage from './WuMessage.vue'
import letsGoSeal from './assets/lets-go.svg'

// Explicit reactive state: https://vuejs.org/api/sfc-script-setup.html#reactivity
const scene = ref<'intro' | 'wu'>('intro')
const heading = ref<HTMLHeadingElement | null>(null)
const artworkAvailable = ref(true)
const artworkUrl = `${import.meta.env.BASE_URL}private-media/ninjago-key-art.png`
const transitioning = ref(false)
async function goTo(target: 'intro' | 'wu') {
  if (transitioning.value || scene.value === target) return
  transitioning.value = true
  // Match the CSS exit duration; reduced motion also skips this delay.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await new Promise(resolve => window.setTimeout(resolve, 360))
  }
  scene.value = target
  await nextTick()
  heading.value?.focus()
  transitioning.value = false
}
</script>

<template>
  <main class="adventure" :class="{ 'video-scene': scene === 'wu', 'is-transitioning': transitioning }" :aria-busy="transitioning">
    <MonasteryBackdrop />
    <img v-if="artworkAvailable" class="key-art" :src="artworkUrl" alt="" @error="artworkAvailable = false" />
    <div class="energy-halo halo-fire" aria-hidden="true"></div>
    <div class="energy-halo halo-ice" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true"><i v-for="n in 18" :key="n" :style="{ '--i': n }"></i></div>
    <header class="scene-header">
      <span class="chapter"><span class="chapter-mark" aria-hidden="true">◆</span> {{ scene === 'intro' ? 'LA AVENTURA OS ESPERA' : 'MISIÓN 01 · EL MENSAJE' }}</span>
    </header>
    <section :key="scene" class="scene-content" :class="{ encounter: scene === 'wu' }" aria-labelledby="scene-title">
      <p class="eyebrow">{{ scene === 'intro' ? 'LOS ELEMENTOS OS HAN ELEGIDO' : 'MONASTERIO DEL SPINJITZU' }}</p>
      <div class="ornament" aria-hidden="true"><span></span>◆<span></span></div>
      <template v-if="scene === 'intro'">
        <h1 id="scene-title" ref="heading" tabindex="-1"><span>EL SECRETO DEL</span>MAESTRO <strong>WU</strong></h1>
        <p class="subtitle">Una antigua misión. Dos equipos de ninjas.<br class="desktop-break" /> Un secreto que solo podrán descubrir juntos.</p>
        <button class="start-button" :disabled="transitioning" @click="goTo('wu')">
          <svg class="mission-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="m27 3-4 15 17-3-12 12 3 17-12-12-15 4 9-14-6-13 15 4Z" fill="currentColor" /><path d="m28 13-12 13h9l-4 10 14-16h-10Z" fill="#fff3b0" /></svg>
          <span>COMENZAR AVENTURA</span><span class="mission-arrow" aria-hidden="true">&#10140;</span>
        </button>
        <p class="invitation">REÚNE A TU EQUIPO. DESPIERTA TU PODER.</p>
      </template>
      <template v-else>
        <h1 id="scene-title" ref="heading" tabindex="-1" class="second-title"><span>VUESTRA MISIÓN COMIENZA AQUÍ</span>ESCUCHAD AL MAESTRO WU</h1>
        <WuMessage />
        <button class="back-button" :disabled="transitioning" @click="goTo('intro')">← VOLVER AL INICIO</button>
      </template>
    </section>
    <img class="lets-go-seal" :src="letsGoSeal" alt="Let's Go" />
    <footer class="scene-footer"><div class="elements"><span class="fire">FUEGO</span><span class="ice">HIELO</span><span class="energy">ENERGÍA</span><span class="lightning">RAYO</span></div><p>DOS EQUIPOS. UN SECRETO. JUNTOS, INVENCIBLES.</p></footer>
  </main>
</template>
