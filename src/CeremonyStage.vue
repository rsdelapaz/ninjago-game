<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
import { mediaUrl, ceremonyProblems, type ProfileConfig } from './profile'
import ClanReveal from './ClanReveal.vue'
import type { RevealState } from './reveal'
import { activeTeamIndex, colorOptions, currentProposal, ceremonyFinalProblems, wuNarration, type CeremonyProgress } from './ceremony'
import './ceremony.css'
const props = defineProps<{ config: ProfileConfig; progress: CeremonyProgress; reveal: RevealState }>()
const failed = ref(false), heading = ref<HTMLElement | null>(null)
const art = computed(() => mediaUrl(props.config, 'artwork', import.meta.env.BASE_URL))
const index = computed(() => activeTeamIndex(props.progress))
const team = computed(() => props.config.teams[index.value])
const captain = computed(() => props.config.participants.find(p => p.id === team.value.captainId))
const final = computed(() => ['ready', 'complete'].includes(props.progress.phase))
const ensemble = computed(() => props.progress.phase === 'arrival' || final.value)
const problems = computed(() => final.value ? ceremonyFinalProblems(props.config, props.progress) : ceremonyProblems(props.config))
const title = computed(() => ensemble.value ? final.value ? 'JUNTOS, INVENCIBLES' : 'EL DESPERTAR DE LOS CLANES' : props.progress.phase.startsWith('color-') ? 'DESPERTAD VUESTRO ELEMENTO' : 'VUESTRO NOMBRE SERÁ LEYENDA')
const proposal = computed(() => currentProposal(props.config, props.progress))
const acceptedName = computed(() => props.progress.confirmedNames[index.value] ? team.value.name : null)
const narration = computed(() => wuNarration(props.config, props.progress))
watch(art, () => { failed.value = false })
watch(() => props.progress.phase, async () => { await nextTick(); heading.value?.focus() })
</script>
<template>
  <main class="ceremony-stage" :class="{ 'ceremony-finale': final, 'ceremony-assembled': ensemble }">
    <MonasteryBackdrop />
    <img v-if="!failed" class="ceremony-art" :src="art" alt="" @error="failed = true" />
    <div class="ceremony-shade" aria-hidden="true"></div><div class="temple-ring" aria-hidden="true"></div>
    <svg class="ceremony-energy" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M0 820Q370 750 115 440T290 0M1600 820Q1230 750 1485 440T1310 0"/><path d="M0 850Q420 740 155 440T330 0M1600 850Q1180 740 1445 440T1270 0"/></svg>
    <div class="ceremony-topline"><span>EL SECRETO DEL MAESTRO WU</span><span>◆ DOS CLANES · UNA MISIÓN ◆</span></div>
    <header class="ceremony-heading"><p class="ceremony-kicker">{{ ensemble ? 'EL MONASTERIO OS DA LA BIENVENIDA' : `EL DESTINO DEL EQUIPO ${index + 1}` }}</p><h1 ref="heading" tabindex="-1">{{ title }}</h1><div class="ceremony-rule" aria-hidden="true">◆</div></header>
    <p v-if="problems.length" class="ceremony-wait" role="status">El maestro Wu espera mientras el organizador prepara los equipos.</p>
    <!-- One keyed view animates the internal state machine, not a component per question.
         https://vuejs.org/guide/built-ins/transition.html -->
    <Transition v-else name="ceremony-reveal" mode="out-in">
      <ClanReveal v-if="ensemble" :key="final ? 'final' : 'arrival'" :config="config" :reveal="reveal" :final="final" />
      <section v-else :key="progress.phase" class="ceremony-choice" aria-label="Elección del equipo">
        <div class="choice-team"><span class="choice-team-mark" aria-hidden="true">✦</span><div><span>EQUIPO {{ index + 1 }}</span><strong>{{ captain?.name }} <small>· CAPITÁN</small></strong></div></div>
        <div v-if="progress.phase.startsWith('color-')" class="element-choices">
          <article v-for="color in colorOptions(config, progress)" :key="color.id" class="element-choice" :class="{ chosen: progress.confirmedColors[index] && team.color === color.hex }" :style="{ '--element-color': color.hex }"><span class="element-glyph" aria-hidden="true">{{ color.symbol }}</span><span class="element-type">PODER NINJA</span><h2>{{ color.name }}</h2><p>{{ color.element }}</p><span class="choice-state">{{ progress.confirmedColors[index] && team.color === color.hex ? '✦ PODER ELEGIDO ✦' : '¿ES ESTE VUESTRO ELEMENTO?' }}</span></article>
        </div>
        <div v-else :key="acceptedName ? `accepted:${acceptedName}` : proposal || 'manual'" class="name-revelation" :class="{ accepted: !!acceptedName, 'empty-scroll': !acceptedName && !proposal, 'long-proposal': (acceptedName || proposal || '').length > 45 }"><div v-if="acceptedName" class="acceptance-rays" aria-hidden="true"><i v-for="ray in 12" :key="ray" :style="{ '--ray': ray }"></i></div><span class="name-label">{{ acceptedName ? 'EL MONASTERIO RECONOCE VUESTRO NOMBRE' : proposal ? 'DEL PERGAMINO DEL MAESTRO WU' : 'ESTE PERGAMINO OS PERTENECE' }}</span><h2>{{ acceptedName || proposal || 'ESCRIBID VUESTRA LEYENDA' }}</h2><div class="name-ornament" aria-hidden="true">◆ ━━━━━ ◆ ━━━━━ ◆</div><p>{{ acceptedName ? 'UN NOMBRE. UN EQUIPO. UN MISMO ESPÍRITU.' : proposal ? '¿Os representa este nombre, ninjas?' : 'Inventad juntos vuestro nombre y contádselo al organizador.' }}</p><span v-if="acceptedName" class="name-accepted">✦ NOMBRE CONFIRMADO ✦</span></div>
      </section>
    </Transition>
    <aside class="wu-narration" aria-live="polite"><div class="wu-portrait" aria-hidden="true"><img v-if="!failed" :src="art" alt="" @error="failed = true" /><svg v-else viewBox="0 0 100 100"><path d="M10 38 50 9 90 38Z" fill="#dfc68c"/><path d="M31 40Q26 60 50 90 74 60 69 40Z" fill="#fff3cb"/><path d="M35 40H65L60 55H40Z" fill="#c6a968"/><path d="m39 45 6 2m10 0 6-2" stroke="#142e34" stroke-width="3"/></svg><span>WU</span></div><div class="wu-dialogue"><span>MAESTRO WU · LOS PERGAMINOS HABLAN</span><p :key="narration">{{ narration }}</p></div></aside>
    <footer class="ceremony-footer"><span>VALOR</span><span aria-hidden="true">◆</span><span>LEALTAD</span><span aria-hidden="true">◆</span><span>UNIÓN</span></footer>
  </main>
</template>
