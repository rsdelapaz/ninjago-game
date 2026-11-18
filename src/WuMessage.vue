<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ src: string }>()
const failed = ref(false)

</script>

<template>
  <div class="mission-screen">
    <div class="screen-topline"><span>TRANSMISIÓN DEL MONASTERIO</span><span class="signal">● CANAL WU</span></div>
    <div class="video-frame">
      <span v-for="corner in ['tl', 'tr', 'bl', 'br']" :key="corner" class="frame-corner" :class="corner" aria-hidden="true"></span>
      <!-- Native inline controls: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video -->
      <video v-if="!failed" controls playsinline preload="metadata" :src="src" aria-label="Mensaje del maestro Wu" @error="failed = true">
        Tu navegador no puede reproducir el mensaje del maestro Wu.
      </video>
      <div v-else class="message-placeholder" role="status">
        <span class="message-emblem" aria-hidden="true">W</span>
        <p class="eyebrow">UN MENSAJE PARA LOS NINJAS</p>
        <h2>Todo gran ninja<br />comienza escuchando.</h2>
        <p>El maestro Wu os espera.<br />Su mensaje todavía no está disponible.</p>
      </div>
    </div>
    <div class="screen-bottomline"><span>EL PODER ESTÁ EN VUESTRO INTERIOR</span><span aria-hidden="true">◆ ◆ ◆ ◆</span></div>
  </div>
</template>
