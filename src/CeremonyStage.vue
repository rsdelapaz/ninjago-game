<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
import { mediaUrl, publicMembers, ceremonyProblems, type ProfileConfig } from './profile'
import { activeTeamIndex, colorOptions, currentProposal, ceremonyFinalProblems, type CeremonyProgress } from './ceremony'
import './ceremony.css'
const props = defineProps<{ config: ProfileConfig; progress: CeremonyProgress }>()
const failed = ref(false), heading = ref<HTMLElement | null>(null)
const art = computed(() => mediaUrl(props.config, 'artwork', import.meta.env.BASE_URL))
const index = computed(() => activeTeamIndex(props.progress))
const team = computed(() => props.config.teams[index.value])
const captain = computed(() => props.config.participants.find(p => p.id === team.value.captainId))
const final = computed(() => ['ready', 'complete'].includes(props.progress.phase))
const ensemble = computed(() => props.progress.phase === 'arrival' || final.value)
const problems = computed(() => final.value ? ceremonyFinalProblems(props.config, props.progress) : ceremonyProblems(props.config))
const title = computed(() => ensemble.value ? final.value ? 'JUNTOS, INVENCIBLES' : 'LOS ELEGIDOS DEL MONASTERIO' : props.progress.phase.startsWith('color-') ? 'DESPERTAD VUESTRO ELEMENTO' : 'FORJAD VUESTRO NOMBRE')
const proposal = computed(() => currentProposal(props.config, props.progress))
const acceptedName = computed(() => props.progress.confirmedNames[index.value] ? team.value.name : null)
const narration = computed(() => ensemble.value ? final.value ? '«Vuestros nombres ya resuenan en el monasterio. Ahora, escuchad mi mensaje.»' : '«Dos equipos. Dos capitanes. Una misión que solo podréis completar juntos.»' : props.progress.phase.startsWith('color-') ? props.progress.confirmedColors[index.value] ? '«Un gran poder. Llevadlo con sabiduría.»' : '«Ninjas, ¿qué poder os acompañará en esta aventura?»' : acceptedName.value ? '«Que ese nombre os recuerde de lo que sois capaces juntos.»' : proposal.value ? '«Un nombre debe unir a todo el equipo. ¿Es este el vuestro?»' : '«El mejor nombre puede estar en vuestra imaginación. Decididlo juntos.»')
watch(art, () => { failed.value = false })
watch(() => props.progress.phase, async () => { await nextTick(); heading.value?.focus() })
</script>
<template>
  <main class="ceremony-stage" :class="{ 'ceremony-finale': final }">
    <MonasteryBackdrop />
    <img v-if="!failed" class="ceremony-art" :src="art" alt="" @error="failed = true" />
    <div class="ceremony-shade" aria-hidden="true"></div><div class="temple-ring" aria-hidden="true"></div>
    <div class="ceremony-topline"><span>EL SECRETO DEL MAESTRO WU</span><span>◆ EL DESPERTAR DE LOS EQUIPOS ◆</span></div>
    <header class="ceremony-heading"><p class="ceremony-kicker">{{ ensemble ? 'EL MONASTERIO OS DA LA BIENVENIDA' : `EL DESTINO DEL EQUIPO ${index + 1}` }}</p><h1 ref="heading" tabindex="-1">{{ title }}</h1><div class="ceremony-rule" aria-hidden="true">◆</div></header>
    <p v-if="problems.length" class="ceremony-wait" role="status">El maestro Wu espera mientras el organizador prepara los equipos.</p>
    <!-- One keyed view animates the internal state machine, not a component per question.
         https://vuejs.org/guide/built-ins/transition.html -->
    <Transition v-else name="ceremony-reveal" mode="out-in">
      <section v-if="ensemble" :key="final ? 'final' : 'arrival'" class="ceremony-ensemble" aria-label="Los dos equipos ninja">
        <article v-for="(entry, i) in config.teams" :key="entry.id" class="ninja-banner" :style="{ '--banner-color': final ? entry.color || '#e3c789' : '#e3c789' }">
          <div class="banner-corners" aria-hidden="true"></div>
          <div class="banner-crest" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="m32 4 23 12v25L32 60 9 41V16Z"/><path d="m20 22 12-8 12 8-4 13-8 10-8-10Z"/><path d="m21 27 11 4 11-4M32 31v14"/></svg></div>
          <p class="banner-number">EQUIPO {{ String(i + 1).padStart(2, '0') }}</p><h2>{{ final ? entry.name : `Equipo ${i + 1}` }}</h2>
          <span class="banner-color-name">{{ final ? 'VUESTRO PODER HA DESPERTADO' : 'VUESTRO DESTINO ESTÁ POR ESCRIBIR' }}</span>
          <ul class="ninja-roster"><li v-for="member in publicMembers(config, entry)" :key="member.id" :class="{ 'ninja-captain': entry.captainId === member.id }"><span v-if="entry.captainId === member.id" class="captain-badge"><span aria-hidden="true">✦</span> CAPITÁN</span><span class="ninja-name">{{ member.name }}</span><span v-if="entry.captainId === member.id" class="captain-vow">GUÍA A TU EQUIPO · CUIDA DE TUS NINJAS</span></li></ul>
          <span class="banner-tail" aria-hidden="true">◆</span>
        </article>
      </section>
      <section v-else :key="progress.phase" class="ceremony-choice" aria-label="Elección del equipo">
        <div class="choice-team"><span class="choice-team-mark" aria-hidden="true">✦</span><div><span>EQUIPO {{ index + 1 }}</span><strong>{{ captain?.name }} <small>· CAPITÁN</small></strong></div></div>
        <div v-if="progress.phase.startsWith('color-')" class="element-choices">
          <article v-for="color in colorOptions(config, progress)" :key="color.id" class="element-choice" :class="{ chosen: progress.confirmedColors[index] && team.color === color.hex }" :style="{ '--element-color': color.hex }"><span class="element-glyph" aria-hidden="true">{{ color.symbol }}</span><span class="element-type">PODER NINJA</span><h2>{{ color.name }}</h2><p>{{ color.element }}</p><span class="choice-state">{{ progress.confirmedColors[index] && team.color === color.hex ? '✦ PODER ELEGIDO ✦' : '¿ES ESTE VUESTRO ELEMENTO?' }}</span></article>
        </div>
        <div v-else class="name-revelation" :class="{ accepted: !!acceptedName }"><span class="name-label">{{ acceptedName ? 'VUESTRO NOMBRE NINJA' : proposal ? 'WU OS PROPONE' : 'CREAD VUESTRA LEYENDA' }}</span><h2>{{ acceptedName || proposal || '¿CÓMO OS LLAMARÉIS?' }}</h2><div class="name-ornament" aria-hidden="true">◆ ━━━━━ ◆ ━━━━━ ◆</div><p>{{ acceptedName ? 'UN NOMBRE. UN EQUIPO. UN MISMO ESPÍRITU.' : proposal ? '¿Os representa este nombre, ninjas?' : 'Elegid juntos un nombre y contádselo al organizador.' }}</p><span v-if="acceptedName" class="name-accepted">✦ NOMBRE CONFIRMADO ✦</span></div>
      </section>
    </Transition>
    <aside class="wu-narration" aria-live="polite"><span class="wu-medallion" aria-hidden="true">W</span><div><span>MAESTRO WU</span><p>{{ narration }}</p></div></aside>
    <footer class="ceremony-footer"><span>VALOR</span><span aria-hidden="true">◆</span><span>LEALTAD</span><span aria-hidden="true">◆</span><span>UNIÓN</span></footer>
  </main>
</template>
