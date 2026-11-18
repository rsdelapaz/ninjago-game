<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileConfig, ProfileId } from './profile'
import { confirmations } from './confirmation'
const props = defineProps<{ config: ProfileConfig; challengeId: string; winner: string | null; version: string | null; disabled: boolean; imageExpanded: boolean; showingWinner: boolean; saveResult: (id: string, winner: string | null, version: string | null, profileId: ProfileId) => Promise<boolean> }>()
defineEmits<{ announce: [id: string, winner: string]; present: [id: string]; imageView: [id: string, expanded: boolean] }>()
const label = computed(() => props.config.teams.find(t => t.id === props.winner)?.name || (props.winner ? `Equipo ${props.config.teams.findIndex(t => t.id === props.winner) + 1}` : 'Pendiente'))
const challenge = computed(() => props.config.challenges.find(c => c.id === props.challengeId))
function choose(winner: string | null) {
  if (winner === props.winner) return
  const id = props.challengeId, version = props.version, profileId = props.config.id
  const save = async () => { if (!await props.saveResult(id, winner, version, profileId)) throw Error('No se guardó el resultado. Revisa el aviso del panel y cancela para actualizarlo.') }
  if (props.winner) void confirmations.ask({ title: 'Cambiar resultado guardado', explanation: `El resultado actual es ${label.value}. Se sustituirá por ${winner ? props.config.teams.find(t => t.id === winner)?.name || `Equipo ${props.config.teams.findIndex(t => t.id === winner) + 1}` : 'pendiente'}. El público no recibe un anuncio automático.`, actionLabel: 'Guardar nuevo resultado' }, save)
  else void save().catch(() => {}) // Parent controller shows contextual storage errors.
}
</script>
<template>
  <section class="panel challenge-controls"><h3>Guion del organizador</h3><p v-if="challenge && !challenge.publicInstruction.trim()" class="notice">Esta prueba aún no tiene instrucción pública breve. Puedes prepararla en Pruebas; el público verá una indicación para escucharte.</p><p v-if="challenge?.description" class="organizer-script" tabindex="0" aria-label="Instrucciones completas del organizador">{{ challenge.description }}</p><p v-else class="hint">No hay instrucciones de organización. Puedes añadirlas en Pruebas.</p><h3>Imagen de la prueba</h3><p>Para acertijos con letra pequeña, dedica el portal a la imagen. El título y las instrucciones se recuperan al volver a la vista normal.</p><button :disabled="disabled || showingWinner || !challenge?.imageFilename" :aria-pressed="imageExpanded" @click="$emit('imageView',challengeId,!imageExpanded)">{{ imageExpanded ? 'Volver a la vista normal' : 'Ampliar imagen en pantalla pública' }}</button><h3>Resultado de esta prueba</h3><p>Guardado: <strong>{{ label }}</strong>. Lo decide el organizador; guardar no anuncia nada al público.</p><div class="command-row"><button v-for="(team,i) in config.teams" :key="team.id" :disabled="disabled" :aria-pressed="winner === team.id" @click="choose(team.id)">{{ team.name || `Equipo ${i+1}` }} ganador</button><button :disabled="disabled" :aria-pressed="!winner" @click="choose(null)">Resultado pendiente</button></div><div class="command-row"><button class="primary" :disabled="disabled || !winner" @click="$emit('announce',challengeId,winner!)">Anunciar ganador al público</button><button :disabled="disabled" @click="$emit('present',`challenge:${challengeId}`)">Mostrar de nuevo la prueba</button></div></section>
</template>

<style scoped>
.organizer-script { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; max-height: 20rem; overflow-y: auto; }
</style>
