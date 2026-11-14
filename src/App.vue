<script setup lang="ts">
import { nextTick, ref } from 'vue'
import MonasteryBackdrop from './MonasteryBackdrop.vue'

// Explicit reactive state: https://vuejs.org/api/sfc-script-setup.html#reactivity
const scene = ref<'intro' | 'wu'>('intro')
const heading = ref<HTMLHeadingElement | null>(null)
async function goTo(target: 'intro' | 'wu') {
  scene.value = target
  await nextTick()
  heading.value?.focus()
}
</script>

<template>
  <main class="adventure">
    <MonasteryBackdrop />
    <div class="vignette" aria-hidden="true"></div>
    <header class="scene-header">
      <span class="world-name">NINJAGO <span>·</span> UNA AVENTURA COMPARTIDA</span>
      <span class="chapter">{{ scene === 'intro' ? 'PRÓLOGO' : 'EL ENCUENTRO' }} <span> / 01</span></span>
    </header>
    <section :key="scene" class="scene-content" :class="{ encounter: scene === 'wu' }" aria-labelledby="scene-title">
      <p class="eyebrow">{{ scene === 'intro' ? 'MONASTERIO DEL SPINJITZU' : 'EL MAESTRO OS ESPERA' }}</p>
      <div class="ornament" aria-hidden="true"><span></span>◆<span></span></div>
      <template v-if="scene === 'intro'">
        <h1 id="scene-title" ref="heading" tabindex="-1"><span>EL SECRETO DEL</span>MAESTRO WU</h1>
        <p class="subtitle">«Una antigua misión. Dos equipos de ninjas.<br class="desktop-break" /> Un secreto que solo podrán descubrir juntos».</p>
        <button class="start-button" @click="goTo('wu')">COMENZAR AVENTURA <span aria-hidden="true">⟶</span></button>
        <p class="invitation">EL CAMINO DEL NINJA COMIENZA AQUÍ</p>
      </template>
      <template v-else>
        <h1 id="scene-title" ref="heading" tabindex="-1" class="second-title"><span>EL SECRETO DEL</span>MAESTRO WU</h1>
        <div class="video-frame">
          <span class="seal" aria-hidden="true">◆</span>
          <h2>Escuchad al maestro Wu</h2>
          <p>Ninjas del fuego, el hielo, el rayo y la tierra…<br /> vuestra aventura está a punto de comenzar.</p>
          <p class="media-note">El mensaje del maestro aún no está preparado.</p>
        </div>
        <button class="back-button" @click="goTo('intro')">← VOLVER AL INICIO</button>
      </template>
    </section>
    <footer class="scene-footer"><span class="element-line" aria-hidden="true">◆ ─── ◆ ─── ◆ ─── ◆</span><p>CUATRO ELEMENTOS. DOS EQUIPOS. UN MISMO DESTINO.</p></footer>
  </main>
</template>
