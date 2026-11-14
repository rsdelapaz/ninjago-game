<script setup lang="ts">
import { ref } from 'vue'
import type { Scene } from './usePresentation'
defineProps<{ scene: Scene; warning: string }>()
defineEmits<{ select: [scene: Scene] }>()
const popupBlocked = ref(false)
const publicUrl = new URL(import.meta.env.BASE_URL, location.origin).href
function openPublic() {
  popupBlocked.value = !window.open(publicUrl, 'ninja-public', 'popup,width=1280,height=720')
}
</script>
<template>
  <main class="organizer">
    <p class="eyebrow">CONTROL DE LA PRESENTACIÓN</p>
    <h1>Panel del organizador</h1>
    <p>Abre la pantalla pública y muévela al monitor del evento.</p>
    <button @click="openPublic">Abrir ventana pública ↗</button>
    <p v-if="popupBlocked" role="status">El navegador ha bloqueado la ventana. <a :href="publicUrl" target="_blank" rel="noopener">Abrir pantalla pública</a></p>
    <p role="status">Escena actual: <strong>{{ scene === 'intro' ? 'Pantalla inicial' : 'Vídeo del maestro Wu' }}</strong></p>
    <div class="organizer-controls">
      <button :aria-pressed="scene === 'intro'" @click="$emit('select', 'intro')">Ir a pantalla inicial</button>
      <button :aria-pressed="scene === 'wu'" @click="$emit('select', 'wu')">Ir a escena del vídeo</button>
      <button @click="$emit('select', 'intro')">Reiniciar presentación</button>
    </div>
    <p v-if="warning" role="status">{{ warning }}</p>
    <p class="organizer-note">Control local sin contraseña. Usa el mismo navegador y dirección en ambas ventanas. El vídeo se reproduce desde sus controles en la pantalla pública.</p>
  </main>
</template>
