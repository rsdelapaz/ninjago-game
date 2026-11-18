<script setup lang="ts">
import { computed } from 'vue'
import { assignMember, type LegacySessionConfig } from './session'
import { sortParticipants, teamMembers } from './profile'
const props = defineProps<{ config: LegacySessionConfig }>()
defineEmits<{ distribute: [] }>()
const unassigned = computed(() => sortParticipants(props.config.participants.filter(p => !props.config.teams.some(t => t.memberIds.includes(p.id)))))
function move(id: string, event: Event) { assignMember(props.config, id, (event.target as HTMLSelectElement).value || null) }
</script>
<template>
  <section class="command-section" aria-labelledby="teams-title">
    <h2 id="teams-title">Los dos equipos</h2>
    <div class="command-row"><label>Modo de asignación<select v-model="config.assignmentMode"><option value="manual">Manual</option><option value="automatic">Automático</option></select></label>
      <button type="button" :disabled="config.assignmentMode !== 'automatic' || !config.participants.length" @click="$emit('distribute')">Sortear y guardar reparto equilibrado</button></div>
    <p>Elegir automático no sortea. Solo el botón realiza y guarda el reparto.</p>
    <div class="team-grid">
      <fieldset v-for="(team, index) in config.teams" :key="team.id"><legend>Equipo {{ index + 1 }} · {{ team.memberIds.length }} ninjas</legend>
        <label>Nombre<input v-model="team.name" list="proposed-names" required maxlength="120" /></label>
        <label>Color<input v-model="team.color" type="color" /></label>
        <ul><li v-for="member in teamMembers(config, team)" :key="member.id">{{ member.name }}</li></ul>
        <p v-if="!team.memberIds.length">Todavía no tiene miembros.</p>
      </fieldset>
    </div>
    <h3>Asignación individual</h3>
    <div v-for="p in sortParticipants(config.participants)" :key="p.id" class="assignment-row"><label>{{ p.name }}<select :value="config.teams.find(t => t.memberIds.includes(p.id))?.id || ''" @change="move(p.id, $event)"><option value="">Sin asignar</option><option v-for="t in config.teams" :key="t.id" :value="t.id">{{ t.name }}</option></select></label></div>
    <p><strong>Sin asignar ({{ unassigned.length }}):</strong> {{ unassigned.map(p => p.name).join(', ') || 'Ninguno' }}</p>
  </section>
</template>
