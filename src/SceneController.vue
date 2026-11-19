<script setup lang="ts">
import { ref, watch } from 'vue'
import { adjacentScene, sceneByNumber, trialsOpening, type SceneDefinition } from './scenes'
import { mediaUrl, type ProfileConfig, type ProfileId } from './profile'
import CeremonyControls from './CeremonyControls.vue'
import { ceremonyFinalProblems, type CeremonyAction, type CeremonyProgress } from './ceremony'
import { ceremonyProblems } from './profile'
import type { RevealAction, RevealState } from './reveal'
import { useSceneCatalogue } from './useSceneCatalogue'
import ChallengeStage from './ChallengeStage.vue'
import ChallengeControls from './ChallengeControls.vue'
import type { ChallengeResults } from './challengeResults'
import { createFinaleProgress, finalePreparationProblems, type FinaleAction, type FinaleProgress } from './finale'
import FinaleStage from './FinaleStage.vue'
import FinaleControls from './FinaleControls.vue'
import TrialsOpeningStage from './TrialsOpeningStage.vue'
const props = defineProps<{ scene: SceneDefinition; config: ProfileConfig; ceremony: CeremonyProgress; reveal: RevealState; disabled: boolean; results: ChallengeResults; resultsVersion: string | null; saveResult: (id: string, winner: string | null, version: string | null, profileId: ProfileId) => Promise<boolean>; requestedPreview?: string; publicReady: boolean; imageExpanded: boolean; showingWinner: boolean; announcedWinner?: string; finaleProgress?: FinaleProgress; controlRevision?: number }>()
const emit = defineEmits<{ select: [id: string]; ceremony: [action: CeremonyAction]; reveal: [action: RevealAction]; announce: [id: string, winner: string]; imageView: [id: string, expanded: boolean]; finale: [action: FinaleAction] }>()
const { list: orderedScenes, previewId, preview, selectPreview } = useSceneCatalogue(() => ({ config: props.config, activeId: props.scene.id, requestedPreview: props.requestedPreview }))
const number = ref(1)
const imageFailed = ref(false)
watch(() => orderedScenes.value.findIndex(s => s.id === props.scene.id), index => { number.value = index + 1 }, { immediate: true })
watch(() => props.config.id, () => { previewId.value = orderedScenes.value[0]!.id; imageFailed.value = false })
watch(() => props.config.media.artwork, () => { imageFailed.value = false })
const descriptions = { opening: 'Portada cinematográfica', ceremony: 'Ceremonia de los equipos', video: 'Vídeo local', threshold: 'Proclamación de inicio', challenge: 'Prueba ninja', finale: 'Desenlace cooperativo' }
function jump() { const target = sceneByNumber(number.value, props.config); if (target && !blocked(target.id)) emit('select', target.id) }
function blocked(id: string) { return props.disabled || id === 'finale' && finalePreparationProblems(props.config).length > 0 || id === 'ceremony' && ceremonyProblems(props.config).length > 0 || (id === 'wu' || id === trialsOpening.id) && (!['ready','complete'].includes(props.ceremony.phase) || ceremonyFinalProblems(props.config, props.ceremony).length > 0) }
</script>
<template>
  <p class="notice" role="status"><strong>{{ publicReady ? 'En pantalla' : 'Escena activa guardada · pantalla sin confirmar' }}: {{ scene.title }}</strong><br />Después: {{ adjacentScene(scene.id, 1, config)?.title || 'Fin del recorrido preparado' }}. Seleccionar una vista previa no cambia lo que ve el público.</p>
  <section v-if="scene.type === 'opening' || scene.type === 'video' || scene.type === 'threshold'" class="notice operator-scene-guide">
    <strong>{{ scene.type === 'opening' ? 'Preparados para empezar' : scene.title }}</strong>
    <p v-if="scene.type === 'opening'">Revisa integrantes y capitanes, guarda y pulsa «Siguiente» para presentar los equipos.</p>
    <p v-else-if="scene.type === 'video'">Inicia el vídeo en la pantalla pública. Si hay pruebas visibles, la proclamación se muestra al terminar. También puedes pasar con «Siguiente».</p>
    <p v-else>Cuando los niños estén preparados, pulsa «Siguiente» o deja que pulsen «Continuar» en la pantalla pública.</p>
    <p v-if="disabled">Hay una operación en curso o cambios sin guardar: guarda o descarta el borrador antes de continuar.</p>
  </section>
  <CeremonyControls v-if="scene.type === 'ceremony'" :config="config" :progress="ceremony" :reveal="reveal" :disabled="disabled" @action="$emit('ceremony', $event)" @reveal="$emit('reveal', $event)" />
  <FinaleControls :config="config" @home="$emit('select', 'intro')" :revision="controlRevision" v-if="scene.type === 'finale'" :progress="finaleProgress || createFinaleProgress(config.finale)" :disabled="disabled" :public-ready="publicReady" @action="$emit('finale', $event)" />
  <p v-if="preview.type === 'finale' && finalePreparationProblems(config).length" class="notice">Desenlace bloqueado: {{ finalePreparationProblems(config).join(' ') }} Prepáralo en Desenlace final.</p>
  <ChallengeControls v-if="scene.type === 'challenge' && scene.challengeId" :config="config" :challenge-id="scene.challengeId" :image-expanded="imageExpanded" :showing-winner="showingWinner" @image-view="(id,expanded) => $emit('imageView',id,expanded)" :winner="results[scene.challengeId] || null" :version="resultsVersion" :disabled="disabled" :save-result="saveResult" @announce="(id,winner) => $emit('announce',id,winner)" @present="$emit('select', $event)" />
  <details class="scene-catalogue" :open="scene.type !== 'ceremony'"><summary>Catálogo de escenas y vista previa · no cambia la fase de la ceremonia</summary>
  <div class="presentation-grid">
    <section class="panel scene-list"><p class="kicker">SECUENCIA DE PRESENTACIÓN</p><h3>El recorrido de la aventura</h3><p class="hint">Elegir una miniatura cambia la vista previa. Solo «Mostrar» cambia la pantalla pública. El vídeo requiere completar la ceremonia.</p>
      <button v-for="(entry, index) in orderedScenes" :key="entry.id" class="scene-card" :class="{ 'is-active': scene.id === entry.id, 'is-preview': previewId === entry.id && scene.id !== entry.id }" :aria-current="scene.id === entry.id ? 'step' : undefined" :aria-label="`${entry.title}${scene.id === entry.id ? publicReady ? ' · En pantalla' : ' · Escena activa guardada, pantalla sin confirmar' : previewId === entry.id ? ' · Vista previa' : ''}`" @click="selectPreview(entry.id)"><span class="scene-number">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ entry.title }}</strong><small>{{ descriptions[entry.type] }}</small></span><span v-if="scene.id === entry.id" class="live-dot">{{ publicReady ? 'En pantalla' : 'Activa · pantalla sin confirmar' }}</span><small v-else-if="previewId === entry.id" class="preview-indicator">Vista previa</small></button>
      <div class="command-row"><button :disabled="!adjacentScene(scene.id, -1, config) || blocked(adjacentScene(scene.id, -1, config)!.id)" @click="$emit('select', adjacentScene(scene.id, -1, config)!.id)">← Anterior</button><button class="primary" :disabled="!adjacentScene(scene.id, 1, config) || blocked(adjacentScene(scene.id, 1, config)!.id)" @click="$emit('select', adjacentScene(scene.id, 1, config)!.id)">Siguiente →</button></div>
      <form class="command-row" @submit.prevent="jump"><label>Ir a escena por número<input v-model.number="number" type="number" min="1" :max="orderedScenes.length" required /></label><button :disabled="!sceneByNumber(number, config) || blocked(sceneByNumber(number, config)!.id)">Mostrar número</button></form>
    </section>
    <section class="panel preview-panel"><div class="section-title"><p class="kicker">VISTA PREVIA</p><span class="count-pill">{{ descriptions[preview.type] }}</span></div>
      <FinaleStage v-if="preview.type === 'finale'" :config="config" :progress="createFinaleProgress(config.finale)" preview /><TrialsOpeningStage v-else-if="preview.type === 'threshold'" preview /><ChallengeStage v-else-if="preview.type === 'challenge' && config.challenges.find(c => c.id === preview.challengeId)" :challenge="config.challenges.find(c => c.id === preview.challengeId)!" :config="config" :number="preview.challengeNumber!" :expanded="preview.id === scene.id && imageExpanded" :winner="preview.id === scene.id && showingWinner ? announcedWinner : undefined" preview /><div v-else class="scene-preview"><img v-if="!imageFailed" :src="mediaUrl(config, 'artwork', './')" alt="" @error="imageFailed = true" /><div v-else class="preview-mountains" aria-hidden="true">◆</div><div class="preview-copy"><small>{{ preview.type === 'opening' ? 'EL SECRETO DEL' : 'ESCUCHAD AL' }}</small><strong>MAESTRO WU</strong><span v-if="preview.type === 'video'" class="video-placeholder-icon" aria-hidden="true">▷</span><span v-else class="mini-start">START GAME</span></div></div>
      <h3>{{ preview.title }}</h3><p class="hint">{{ preview.type === 'finale' ? 'Vista del sello dormido: no reproduce la victoria ni muestra frase o secreto. La respuesta se entrega en la pantalla pública o desde los controles privados.' : preview.type === 'threshold' ? 'Proclamación de inicio antes de la primera prueba visible.' : preview.type === 'challenge' ? 'Presenta esta prueba y registra su ganador desde el control de pantalla. Guardar un resultado no lo anuncia.' : preview.type === 'video' ? 'El vídeo se reproduce con los controles de la pantalla pública, sin autoplay.' : preview.type === 'ceremony' ? 'Dos equipos, capitanes y elecciones dirigidas desde este panel. Retoma la fase guardada del perfil activo.' : 'El público verá la portada aprobada con su botón START GAME.' }}</p>
      <button class="primary" :disabled="blocked(preview.id)" @click="$emit('select', preview.id)">Mostrar esta escena</button><p class="hint">{{ publicReady ? 'En pantalla' : 'Activa guardada · pantalla sin confirmar' }}: {{ scene.title }}</p>
    </section>
  </div>
  </details>
</template>
<style scoped>
.operator-scene-guide > strong { display: block; color: #ffe1a0; margin-bottom: .5rem; }.operator-scene-guide p { line-height: 1.6; margin: 0; }.scene-catalogue > summary { margin-bottom: 1rem; }
.scene-card.is-active { border: 2px solid #f6d58c; background: #34554d; box-shadow: inset 4px 0 #f6d58c; }.scene-card.is-preview:not(.is-active) { border: 1px dashed #8fc8d3; background: #122d3c; box-shadow: none; }.preview-indicator { color: #a4d9e2; }.scene-card:focus-visible { outline: 3px solid #fff2c4; outline-offset: 3px; }
</style>
