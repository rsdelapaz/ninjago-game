<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import ParticipantEditor from './ParticipantEditor.vue'
import ProfileTeams from './ProfileTeams.vue'
import ProfileResources from './ProfileResources.vue'
import ProfileTransfer from './ProfileTransfer.vue'
import SceneController from './SceneController.vue'
import { cloneProfile, distributeProfile, profileIds, profileLabels, type ProfileConfig, type ProfileId } from './profile'
import type { SceneDefinition } from './scenes'
import { orderedScenes } from './scenes'
import { useProfileDraft } from './useProfileDraft'
import { legacyEntries } from './profileStorage'
import './command-center.css'
const props = defineProps<{ profile: ProfileConfig; scene: SceneDefinition; warning: string }>()
const emit = defineEmits<{ select: [id: string]; activate: [id: ProfileId]; saved: [] }>()
const { current, dirty, pending, validation, save, discard, message, error, report } = useProfileDraft(() => props.profile, () => emit('saved'))
const config = computed(() => current.value.config)
const modules = [
  { id: 'overview', label: 'Resumen', icon: '◈', description: 'Una mirada a todo lo que necesita tu aventura.' },
  { id: 'participants', label: 'Participantes', icon: '♙', description: 'Prepara los nombres de los ninjas de este perfil.' },
  { id: 'teams', label: 'Equipos', icon: '⚑', description: 'Dos equipos, una misión. Dales su propia identidad.' },
  { id: 'media', label: 'Recursos multimedia', icon: '▧', description: 'Ilustración y vídeo privados, independientes para cada perfil.' },
  { id: 'presentation', label: 'Presentación', icon: '▷', description: 'Revisa la siguiente escena antes de mostrarla al público.' },
  { id: 'settings', label: 'Configuración y JSON', icon: '⚙', description: 'Traslada configuraciones con validación y conserva tus datos anteriores.' },
]
const module = ref('overview'), title = ref<HTMLElement | null>(null)
const selectedModule = computed(() => modules.find(m => m.id === module.value)!)
const unassigned = computed(() => config.value.participants.filter(p => !config.value.teams.some(t => t.memberIds.includes(p.id))))
const checks = computed(() => [
  { label: 'Participantes preparados', done: config.value.participants.length > 0, target: 'participants' },
  { label: 'Nombres y colores definidos', done: config.value.teams.every(t => t.name && t.color), target: 'teams' },
  { label: 'Todos tienen un equipo', done: config.value.participants.length > 0 && unassigned.value.length === 0, target: 'teams' },
])
const ready = computed(() => checks.value.filter(c => c.done).length)
const popupBlocked = ref(false), publicUrl = new URL('./', location.href).href
const legacyCount = ref(0)
try { legacyCount.value = legacyEntries(localStorage).length } catch { /* The storage warning is handled by the draft controller. */ }
async function navigate(id: string) { module.value = id; await nextTick(); title.value?.focus() }
function activate(event: Event) {
  const select = event.target as HTMLSelectElement, id = select.value as ProfileId
  select.value = props.profile.id
  if (id === props.profile.id) return
  if (!window.confirm(`¿Cambiar a ${profileLabels[id]}? La pantalla pública volverá al inicio. Los borradores de cada perfil se conservarán mientras este panel permanezca abierto.`)) return
  emit('activate', id)
}
function openPublic() { popupBlocked.value = !window.open(publicUrl, 'ninja-public', 'popup,width=1280,height=720') }
function shuffle() {
  if (!window.confirm('¿Sortear y guardar un reparto nuevo en este perfil? Sustituirá las asignaciones actuales.')) return
  try { const candidate = cloneProfile(config.value); distributeProfile(candidate); save(candidate) } catch(e) { report(e) }
}
function replace(candidate: ProfileConfig) {
  if (!window.confirm(`¿Reemplazar la configuración de ${profileLabels[props.profile.id]} y reiniciar su presentación?${dirty.value ? ' Se descartará su borrador sin guardar.' : ''} La configuración guardada anterior quedará en el historial local.`)) return
  if (save(candidate)) emit('activate', props.profile.id)
}
function restart() { if (window.confirm('¿Volver al inicio de la presentación del perfil activo?')) emit('select', orderedScenes[0].id) }
</script>
<template>
  <div class="command-center">
    <a class="skip-link" href="#command-main">Saltar al contenido</a>
    <header class="command-header">
      <div class="command-brand"><span class="brand-mark" aria-hidden="true">✦</span><div><strong>CENTRO DE MANDO</strong><small>EL SECRETO DEL MAESTRO WU</small></div></div>
      <label class="active-profile"><span>PERFIL ACTIVO</span><select :value="profile.id" @change="activate"><option v-for="id in profileIds" :key="id" :value="id">{{ profileLabels[id] }}</option></select></label>
      <div class="header-actions"><span class="save-status" :class="{ unsaved: dirty }" role="status">{{ dirty ? '● Cambios sin guardar' : '✓ Perfil guardado' }}</span><button class="primary save-profile" :disabled="!dirty || !!validation" @click="save()">Guardar cambios</button><button class="open-public" @click="openPublic">Abrir pantalla pública ↗</button></div>
    </header>
    <div class="dashboard-layout">
      <aside class="command-sidebar"><p class="nav-caption">TU AVENTURA</p><nav aria-label="Módulos del centro de mando"><button v-for="entry in modules" :key="entry.id" :data-module="entry.id" :aria-current="module === entry.id ? 'page' : undefined" @click="navigate(entry.id)"><span aria-hidden="true">{{ entry.icon }}</span>{{ entry.label }}<small v-if="entry.id === 'participants'">{{ config.participants.length }}</small></button></nav><div class="sidebar-note"><span aria-hidden="true">◆</span><strong>Dos equipos.<br />Un mismo poder.</strong><p>Preparados por separado.<br />Invencibles juntos.</p></div></aside>
      <main id="command-main" class="command-main" tabindex="-1">
        <div class="module-heading"><div><p class="kicker">{{ profileLabels[profile.id] }} / CENTRO DE MANDO</p><h1 ref="title" tabindex="-1">{{ selectedModule.label }}</h1><p>{{ selectedModule.description }}</p></div><span class="module-tag">{{ module === 'overview' ? `${ready} / 3 pasos preparados` : profileLabels[profile.id] }}</span></div>
        <p v-if="error || warning" class="notice error-notice" role="alert">{{ error || warning }}</p>
        <p v-if="message" class="notice" role="status">{{ message }}</p>
        <p v-if="validation" class="notice error-notice" role="alert">{{ validation }}</p>
        <p v-if="popupBlocked" class="notice" role="status">El navegador ha bloqueado la ventana. <a :href="publicUrl" target="_blank" rel="noopener">Abrir pantalla pública</a></p>
        <p v-if="pending.some(id => id !== profile.id)" class="hint">Hay borradores sin guardar en: {{ pending.filter(id => id !== profile.id).map(id => profileLabels[id]).join(', ') }}. Vuelve a ese perfil antes de cerrar.</p>
        <template v-if="module === 'overview'">
          <div v-if="legacyCount" class="notice">Hay {{ legacyCount }} configuraciones anteriores conservadas. Elige explícitamente qué datos trasladar a cada perfil. <button class="text-button" @click="navigate('settings')">Revisar datos anteriores →</button></div>
          <div class="metric-grid"><article class="metric"><span aria-hidden="true">♙</span><div><strong>{{ config.participants.length }}</strong><small>Participantes</small></div><button aria-label="Administrar participantes" @click="navigate('participants')">↗</button></article><article class="metric"><span aria-hidden="true">⚑</span><div><strong>2</strong><small>Equipos ninja</small></div><button aria-label="Administrar equipos" @click="navigate('teams')">↗</button></article><article class="metric"><span aria-hidden="true">◇</span><div><strong>{{ unassigned.length }}</strong><small>Sin equipo asignado</small></div><button aria-label="Asignar integrantes" @click="navigate('teams')">↗</button></article></div>
          <div class="overview-grid"><section class="panel mission-panel"><div class="section-title"><div><p class="kicker">ANTES DE LA AVENTURA</p><h2>Prepara tu misión</h2></div><span class="readiness-ring">{{ ready }}/3</span></div><p class="hint">Completa la configuración y comprueba tus recursos antes de reunir a los ninjas.</p><div class="readiness-list"><button v-for="(check, i) in checks" :key="check.label" @click="navigate(check.target)"><span class="check-marker" :class="{ done: check.done }">{{ check.done ? '✓' : String(i + 1).padStart(2, '0') }}</span><strong>{{ check.label }}</strong><span aria-hidden="true">→</span></button></div><button class="quiet-button" @click="navigate('media')">Comprobar imagen y vídeo →</button></section>
            <section class="panel live-panel"><p class="kicker"><span class="status-dot"></span> CONTROL DE PANTALLA</p><div class="live-scene-number">{{ String(orderedScenes.findIndex(s => s.id === scene.id) + 1).padStart(2, '0') }}<small>/ {{ orderedScenes.length }}</small></div><h2>{{ scene.title }}</h2><p class="hint">{{ scene.type === 'opening' ? 'Portada cinematográfica' : 'Vídeo local del maestro' }}</p><button class="primary" @click="navigate('presentation')">Controlar presentación →</button></section>
            <section class="panel"><div class="section-title"><h2>Tus equipos</h2><button class="text-button" @click="navigate('teams')">Editar →</button></div><div class="summary-teams"><div v-for="(team, i) in config.teams" :key="team.id"><span class="team-swatch" :style="{ background: team.color || 'transparent' }"></span><div><strong>{{ team.name || `Equipo ${i + 1}` }}</strong><small>{{ team.name ? `${team.memberIds.length} integrantes` : 'Nombre y color por definir' }}</small></div><b>{{ team.memberIds.length }}</b></div></div></section>
            <section class="panel"><p class="kicker">RECURSOS DEL PERFIL</p><h2>Una aventura con su propia voz</h2><p class="hint">Referencias configuradas; comprueba su disponibilidad en Recursos multimedia.</p><div class="file-reference"><span>IMG</span><code>{{ config.media.artwork }}</code></div><div class="file-reference"><span>VID</span><code>{{ config.media.video }}</code></div></section></div>
        </template>
        <ParticipantEditor v-else-if="module === 'participants'" :key="profile.id" :config="config" />
        <ProfileTeams v-else-if="module === 'teams'" :config="config" @distribute="shuffle" />
        <ProfileResources v-else-if="module === 'media'" :key="profile.id" :config="config" />
        <template v-else-if="module === 'presentation'"><SceneController :scene="scene" :config="profile" @select="$emit('select', $event)" /><div class="command-row"><button @click="restart">Reiniciar presentación…</button><span class="hint">Los números son posiciones. El progreso conserva el identificador estable de la escena.</span></div></template>
        <ProfileTransfer v-else :key="profile.id" :config="config" @replace="replace" />
        <div v-if="dirty" class="draft-actions"><span>Los cambios pertenecen solo a {{ profileLabels[profile.id] }}.</span><button @click="discard">Descartar borrador…</button></div>
        <footer class="command-footer"><span>✦ CENTRO DE MANDO NINJA</span><span>Configuración local · Recursos privados</span></footer>
      </main>
    </div>
  </div>
</template>
