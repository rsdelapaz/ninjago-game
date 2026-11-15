<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { adjacentScene, orderedScenes, sceneByNumber, type SceneDefinition } from './scenes'
import { mediaUrl, type ProfileConfig } from './profile'
import CeremonyControls from './CeremonyControls.vue'
import { ceremonyFinalProblems, type CeremonyAction, type CeremonyProgress } from './ceremony'
import { ceremonyProblems } from './profile'
const props = defineProps<{ scene: SceneDefinition; config: ProfileConfig; ceremony: CeremonyProgress; disabled: boolean }>()
const emit = defineEmits<{ select: [id: string]; ceremony: [action: CeremonyAction] }>()
const number = ref(1)
const previewId = ref(props.scene.id)
const preview = computed(() => orderedScenes.find(s => s.id === previewId.value)!)
const imageFailed = ref(false)
watch(() => props.scene.id, id => { number.value = orderedScenes.findIndex(s => s.id === id) + 1 }, { immediate: true })
watch(() => props.config.id, () => { previewId.value = orderedScenes[0].id; imageFailed.value = false })
watch(() => props.config.media.artwork, () => { imageFailed.value = false })
const descriptions = { opening: 'Portada cinematográfica', ceremony: 'Ceremonia de los equipos', video: 'Vídeo local' }
function jump() { const target = sceneByNumber(number.value); if (target && !blocked(target.id)) emit('select', target.id) }
function blocked(id: string) { return props.disabled || id === 'ceremony' && ceremonyProblems(props.config).length > 0 || id === 'wu' && (!['ready','complete'].includes(props.ceremony.phase) || ceremonyFinalProblems(props.config, props.ceremony).length > 0) }
</script>
<template>
  <CeremonyControls v-if="scene.type === 'ceremony'" :config="config" :progress="ceremony" :disabled="disabled" @action="$emit('ceremony', $event)" />
  <div class="presentation-grid">
    <section class="panel scene-list"><p class="kicker">SECUENCIA DE PRESENTACIÓN</p><h3>El recorrido de la aventura</h3><p class="hint">Elegir una miniatura cambia la vista previa. Solo «Mostrar» cambia la pantalla pública. El vídeo requiere completar la ceremonia.</p>
      <button v-for="(entry, index) in orderedScenes" :key="entry.id" class="scene-card" :aria-pressed="previewId === entry.id" @click="previewId = entry.id"><span class="scene-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ entry.title }}</strong><small>{{ descriptions[entry.type] }}</small></span><span v-if="scene.id === entry.id" class="live-dot">En pantalla</span></button>
      <div class="command-row"><button :disabled="!adjacentScene(scene.id, -1) || blocked(adjacentScene(scene.id, -1)!.id)" @click="$emit('select', adjacentScene(scene.id, -1)!.id)">← Anterior</button><button class="primary" :disabled="!adjacentScene(scene.id, 1) || blocked(adjacentScene(scene.id, 1)!.id)" @click="$emit('select', adjacentScene(scene.id, 1)!.id)">Siguiente →</button></div>
      <form class="command-row" @submit.prevent="jump"><label>Ir a escena por número<input v-model.number="number" type="number" min="1" :max="orderedScenes.length" required /></label><button :disabled="!sceneByNumber(number) || blocked(sceneByNumber(number)!.id)">Mostrar número</button></form>
    </section>
    <section class="panel preview-panel"><div class="section-title"><p class="kicker">VISTA PREVIA</p><span class="count-pill">{{ descriptions[preview.type] }}</span></div>
      <div class="scene-preview"><img v-if="!imageFailed" :src="mediaUrl(config, 'artwork', './')" alt="" @error="imageFailed = true" /><div v-else class="preview-mountains" aria-hidden="true">◆</div><div class="preview-copy"><small>{{ preview.type === 'opening' ? 'EL SECRETO DEL' : 'ESCUCHAD AL' }}</small><strong>MAESTRO WU</strong><span v-if="preview.type === 'video'" class="video-placeholder-icon" aria-hidden="true">▷</span><span v-else class="mini-start">START GAME</span></div></div>
      <h3>{{ preview.title }}</h3><p class="hint">{{ preview.type === 'video' ? 'El vídeo se reproduce con los controles de la pantalla pública, sin autoplay.' : preview.type === 'ceremony' ? 'Dos equipos, capitanes y elecciones dirigidas desde este panel. Retoma la fase guardada del perfil activo.' : 'El público verá la portada aprobada con su botón START GAME.' }}</p>
      <button class="primary" :disabled="blocked(preview.id)" @click="$emit('select', preview.id)">Mostrar esta escena</button><p class="hint">En pantalla: {{ scene.title }}</p>
    </section>
  </div>
</template>
