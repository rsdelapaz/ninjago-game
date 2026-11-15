<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { revealPlan, revealFrame, type RevealState } from './reveal'
import { useRevealClock } from './useRevealClock'
const props = defineProps<{ config: ProfileConfig; reveal: RevealState; final: boolean }>()
const now = useRevealClock(), plan = computed(() => revealPlan(props.config))
const frame = computed(() => revealFrame(props.reveal, plan.value.count, now.value))
const age = ref(0)
watch([() => props.reveal.startedAt, () => frame.value.page], () => { age.value = Math.max(0, Date.now() - frame.value.pageStartedAt) }, { immediate: true })
</script>
<template>
  <section :key="`${reveal.startedAt}:${frame.page}`" class="clan-reveal ceremony-ensemble" :class="{ 'reveal-instant': !reveal.animate, united: frame.activated }" :style="{ '--age': `${-age}ms` }" :data-reveal-page="frame.page" aria-label="El despertar de los clanes">
    <div class="clan-bond" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 50H420L455 20 500 50 545 20 580 50H1000M0 57H420L455 87 500 57 545 87 580 57H1000"/></svg><span>◆</span></div>
    <article v-for="(clan, i) in plan.teams" :key="clan.team.id" class="clan-board" :class="{ 'clan-spacious': clan.spacious }" :style="{ '--banner-color': final ? clan.team.color || '#f2d18d' : '#f2d18d' }" :aria-labelledby="`clan-${clan.team.id}`">
      <header class="clan-heading"><div class="clan-emblem" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="m40 3 30 17v35L40 77 10 55V20Z"/><path v-if="i === 0" d="m40 17-7 17-15-8 9 23 13 13 13-13 9-23-15 8Z M31 43l9 7 9-7"/><path v-else d="m48 15-24 29h17l-9 22 27-34H43Z"/></svg></div><div><p class="clan-number">CLAN {{ String(i + 1).padStart(2,'0') }}</p><h2 :id="`clan-${clan.team.id}`" :class="{ 'long-clan-title': final && (clan.team.name?.length || 0) > 32 }">{{ final ? clan.team.name : `Equipo ${i + 1}` }}</h2><p class="clan-motto">{{ final ? 'UN NOMBRE · UN MISMO ESPÍRITU' : 'CADA NINJA ES PARTE DE SU PODER' }}</p></div></header>
      <div class="clan-constellation">
        <svg class="clan-network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0V10M50 10 25 25M50 10 75 25M25 25V75M75 25V75M25 50H75M25 75H75"/></svg>
        <ul v-if="clan.pages[frame.page]?.length" class="ninja-roster"><li v-for="(member, n) in clan.pages[frame.page]" :key="member.id" class="ninja-plaque" :class="{ 'ninja-captain': member.id === clan.team.captainId }" :style="{ '--order': n }"><svg class="ninja-seal" viewBox="0 0 64 50" aria-hidden="true"><path d="M5 12 15 3h34l10 9-5 26-22 10L10 38Z"/><path d="m12 17 20 4 20-4-4 13-16-3-16 3Z"/><path d="m18 22 8 2m12 0 8-2"/></svg><span v-if="member.id === clan.team.captainId" class="captain-badge">✦ CAPITÁN</span><span class="ninja-name">{{ member.name }}</span><span class="plaque-link" aria-hidden="true">◆</span></li></ul>
        <div v-else class="clan-complete"><span aria-hidden="true">✦</span><p>Todos sus ninjas ya forman parte de la unión.</p></div>
      </div>
      <footer class="clan-team-power"><span aria-hidden="true">◆</span>{{ clan.members.length }} NINJAS · UN MISMO EQUIPO<span aria-hidden="true">◆</span></footer>
    </article>
    <div class="clan-union-caption"><strong>{{ frame.activated ? 'DOS CLANES. UN MISMO PODER.' : 'EL PODER ESTÁ EN CADA UNO DE VOSOTROS' }}</strong><span v-if="plan.count > 1">Grupo {{ frame.page + 1 }} de {{ plan.count }} · {{ reveal.automatic ? 'Todos los ninjas se presentan por turnos' : 'El organizador dirige los grupos' }}</span></div>
  </section>
</template>
