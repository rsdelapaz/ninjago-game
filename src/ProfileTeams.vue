<script setup lang="ts">
import { confirmAction } from './confirmation'

import { computed, ref, watch } from 'vue'
import { assignProfileMember, assignProfileMembers, sortParticipants, teamMembers, memberCandidateGroups, type ProfileConfig } from './profile'
const props = defineProps<{ config: ProfileConfig }>()
defineEmits<{ distribute: [] }>()
const unassigned = computed(() => sortParticipants(props.config.participants.filter(p => !props.config.teams.some(t => t.memberIds.includes(p.id)))))
const suggestions = ref(props.config.teams.map(t => t.suggestedNames.join('\n')))
const addingTeam = ref<string | null>(null), selectedMembers = ref<string[]>([])
watch(() => props.config, c => { suggestions.value = c.teams.map(t => t.suggestedNames.join('\n')); addingTeam.value = null; selectedMembers.value = [] })
function addNinjas(id: string) { addingTeam.value = id; selectedMembers.value = [] }
async function confirmMembers(id: string) {
  const reviewed = props.config, members = [...selectedMembers.value]
  const transfers = props.config.teams.some(t => t.id !== id && t.memberIds.some(member => selectedMembers.value.includes(member)))
  if (transfers && !await confirmAction('¿Trasladar los ninjas seleccionados a este equipo? Si alguno era capitán del equipo anterior, dejará de serlo.')) return
  if (props.config !== reviewed) return
  assignProfileMembers(props.config, members, id)
  addingTeam.value = null; selectedMembers.value = []
}
const membership = (id: string) => props.config.teams.find(t => t.memberIds.includes(id))
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
        <button class="primary add-ninjas" @click="addNinjas(team.id)">Añadir ninjas</button>
        <section v-if="addingTeam === team.id" class="member-picker" :aria-label="`Añadir ninjas al equipo ${index + 1}`">
          <p>Selecciona varios ninjas. Los que estén en el otro equipo se trasladarán al confirmar.</p>
          <div class="member-options"><fieldset v-for="group in memberCandidateGroups(config, team.id)" :key="group.id" class="candidate-group"><legend>{{ group.label }} · {{ group.participants.length }}</legend><p v-if="!group.participants.length" class="hint">No hay participantes en este grupo.</p><label v-for="p in group.participants" :key="p.id"><input v-model="selectedMembers" type="checkbox" :value="p.id" /><span>{{ p.name }}<small>{{ membership(p.id) ? `Trasladar de ${membership(p.id)!.name || 'Equipo ' + (config.teams.indexOf(membership(p.id)!) + 1)}` : 'Sin equipo' }}</small></span></label></fieldset></div>
          <p v-if="!config.participants.some(p => !team.memberIds.includes(p.id))" class="hint">No quedan participantes disponibles. Añádelos en Participantes.</p>
          <div class="command-row"><button class="primary" :disabled="!selectedMembers.length" @click="confirmMembers(team.id)">Confirmar {{ selectedMembers.length }} {{ selectedMembers.length === 1 ? 'integrante' : 'integrantes' }}</button><button @click="addingTeam = null">Cancelar selección</button></div>
        </section>
        <ul v-if="team.memberIds.length" class="team-member-list"><li v-for="member in teamMembers(config, team)" :key="member.id"><strong>{{ member.name }}</strong><span v-if="team.captainId === member.id" class="captain-chip">✦ Capitán</span><button v-else :aria-label="`Designar capitán a ${member.name}`" @click="team.captainId = member.id">Hacer capitán</button><button :aria-label="`Quitar del equipo a ${member.name}`" @click="assignProfileMember(config, member.id, null)">Quitar</button></li></ul><p v-else class="empty-inline">Todavía no tiene integrantes.</p>
        <details class="team-identity"><summary>Sugerencias, capitán y opciones de identidad</summary>
        <label>Nombre definitivo<input :value="team.name || ''" :list="`names-${index}`" maxlength="120" placeholder="Escribe o elige un título" @input="team.name = ($event.target as HTMLInputElement).value || null" /></label>
        <datalist :id="`names-${index}`"><option v-for="(name, n) in team.suggestedNames" :key="n" :value="name" /></datalist>
        <label>Títulos sugeridos · uno por línea<textarea :value="suggestions[index]" rows="3" @input="editSuggestions(index, $event)" /></label>
        <p class="hint">La ceremonia sigue el orden de las líneas. Puedes editarlas, reordenarlas, añadir nuevas o vaciar la lista para elegir un nombre manual.</p>
        <label>Capitán del equipo<select v-model="team.captainId"><option :value="null">Sin capitán</option><option v-for="member in teamMembers(config, team)" :key="member.id" :value="member.id">{{ member.name }}</option></select></label>
        <p class="hint">El capitán debe estar asignado a este equipo. Elige uno después del reparto. Los nombres y colores pueden decidirse durante la ceremonia.</p>
        <div class="command-row color-row"><label>Color del equipo<input type="color" :class="{ 'color-unset': !team.color }" :value="team.color || '#ffffff'" @input="team.color = ($event.target as HTMLInputElement).value" /></label><span>{{ team.color || 'Sin color definido' }}</span><button v-if="team.color" @click="team.color = null">Quitar color</button></div>
        </details>
      </section>
    </div>
    <section class="panel"><div class="section-title"><h3>Asignación individual</h3><span class="count-pill">{{ unassigned.length }} sin asignar</span></div>
      <p v-if="!config.participants.length" class="empty-inline">Añade participantes para comenzar a formar los equipos.</p>
      <div class="assignment-grid"><label v-for="p in sortParticipants(config.participants)" :key="p.id">{{ p.name }}<select :value="config.teams.find(t => t.memberIds.includes(p.id))?.id || ''" @change="assign(p.id, $event)"><option value="">Sin asignar</option><option v-for="(team, index) in config.teams" :key="team.id" :value="team.id">{{ team.name || `Equipo ${index + 1}` }}</option></select></label></div>
      <p v-if="unassigned.length" class="hint">Sin asignar: {{ unassigned.map(p => p.name).join(', ') }}</p>
    </section>
  </div>
</template>
<style scoped>
.add-ninjas { margin-bottom: 1rem; }.member-picker { padding: 1rem; border: 1px solid #9e8b56; background: #081f2a; margin-bottom: 1rem; }.member-picker p { font-size: .85rem; color: #c5d6d8; }.member-options { max-height: 18rem; overflow-y: auto; padding: .25rem; }.member-options label { display: flex; flex-direction: row; align-items: center; gap: .75rem; padding: .5rem; margin: 0; border-bottom: 1px solid #35515b; }.member-options input[type=checkbox] { width: 1.25rem; min-height: 1.25rem; flex-shrink: 0; }.member-options small { display: block; font-weight: 400; color: #b7cbd0; margin-top: .25rem; }.team-member-list { list-style: none; margin: 0 0 1rem; padding: 0; }.team-member-list li { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; border-bottom: 1px solid #3d5963; padding: .75rem 0; }.team-member-list strong { margin-right: auto; overflow-wrap: anywhere; min-width: 0; }.captain-chip { color: #f8d887; font-size: .8rem; font-weight: 800; }.team-identity summary { font-size: .9rem; }.team-identity label:first-of-type { margin-top: 1rem; }
</style>
<style scoped>
.candidate-group { min-width: 0; border: 1px solid #47636c; margin: 0 0 1rem; padding: .75rem; }.candidate-group legend { color: #f2d18a; font-size: .8rem; padding: 0 .25rem; }
</style>
