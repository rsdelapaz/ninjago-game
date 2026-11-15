<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { activeTeamIndex, colorOptions, currentProposal, phaseLabels, ceremonyPhases, ceremonyGuidance, ceremonyNextProblem, wuNarration, type CeremonyAction, type CeremonyProgress } from './ceremony'
import { revealPlan, revealFrame, type RevealState, type RevealAction } from './reveal'
import { useRevealClock } from './useRevealClock'
const props = defineProps<{ config: ProfileConfig; progress: CeremonyProgress; reveal: RevealState; disabled: boolean }>()
const emit = defineEmits<{ action: [action: CeremonyAction]; reveal: [action: RevealAction] }>()
const manualName = ref('')
const index = computed(() => activeTeamIndex(props.progress))
const proposal = computed(() => currentProposal(props.config, props.progress))
const nextProblem = computed(() => ceremonyNextProblem(props.config, props.progress))
const guide = computed(() => ceremonyGuidance(props.config, props.progress))
const now = useRevealClock(), pages = computed(() => revealPlan(props.config).count)
const frame = computed(() => revealFrame(props.reveal, pages.value, now.value))
watch(() => [props.config.id, props.progress.phase], () => { manualName.value = '' })
function restart() {
  if (window.confirm('¿Repetir la ceremonia desde la presentación de equipos? Se conservan los nombres y colores guardados, pero habrá que confirmarlos otra vez.')) emit('action', { type: 'restart' })
}
</script>
<template>
  <section class="panel ceremony-controls" aria-labelledby="ceremony-controls-title">
    <p class="kicker">PASO {{ ceremonyPhases.indexOf(progress.phase) + 1 }} DE 7 · CEREMONIA EN DIRECTO</p>
    <h2 id="ceremony-controls-title">{{ phaseLabels[progress.phase] }}</h2>
    <div class="operator-guidance"><p><strong>Los niños</strong>{{ guide.children }}</p><p><strong>Tú, organizador</strong>{{ guide.operator }}</p><p class="next-instruction"><strong>Para continuar</strong>{{ guide.continue }}</p></div>
    <p class="notice">Wu dice: {{ wuNarration(config, progress) }}</p>
    <ol class="ceremony-route" aria-label="Recorrido de la ceremonia"><li v-for="phase in ceremonyPhases" :key="phase" :aria-current="phase === progress.phase ? 'step' : undefined">{{ phaseLabels[phase] }}</li></ol>
    <fieldset :disabled="disabled"><legend>Respuesta de los equipos</legend>
      <div v-if="['arrival','ready','complete'].includes(progress.phase)" class="reveal-tools"><p class="hint">El público ve las placas de los clanes. La animación no bloquea el avance. Omitir o repetir solo cambia la presentación visual.</p><div class="command-row"><button @click="emit('reveal','skip')">Omitir animación</button><button @click="emit('reveal','replay')">Repetir revelación</button></div><div v-if="pages > 1" class="command-row"><span role="status">Grupo {{ frame.page + 1 }} de {{ pages }} · {{ reveal.automatic ? 'Automático cada 10 s' : 'Pausado' }}</span><button :disabled="frame.page === 0" @click="emit('reveal','previous')">← Grupo anterior</button><button @click="emit('reveal','pause')">{{ reveal.automatic ? 'Pausar grupos' : 'Continuar grupos' }}</button><button :disabled="frame.page >= pages - 1" @click="emit('reveal','next')">Grupo siguiente →</button></div></div>
      <template v-if="progress.phase.startsWith('color-')">
        <p>Wu ofrece estos dos colores al equipo {{ index + 1 }}:</p>
        <div class="command-row"><button v-for="color in colorOptions(config, progress)" :key="color.id" :aria-pressed="progress.confirmedColors[index] && config.teams[index].color === color.hex" @click="emit('action', { type: 'color', color: color.hex })"><span class="control-color" :style="{ background: color.hex }"></span>{{ color.name }}<span v-if="progress.confirmedColors[index] && config.teams[index].color === color.hex"> ✓ Confirmado</span></button></div>
      </template>
      <template v-else-if="progress.phase.startsWith('name-')">
        <template v-if="progress.confirmedNames[index]"><p>Nombre confirmado: <strong>{{ config.teams[index].name }}</strong>. Puedes continuar o rechazar la propuesta actual para probar otra.</p></template>
        <p v-else-if="proposal">Propuesta {{ progress.proposalIndexes[index] + 1 }} de {{ config.teams[index].suggestedNames.length }} en pantalla: <strong>{{ proposal }}</strong></p>
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
.operator-guidance { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }.operator-guidance p { color: #d0dfe1; line-height: 1.6; margin: 0; }.operator-guidance strong { display: block; color: #ffe3a0; font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .25rem; }.operator-guidance .next-instruction { grid-column: 1/-1; padding: .75rem 1rem; background: #e6c77814; border-left: 3px solid #e6c778; color: #fff2d0; }.ceremony-route { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: .5rem; list-style-position: inside; padding: 0; margin: 1.25rem 0; }.ceremony-route li { padding: .5rem; border-top: 2px solid #44616b; font-size: .7rem; color: #b4c9ce; overflow-wrap: anywhere; }.ceremony-route li[aria-current] { color: #ffdf91; border-color: #ffdf91; background: #edcf7c15; font-weight: 800; }@media(max-width:767px) { .operator-guidance { grid-template-columns: 1fr; }.ceremony-route { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
