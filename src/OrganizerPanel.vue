<script setup lang="ts">
import { confirmAction } from './confirmation'

import { computed, nextTick, ref, watch } from 'vue'
import ParticipantEditor from './ParticipantEditor.vue'
import ProfileTeams from './ProfileTeams.vue'
import ProfileResources from './ProfileResources.vue'
import ProfileTransfer from './ProfileTransfer.vue'
import SceneController from './SceneController.vue'
import { ceremonyProblems, cloneProfile, distributeProfile, profileIds, profileLabels, type ProfileConfig, type ProfileId } from './profile'
import type { CeremonyAction, CeremonyProgress } from './ceremony'
import type { SceneDefinition } from './scenes'
import { scenesFor } from './scenes'
import ChallengeEditor from './ChallengeEditor.vue'
import type { ChallengeResults } from './challengeResults'
import { useProfileDraft } from './useProfileDraft'
import { legacyEntries } from './profileStorage'
import type { ProfileResetRequest } from './ceremonyStorage'
import type { RevealState, RevealAction } from './reveal'
import './command-center.css'
import FinaleEditor from './FinaleEditor.vue'
import FinaleControls from './FinaleControls.vue'
import { currentFinale, finalePreparationProblems, type FinaleAction, type FinaleProgress } from './finale'
const props = defineProps<{ profile: ProfileConfig; scene: SceneDefinition; ceremony: CeremonyProgress; reveal: RevealState; busy: boolean; warning: string; publicReady: boolean; publicWaiting: boolean; publicMessage: string; publicUrl: string; imageExpanded: boolean; showingWinner: boolean; announcedWinner?: string; results: ChallengeResults; resultsVersion: string | null; recordResult: (id: string, winner: string | null, version: string | null, profileId: ProfileId) => Promise<boolean>; resetProfile: (request: ProfileResetRequest) => Promise<boolean>; finaleProgress?: FinaleProgress; controlRevision?: number }>()
const emit = defineEmits<{ select: [id: string]; activate: [id: ProfileId]; ceremony: [action: CeremonyAction]; reveal: [action: RevealAction]; saved: []; openPublic: []; announce: [id: string, winner: string]; imageView: [id: string, expanded: boolean]; finale: [action: FinaleAction] }>()
const { current, dirty, pending, validation, saving, save, reset, discard, message, error, report } = useProfileDraft(() => props.profile, () => emit('saved'))
const config = computed(() => current.value.config)
const finalProgress = computed(() => currentFinale(props.profile.finale, props.finaleProgress))
const orderedScenes = computed(() => scenesFor(props.profile)), presentationPreview = ref('')
watch(() => props.profile.id, () => { presentationPreview.value = '' })
function controlChallenge(id: string) { navigate('presentation', `challenge:${id}`) }
const modules = [
  { id: 'overview', label: 'Resumen', icon: '◈', description: 'Una mirada a todo lo que necesita tu aventura.' },
  { id: 'participants', label: 'Participantes', icon: '♙', description: 'Prepara los nombres de los ninjas de este perfil.' },
  { id: 'teams', label: 'Equipos', icon: '⚑', description: 'Dos equipos, una misión. Dales su propia identidad.' },
  { id: 'challenges', label: 'Pruebas', icon: '✦', description: 'Prepara el recorrido. Los ganadores se registran en Presentación.' },
  { id: 'finale', label: 'Desenlace final', icon: '◉', description: 'Dos clanes reúnen sus pistas para despertar el último sello.' },
  { id: 'media', label: 'Recursos multimedia', icon: '▧', description: 'Ilustración y vídeo privados, independientes para cada perfil.' },
  { id: 'presentation', label: 'Presentación', icon: '▷', description: 'Revisa la siguiente escena antes de mostrarla al público.' },
  { id: 'settings', label: 'Configuración y JSON', icon: '⚙', description: 'Traslada configuraciones con validación y conserva tus datos anteriores.' },
]
const module = ref('overview'), title = ref<HTMLElement | null>(null)
const selectedModule = computed(() => modules.find(m => m.id === module.value)!)
const unassigned = computed(() => config.value.participants.filter(p => !config.value.teams.some(t => t.memberIds.includes(p.id))))
const checks = computed(() => [
  { label: 'Participantes preparados', done: config.value.participants.length > 0, target: 'participants' },
  { label: 'Dos equipos con integrantes', done: config.value.teams.every(t => t.memberIds.length > 0), target: 'teams' },
  { label: 'Un capitán en cada equipo', done: config.value.teams.every(t => t.captainId && t.memberIds.includes(t.captainId)), target: 'teams' },
])
const ready = computed(() => checks.value.filter(c => c.done).length)
const preparationProblems = computed(() => ceremonyProblems(props.profile))
const legacyCount = ref(0)
try { legacyCount.value = legacyEntries(localStorage).length } catch { /* The storage warning is handled by the draft controller. */ }
async function navigate(id: string, preview = '') { presentationPreview.value = preview; module.value = id; await nextTick(); title.value?.focus() }
async function activate(event: Event) {
  const select = event.target as HTMLSelectElement, id = select.value as ProfileId, reviewed = props.profile.id
  select.value = props.profile.id
  if (id === props.profile.id) return
  if (!await confirmAction(`¿Cambiar a ${profileLabels[id]}? La pantalla pública volverá al inicio. Los borradores de cada perfil se conservarán mientras este panel permanezca abierto.`)) return
  if (props.profile.id !== reviewed) return
  emit('activate', id)
}
async function shuffle() {
  const reviewed = config.value
  if (!await confirmAction('¿Sortear y guardar un reparto nuevo en este perfil? Sustituirá las asignaciones actuales.')) return
  if (config.value !== reviewed) return
  try { const candidate = cloneProfile(reviewed); distributeProfile(candidate); save(candidate) } catch(e) { report(e) }
}
async function replace(candidate: ProfileConfig) {
  const reviewed = config.value
  if (!await confirmAction(`¿Reemplazar la configuración de ${profileLabels[props.profile.id]} y reiniciar su presentación?${dirty.value ? ' Se descartará su borrador sin guardar.' : ''} La configuración guardada anterior quedará en el historial local. Las pruebas que desaparezcan perderán sus resultados guardados.`)) return
  if (config.value !== reviewed) return
  if (await save(candidate)) emit('activate', candidate.id)
}
function restart() { emit('select', 'intro') }
</script>
<template>
  <div class="command-center">
    <a class="skip-link" href="#command-main">Saltar al contenido</a>
    <header class="command-header">
      <div class="command-brand"><span class="brand-mark" aria-hidden="true">✦</span><div><strong>CENTRO DE MANDO</strong><small>EL SECRETO DEL MAESTRO WU</small></div></div>
      <label class="active-profile"><span>PERFIL ACTIVO</span><select :value="profile.id" :disabled="busy || saving" @change="activate"><option v-for="id in profileIds" :key="id" :value="id">{{ profileLabels[id] }}</option></select></label>
      <div class="header-actions"><span class="save-status" :class="{ unsaved: dirty }" role="status">{{ dirty ? '● Cambios sin guardar' : '✓ Perfil guardado' }}</span><button class="primary save-profile" :disabled="!dirty || !!validation || busy || saving" @click="save()">Guardar cambios</button><button class="open-public" :disabled="publicWaiting" @click="$emit('openPublic')">{{ publicWaiting ? 'Esperando pantalla…' : 'Preparar pantalla pública ↗' }}</button></div>
    </header>
    <div class="dashboard-layout">
      <aside class="command-sidebar"><p class="nav-caption">TU AVENTURA</p><nav aria-label="Módulos del centro de mando"><button v-for="entry in modules" :key="entry.id" :data-module="entry.id" :aria-current="module === entry.id ? 'page' : undefined" @click="navigate(entry.id)"><span aria-hidden="true">{{ entry.icon }}</span>{{ entry.label }}<small v-if="entry.id === 'participants'">{{ config.participants.length }}</small></button></nav><div class="sidebar-note"><span aria-hidden="true">◆</span><strong>Dos equipos.<br />Un mismo poder.</strong><p>Preparados por separado.<br />Invencibles juntos.</p></div></aside>
      <main id="command-main" class="command-main" tabindex="-1">
        <div class="module-heading"><div><p class="kicker">{{ profileLabels[profile.id] }} / CENTRO DE MANDO</p><h1 ref="title" tabindex="-1">{{ selectedModule.label }}</h1><p>{{ selectedModule.description }}</p></div><span class="module-tag">{{ module === 'overview' ? `${ready} / 3 · ${dirty ? 'Borrador' : 'Preparación guardada'}` : profileLabels[profile.id] }}</span></div>
        <p class="operator-journey">1 · Preparar integrantes y capitanes <span aria-hidden="true">→</span> 2 · Guardar <span aria-hidden="true">→</span> 3 · Presentar y elegir con los niños <span aria-hidden="true">→</span> 4 · Vídeo de Wu <span aria-hidden="true">→</span> 5 · Pruebas y ganadores <span aria-hidden="true">→</span> 6 · Desenlace final</p>
        <p v-if="error || warning" class="notice error-notice" role="alert">{{ error || warning }}</p>
        <p v-if="message" class="notice" role="status">{{ message }}</p>
        <p v-if="validation" class="notice error-notice" role="alert">{{ validation }}</p>
        <p v-if="preparationProblems.length" class="notice" role="status">Ceremonia bloqueada: {{ preparationProblems.join(' ') }} Prepara y guarda los equipos.</p>
        <p class="public-screen-status" :class="{ available: publicReady }" role="status">{{ publicWaiting ? '◌ Esperando confirmación de la pantalla pública…' : publicReady ? '✓ Pantalla pública disponible' : '○ Pantalla pública sin confirmar · se abrirá al mostrar una escena' }}</p>
        <p v-if="publicMessage" class="notice error-notice" role="alert">{{ publicMessage }} <a :href="publicUrl" target="_blank" rel="noopener noreferrer">Abrir pantalla pública manualmente</a></p>
        <p v-if="pending.some(id => id !== profile.id)" class="hint">Hay borradores sin guardar en: {{ pending.filter(id => id !== profile.id).map(id => profileLabels[id]).join(', ') }}. Vuelve a ese perfil antes de cerrar.</p>
        <fieldset class="module-content" :disabled="saving || busy"><legend class="module-legend">Contenido de {{ selectedModule.label }}</legend>
        <template v-if="module === 'overview'">
          <div v-if="legacyCount" class="notice">Hay {{ legacyCount }} configuraciones anteriores conservadas. Elige explícitamente qué datos trasladar a cada perfil. <button class="text-button" @click="navigate('settings')">Revisar datos anteriores →</button></div>
          <div class="metric-grid"><article class="metric"><span aria-hidden="true">♙</span><div><strong>{{ config.participants.length }}</strong><small>Participantes</small></div><button aria-label="Administrar participantes" @click="navigate('participants')">↗</button></article><article class="metric"><span aria-hidden="true">⚑</span><div><strong>2</strong><small>Equipos ninja</small></div><button aria-label="Administrar equipos" @click="navigate('teams')">↗</button></article><article class="metric"><span aria-hidden="true">◇</span><div><strong>{{ unassigned.length }}</strong><small>Sin equipo asignado</small></div><button aria-label="Asignar integrantes" @click="navigate('teams')">↗</button></article></div>
          <div class="overview-grid"><section class="panel mission-panel"><div class="section-title"><div><p class="kicker">ANTES DE LA AVENTURA</p><h2>Prepara tu misión</h2></div><span class="readiness-ring">{{ ready }}/3</span></div><p class="hint">Prepara integrantes y capitanes, y guarda. Los nombres y colores se eligen con los niños durante la ceremonia; no son requisitos previos.</p><div class="readiness-list"><button v-for="(check, i) in checks" :key="check.label" @click="navigate(check.target)"><span class="check-marker" :class="{ done: check.done }">{{ check.done ? '✓' : String(i + 1).padStart(2, '0') }}</span><strong>{{ check.label }}</strong><span aria-hidden="true">→</span></button></div><button class="quiet-button" @click="navigate('media')">Comprobar imagen y vídeo →</button><button class="primary" @click="navigate('presentation')">Ir a presentación →</button></section>
            <section class="panel live-panel"><p class="kicker"><span class="status-dot"></span> CONTROL DE PANTALLA</p><div class="live-scene-number">{{ String(orderedScenes.findIndex(s => s.id === scene.id) + 1).padStart(2, '0') }}<small>/ {{ orderedScenes.length }}</small></div><h2>{{ scene.title }}</h2><p class="hint">{{ scene.type === 'finale' ? 'Desenlace cooperativo · control privado y pantalla pública' : scene.type === 'challenge' ? (publicReady ? 'Prueba en pantalla' : 'Prueba activa · pantalla sin confirmar') + ' · registra y anuncia el ganador en Presentación' : scene.type === 'ceremony' ? 'Ceremonia de equipos' : scene.type === 'opening' ? 'Portada cinematográfica' : 'Vídeo local del maestro' }}</p><button class="primary" @click="navigate('presentation')">Controlar presentación →</button></section>
            <section class="panel"><div class="section-title"><h2>Tus equipos</h2><button class="text-button" @click="navigate('teams')">Editar →</button></div><div class="summary-teams"><div v-for="(team, i) in config.teams" :key="team.id"><span class="team-swatch" :style="{ background: team.color || 'transparent' }"></span><div><strong>{{ team.name || `Equipo ${i + 1}` }}</strong><small>{{ team.name ? `${team.memberIds.length} integrantes` : 'Nombre y color por definir' }}</small></div><b>{{ team.memberIds.length }}</b></div></div></section>
            <section class="panel"><p class="kicker">RECURSOS DEL PERFIL</p><h2>Una aventura con su propia voz</h2><p class="hint">Referencias configuradas; comprueba su disponibilidad en Recursos multimedia.</p><div class="file-reference"><span>IMG</span><code>{{ config.media.artwork }}</code></div><div class="file-reference"><span>VID</span><code>{{ config.media.video }}</code></div></section></div>
        </template>
        <ParticipantEditor v-else-if="module === 'participants'" :key="profile.id" :config="config" />
        <ProfileTeams v-else-if="module === 'teams'" :config="config" @distribute="shuffle" />
        <ChallengeEditor v-else-if="module === 'challenges'" :key="profile.id" :config="config" :results="results" :dirty="dirty" @present="controlChallenge" />
        <ProfileResources v-else-if="module === 'media'" :key="profile.id" :config="config" />
        <template v-else-if="module === 'finale'"><FinaleEditor :config="config" /><button class="primary" :disabled="busy || saving || dirty || finalePreparationProblems(profile).length > 0" @click="$emit('select', 'finale')">Mostrar el final</button><p v-if="dirty" class="notice">Guarda o descarta la configuración antes de dirigir el desenlace.</p><FinaleControls :config="profile" @home="$emit('select', 'intro')" :revision="controlRevision" v-if="scene.id === 'finale'" :progress="finalProgress" :disabled="busy || saving || dirty" :public-ready="publicReady" @action="$emit('finale', $event)" /></template>
        <template v-else-if="module === 'presentation'"><SceneController :control-revision="controlRevision" :finale-progress="finalProgress" @finale="$emit('finale', $event)" :key="profile.id" :requested-preview="presentationPreview" :image-expanded="imageExpanded" :showing-winner="showingWinner" :announced-winner="announcedWinner" @image-view="(id,expanded) => $emit('imageView',id,expanded)" :public-ready="publicReady" :scene="scene" :results="results" :results-version="resultsVersion" :save-result="recordResult" @announce="(id,winner) => $emit('announce',id,winner)" :config="profile" :ceremony="ceremony" :reveal="reveal" :disabled="busy || saving || dirty" @select="$emit('select', $event)" @ceremony="$emit('ceremony', $event)" @reveal="$emit('reveal', $event)" /><p v-if="dirty" class="notice">Guarda o descarta el borrador antes de dirigir la ceremonia.</p><div class="command-row"><button :disabled="busy || saving" @click="restart">Volver a la portada…</button><span class="hint">Volver a la portada conserva las decisiones. Retoma la ceremonia desde su entrada en el catálogo.</span></div></template>
        <ProfileTransfer v-else :key="profile.id" :config="config" :dirty="dirty" :reset-baseline="{ profileId: config.id, expectedConfig: current.baseline, expectedProgress: current.ceremonyBaseline }" @replace="replace" @reset="reset(resetProfile, $event)" />
        <div v-if="dirty" class="draft-actions"><span>Los cambios pertenecen solo a {{ profileLabels[profile.id] }}. Editar solo las pruebas conserva la ceremonia. Cambiar participantes, equipos o recursos reinicia sus confirmaciones; conserva nombres y colores.</span><button @click="discard">Descartar borrador…</button></div>
        </fieldset>
        <footer class="command-footer"><span>✦ CENTRO DE MANDO NINJA</span><span>Configuración local · Recursos privados</span></footer>
      </main>
    </div>
  </div>
</template>
<style scoped>
.module-content { border: 0; padding: 0; margin: 0; min-width: 0; }.module-legend { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.public-screen-status { border-left: 3px solid #c0aa70; background: #c0aa700c; color: #ffe3a2; padding: .75rem 1rem; font-size: .9rem; }.public-screen-status.available { border-color: #91d6ae; color: #b8eccd; }.operator-journey { color: #bfcfd2; font-size: .8rem; line-height: 1.8; }.operator-journey span { color: #e8c778; margin: 0 .5rem; }
</style>
