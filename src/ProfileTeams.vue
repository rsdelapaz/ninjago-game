<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { assignProfileMember, type ProfileConfig } from './profile'
const props = defineProps<{ config: ProfileConfig }>()
defineEmits<{ distribute: [] }>()
const unassigned = computed(() => props.config.participants.filter(p => !props.config.teams.some(t => t.memberIds.includes(p.id))))
const suggestions = ref(props.config.teams.map(t => t.suggestedNames.join('\n')))
watch(() => props.config, c => { suggestions.value = c.teams.map(t => t.suggestedNames.join('\n')) })
function editSuggestions(index: number, event: Event) {
  const raw = (event.target as HTMLTextAreaElement).value
  suggestions.value[index] = raw
  props.config.teams[index].suggestedNames = raw.split('\n').map(n => n.trim()).filter(Boolean)
}
function assign(id: string, event: Event) { assignProfileMember(props.config, id, (event.target as HTMLSelectElement).value || null) }
</script>
<template>
  <div class="teams-module">
    <div class="command-row panel"><label>Reparto<select v-model="config.assignmentMode"><option value="manual">Manual</option><option value="automatic">Automático</option></select></label><div><button class="primary" :disabled="config.assignmentMode !== 'automatic' || !config.participants.length" @click="$emit('distribute')">Sortear y guardar reparto</button><small class="hint">Solo este botón realiza un sorteo. Nunca se repite al cargar.</small></div></div>
    <div class="team-grid">
      <section v-for="(team, index) in config.teams" :key="team.id" class="panel team-panel" :style="{ '--team-color': team.color || '#82969b' }">
        <div class="team-panel-head"><span class="team-index">0{{ index + 1 }}</span><div><small>EQUIPO {{ index + 1 }}</small><h3>{{ team.name || 'Sin nombre definitivo' }}</h3></div><span class="count-pill">{{ team.memberIds.length }} ninjas</span></div>
        <label>Nombre definitivo<input :value="team.name || ''" :list="`names-${index}`" maxlength="120" placeholder="Escribe o elige un título" @input="team.name = ($event.target as HTMLInputElement).value || null" /></label>
        <datalist :id="`names-${index}`"><option v-for="(name, n) in team.suggestedNames" :key="n" :value="name" /></datalist>
        <label>Títulos sugeridos · uno por línea<textarea :value="suggestions[index]" rows="3" @input="editSuggestions(index, $event)" /></label>
        <label>Capitán del equipo<select v-model="team.captainId"><option :value="null">Sin capitán</option><option v-for="id in team.memberIds" :key="id" :value="id">{{ config.participants.find(p => p.id === id)?.name }}</option></select></label>
        <p class="hint">El capitán debe estar asignado a este equipo. Elige uno después del reparto. Los nombres y colores pueden decidirse durante la ceremonia.</p>
        <div class="command-row color-row"><label>Color del equipo<input type="color" :class="{ 'color-unset': !team.color }" :value="team.color || '#ffffff'" @input="team.color = ($event.target as HTMLInputElement).value" /></label><span>{{ team.color || 'Sin color definido' }}</span><button v-if="team.color" @click="team.color = null">Quitar color</button></div>
        <ul v-if="team.memberIds.length" class="member-chips"><li v-for="id in team.memberIds" :key="id">{{ config.participants.find(p => p.id === id)?.name }}</li></ul><p v-else class="empty-inline">Todavía no tiene integrantes.</p>
      </section>
    </div>
    <section class="panel"><div class="section-title"><h3>Asignación individual</h3><span class="count-pill">{{ unassigned.length }} sin asignar</span></div>
      <p v-if="!config.participants.length" class="empty-inline">Añade participantes para comenzar a formar los equipos.</p>
      <div class="assignment-grid"><label v-for="p in config.participants" :key="p.id">{{ p.name }}<select :value="config.teams.find(t => t.memberIds.includes(p.id))?.id || ''" @change="assign(p.id, $event)"><option value="">Sin asignar</option><option v-for="(team, index) in config.teams" :key="team.id" :value="team.id">{{ team.name || `Equipo ${index + 1}` }}</option></select></label></div>
      <p v-if="unassigned.length" class="hint">Sin asignar: {{ unassigned.map(p => p.name).join(', ') }}</p>
    </section>
  </div>
</template>
