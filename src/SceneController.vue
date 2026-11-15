<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { adjacentScene, scenesFor, sceneByNumber, type SceneDefinition } from './scenes'
import { mediaUrl, type ProfileConfig, type ProfileId } from './profile'
import CeremonyControls from './CeremonyControls.vue'
import { ceremonyFinalProblems, type CeremonyAction, type CeremonyProgress } from './ceremony'
import { ceremonyProblems } from './profile'
import type { RevealAction, RevealState } from './reveal'
import ChallengeStage from './ChallengeStage.vue'
import ChallengeControls from './ChallengeControls.vue'
import type { ChallengeResults } from './challengeResults'
const props = defineProps<{ scene: SceneDefinition; config: ProfileConfig; ceremony: CeremonyProgress; reveal: RevealState; disabled: boolean; results: ChallengeResults; resultsVersion: string | null; saveResult: (id: string, winner: string | null, version: string | null, profileId: ProfileId) => Promise<boolean>; initialPreview?: string }>()
const emit = defineEmits<{ select: [id: string]; ceremony: [action: CeremonyAction]; reveal: [action: RevealAction]; announce: [id: string, winner: string] }>()
const orderedScenes = computed(() => scenesFor(props.config))
const number = ref(1)
const previewId = ref(props.initialPreview || props.scene.id)
const preview = computed(() => orderedScenes.value.find(s => s.id === previewId.value) || orderedScenes.value[0]!)
const imageFailed = ref(false)
watch(() => props.scene.id, id => { number.value = orderedScenes.value.findIndex(s => s.id === id) + 1 }, { immediate: true })
watch(() => props.config.id, () => { previewId.value = orderedScenes.value[0]!.id; imageFailed.value = false })
watch(() => props.config.media.artwork, () => { imageFailed.value = false })
const descriptions = { opening: 'Portada cinematográfica', ceremony: 'Ceremonia de los equipos', video: 'Vídeo local', challenge: 'Prueba ninja' }
function jump() { const target = sceneByNumber(number.value, props.config); if (target && !blocked(target.id)) emit('select', target.id) }
function blocked(id: string) { return props.disabled || id === 'ceremony' && ceremonyProblems(props.config).length > 0 || id === 'wu' && (!['ready','complete'].includes(props.ceremony.phase) || ceremonyFinalProblems(props.config, props.ceremony).length > 0) }
</script>
<template>
  <p class="notice" role="status"><strong>Ahora en pantalla: {{ scene.title }}</strong><br />Después: {{ adjacentScene(scene.id, 1, config)?.title || 'Fin del recorrido preparado' }}. Seleccionar una vista previa no cambia lo que ve el público.</p>
  <section v-if="scene.type !== 'ceremony' && scene.type !== 'challenge'" class="notice operator-scene-guide"><strong>{{ scene.type === 'opening' ? 'Preparados para empezar' : 'Paso 7 · El mensaje del maestro Wu' }}</strong><p>{{ scene.type === 'opening' ? 'Los niños esperan. Tú revisas integrantes y capitanes, guardas y pulsas «Siguiente» para presentar los equipos. La pantalla pública se prepara automáticamente antes de mostrar la escena.' : 'Los niños escuchan a Wu. Inicia el vídeo con sus controles en la pantalla pública. Para volver a la ceremonia, utiliza «Anterior»; las decisiones se conservan.' }}</p><p v-if="disabled">Hay una operación en curso o cambios sin guardar: guarda o descarta el borrador antes de continuar.</p></section>
  <CeremonyControls v-if="scene.type === 'ceremony'" :config="config" :progress="ceremony" :reveal="reveal" :disabled="disabled" @action="$emit('ceremony', $event)" @reveal="$emit('reveal', $event)" />
  <ChallengeControls v-if="scene.type === 'challenge' && scene.challengeId" :config="config" :challenge-id="scene.challengeId" :winner="results[scene.challengeId] || null" :version="resultsVersion" :disabled="disabled" :save-result="saveResult" @announce="(id,winner) => $emit('announce',id,winner)" @present="$emit('select', $event)" />
  <details class="scene-catalogue" :open="scene.type !== 'ceremony'"><summary>Catálogo de escenas y vista previa · no cambia la fase de la ceremonia</summary>
  <div class="presentation-grid">
    <section class="panel scene-list"><p class="kicker">SECUENCIA DE PRESENTACIÓN</p><h3>El recorrido de la aventura</h3><p class="hint">Elegir una miniatura cambia la vista previa. Solo «Mostrar» cambia la pantalla pública. El vídeo requiere completar la ceremonia.</p>
      <button v-for="(entry, index) in orderedScenes" :key="entry.id" class="scene-card" :aria-pressed="previewId === entry.id" @click="previewId = entry.id"><span class="scene-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ entry.title }}</strong><small>{{ descriptions[entry.type] }}</small></span><span v-if="scene.id === entry.id" class="live-dot">En pantalla</span></button>
      <div class="command-row"><button :disabled="!adjacentScene(scene.id, -1, config) || blocked(adjacentScene(scene.id, -1, config)!.id)" @click="$emit('select', adjacentScene(scene.id, -1, config)!.id)">← Anterior</button><button class="primary" :disabled="!adjacentScene(scene.id, 1, config) || blocked(adjacentScene(scene.id, 1, config)!.id)" @click="$emit('select', adjacentScene(scene.id, 1, config)!.id)">Siguiente →</button></div>
      <form class="command-row" @submit.prevent="jump"><label>Ir a escena por número<input v-model.number="number" type="number" min="1" :max="orderedScenes.length" required /></label><button :disabled="!sceneByNumber(number, config) || blocked(sceneByNumber(number, config)!.id)">Mostrar número</button></form>
    </section>
    <section class="panel preview-panel"><div class="section-title"><p class="kicker">VISTA PREVIA</p><span class="count-pill">{{ descriptions[preview.type] }}</span></div>
      <ChallengeStage v-if="preview.type === 'challenge' && config.challenges.find(c => c.id === preview.challengeId)" :challenge="config.challenges.find(c => c.id === preview.challengeId)!" :config="config" :number="preview.challengeNumber!" preview /><div v-else class="scene-preview"><img v-if="!imageFailed" :src="mediaUrl(config, 'artwork', './')" alt="" @error="imageFailed = true" /><div v-else class="preview-mountains" aria-hidden="true">◆</div><div class="preview-copy"><small>{{ preview.type === 'opening' ? 'EL SECRETO DEL' : 'ESCUCHAD AL' }}</small><strong>MAESTRO WU</strong><span v-if="preview.type === 'video'" class="video-placeholder-icon" aria-hidden="true">▷</span><span v-else class="mini-start">START GAME</span></div></div>
      <h3>{{ preview.title }}</h3><p class="hint">{{ preview.type === 'challenge' ? 'Presenta esta prueba y registra su ganador desde el control de pantalla. Guardar un resultado no lo anuncia.' : preview.type === 'video' ? 'El vídeo se reproduce con los controles de la pantalla pública, sin autoplay.' : preview.type === 'ceremony' ? 'Dos equipos, capitanes y elecciones dirigidas desde este panel. Retoma la fase guardada del perfil activo.' : 'El público verá la portada aprobada con su botón START GAME.' }}</p>
      <button class="primary" :disabled="blocked(preview.id)" @click="$emit('select', preview.id)">Mostrar esta escena</button><p class="hint">En pantalla: {{ scene.title }}</p>
    </section>
  </div>
  </details>
</template>
<style scoped>
.operator-scene-guide > strong { display: block; color: #ffe1a0; margin-bottom: .5rem; }.operator-scene-guide p { line-height: 1.6; margin: 0; }.scene-catalogue > summary { margin-bottom: 1rem; }
</style>
