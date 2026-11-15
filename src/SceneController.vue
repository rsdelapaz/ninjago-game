<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { adjacentScene, orderedScenes, sceneByNumber, type SceneDefinition } from './scenes'
import { mediaUrl, type ProfileConfig } from './profile'
const props = defineProps<{ scene: SceneDefinition; config: ProfileConfig }>()
const emit = defineEmits<{ select: [id: string] }>()
const number = ref(1)
const previewId = ref(props.scene.id)
const preview = computed(() => orderedScenes.find(s => s.id === previewId.value)!)
const imageFailed = ref(false)
watch(() => props.scene.id, id => { number.value = orderedScenes.findIndex(s => s.id === id) + 1 }, { immediate: true })
watch(() => props.config.id, () => { previewId.value = orderedScenes[0].id; imageFailed.value = false })
watch(() => props.config.media.artwork, () => { imageFailed.value = false })
function jump() { const target = sceneByNumber(number.value); if (target) emit('select', target.id) }
</script>
<template>
  <div class="presentation-grid">
    <section class="panel scene-list"><p class="kicker">SECUENCIA DE PRESENTACIÓN</p><h3>Dos escenas, una misión</h3><p class="hint">Elegir una miniatura cambia la vista previa. Solo «Mostrar» cambia la pantalla pública.</p>
      <button v-for="(entry, index) in orderedScenes" :key="entry.id" class="scene-card" :aria-pressed="previewId === entry.id" @click="previewId = entry.id"><span class="scene-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ entry.title }}</strong><small>{{ entry.type === 'opening' ? 'Portada cinematográfica' : 'Vídeo local' }}</small></span><span v-if="scene.id === entry.id" class="live-dot">En pantalla</span></button>
      <div class="command-row"><button :disabled="!adjacentScene(scene.id, -1)" @click="$emit('select', adjacentScene(scene.id, -1)!.id)">← Anterior</button><button class="primary" :disabled="!adjacentScene(scene.id, 1)" @click="$emit('select', adjacentScene(scene.id, 1)!.id)">Siguiente →</button></div>
      <form class="command-row" @submit.prevent="jump"><label>Ir a escena por número<input v-model.number="number" type="number" min="1" :max="orderedScenes.length" required /></label><button>Mostrar número</button></form>
    </section>
    <section class="panel preview-panel"><div class="section-title"><p class="kicker">VISTA PREVIA</p><span class="count-pill">{{ preview.type === 'opening' ? 'PORTADA' : 'VÍDEO' }}</span></div>
      <div class="scene-preview"><img v-if="!imageFailed" :src="mediaUrl(config, 'artwork', './')" alt="" @error="imageFailed = true" /><div v-else class="preview-mountains" aria-hidden="true">◆</div><div class="preview-copy"><small>{{ preview.type === 'opening' ? 'EL SECRETO DEL' : 'ESCUCHAD AL' }}</small><strong>MAESTRO WU</strong><span v-if="preview.type === 'video'" class="video-placeholder-icon" aria-hidden="true">▷</span><span v-else class="mini-start">START GAME</span></div></div>
      <h3>{{ preview.title }}</h3><p class="hint">{{ preview.type === 'video' ? 'El vídeo se reproduce con los controles de la pantalla pública, sin autoplay.' : 'El público verá la portada aprobada con su botón START GAME.' }}</p>
      <button class="primary" @click="$emit('select', preview.id)">Mostrar esta escena</button><p class="hint">En pantalla: {{ scene.title }}</p>
    </section>
  </div>
</template>
