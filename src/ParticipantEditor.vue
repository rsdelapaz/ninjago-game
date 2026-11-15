<script setup lang="ts">
import { confirmAction } from './confirmation'

import { ref } from 'vue'
import { clearInvalidCaptains, newId, sortParticipants, type Participant } from './profile'
const props = defineProps<{ config: { participants: Participant[]; teams: { memberIds: string[]; captainId?: string | null }[] } }>()
const name = ref('')
function add() {
  if (!name.value.trim() || props.config.participants.length >= 500) return
  props.config.participants.push({ id: newId(), name: name.value.trim() }); name.value = ''
}
async function remove(id: string) {
  const reviewed = props.config
  if (!await confirmAction('¿Quitar este participante y sus asignaciones del borrador?', 'Quitar participante', true)) return
  if (props.config !== reviewed) return
  props.config.participants = props.config.participants.filter(p => p.id !== id)
  props.config.teams.forEach(t => { t.memberIds = t.memberIds.filter(member => member !== id) })
  clearInvalidCaptains(props.config)
}
function age(id: string, event: Event) {
  const p = props.config.participants.find(p => p.id === id)!
  const value = (event.target as HTMLInputElement).value
  if (value === '') delete p.age
  else p.age = Number(value)
}
</script>
<template>
  <section class="command-section" aria-labelledby="participants-title">
    <h2 id="participants-title">Participantes <small>{{ config.participants.length }}</small></h2>
    <form class="command-row" @submit.prevent="add"><label>Nombre del nuevo ninja<input v-model="name" required maxlength="120" /></label><button>Añadir participante</button></form>
    <p v-if="!config.participants.length">Añade a los ninjas para preparar los dos equipos.</p>
    <div v-for="p in sortParticipants(config.participants)" :key="p.id" class="participant-row">
      <label>Nombre<input v-model="p.name" :aria-label="`Nombre de ${p.name}`" maxlength="120" required /></label>
      <label>Edad (opcional)<input type="number" min="0" max="120" step="1" :value="p.age" :aria-label="`Edad de ${p.name}`" @input="age(p.id, $event)" /></label>
      <label>Género (opcional)<input :value="p.gender" maxlength="60" :aria-label="`Género de ${p.name}`" @input="p.gender = ($event.target as HTMLInputElement).value || undefined" /></label>
      <button type="button" :aria-label="`Quitar a ${p.name}`" @click="remove(p.id)">Quitar</button>
    </div>
  </section>
</template>
