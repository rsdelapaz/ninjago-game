<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { activeTeamIndex, colorOptions, currentProposal, phaseLabels, transitionCeremony, type CeremonyAction, type CeremonyProgress } from './ceremony'
const props = defineProps<{ config: ProfileConfig; progress: CeremonyProgress; disabled: boolean }>()
const emit = defineEmits<{ action: [action: CeremonyAction] }>()
const manualName = ref('')
const index = computed(() => activeTeamIndex(props.progress))
const proposal = computed(() => currentProposal(props.config, props.progress))
const nextProblem = computed(() => {
  try { transitionCeremony(props.config, props.progress, { type: 'next' }); return '' }
  catch(e) { return e instanceof Error ? e.message : 'Revisa la preparación.' }
})
watch(() => [props.config.id, props.progress.phase], () => { manualName.value = '' })
function restart() {
  if (window.confirm('¿Repetir la ceremonia desde la presentación de equipos? Se conservan los nombres y colores guardados, pero habrá que confirmarlos otra vez.')) emit('action', { type: 'restart' })
}
</script>
<template>
  <section class="panel ceremony-controls" aria-labelledby="ceremony-controls-title">
    <p class="kicker">SOLO PARA EL ORGANIZADOR · ELECCIONES DE LOS NIÑOS</p>
    <h2 id="ceremony-controls-title">{{ phaseLabels[progress.phase] }}</h2>
    <p class="hint">Confirma lo que elijan los ninjas. Cada decisión se guarda en el perfil activo. Volver atrás conserva las decisiones.</p>
    <fieldset :disabled="disabled"><legend>Respuesta de los equipos</legend>
      <template v-if="progress.phase.startsWith('color-')">
        <p>Wu ofrece estos dos colores al equipo {{ index + 1 }}:</p>
        <div class="command-row"><button v-for="color in colorOptions(config, progress)" :key="color.id" :aria-pressed="progress.confirmedColors[index] && config.teams[index].color === color.hex" @click="emit('action', { type: 'color', color: color.hex })"><span class="control-color" :style="{ background: color.hex }"></span>{{ color.name }}<span v-if="progress.confirmedColors[index] && config.teams[index].color === color.hex"> ✓ Confirmado</span></button></div>
      </template>
      <template v-else-if="progress.phase.startsWith('name-')">
        <template v-if="progress.confirmedNames[index]"><p>Nombre confirmado: <strong>{{ config.teams[index].name }}</strong>. Puedes continuar o rechazar la propuesta actual para probar otra.</p></template>
        <p v-else-if="proposal">Propuesta en pantalla: <strong>{{ proposal }}</strong></p>
        <div v-if="proposal" class="command-row"><button class="primary" @click="emit('action', { type: 'accept-name' })">SÍ · Aceptar nombre</button><button @click="emit('action', { type: 'reject-name' })">NO · Siguiente propuesta</button></div>
        <form v-else class="command-row" @submit.prevent="emit('action', { type: 'manual-name', name: manualName })"><label>Propuestas agotadas · Nombre elegido por los niños<input v-model="manualName" required maxlength="120" placeholder="Escribe su nombre ninja" /></label><button class="primary">Confirmar nombre manual</button></form>
      </template>
      <p v-else>{{ progress.phase === 'arrival' ? 'Presenta a los capitanes y sus equipos. Después, comienza la elección del primer color.' : 'Los dos equipos están preparados. Avanza para escuchar al maestro Wu.' }}</p>
      <p v-if="nextProblem" class="hint" role="status">{{ nextProblem }}</p>
      <div class="command-row"><button :disabled="progress.phase === 'arrival'" @click="emit('action', { type: 'back' })">← Fase anterior</button><button class="primary" :disabled="!!nextProblem" @click="emit('action', { type: 'next' })">{{ ['ready','complete'].includes(progress.phase) ? 'Continuar al mensaje de Wu →' : 'Avanzar fase →' }}</button></div>
      <button class="quiet-button" @click="restart">Repetir ceremonia…</button>
    </fieldset>
  </section>
</template>
<style scoped>
.ceremony-controls { margin-bottom: 1.5rem; }.ceremony-controls fieldset { min-width: 0; border: 1px solid #55717c; padding: 1rem; border-radius: .4rem; }.ceremony-controls legend { color: #e8d299; padding: 0 .5rem; }.control-color { display: inline-block; width: 1.25rem; height: 1.25rem; border: 1px solid #fff9; border-radius: 50%; margin-right: .5rem; vertical-align: middle; }
</style>
