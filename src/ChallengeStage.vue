<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Challenge } from './challenges'
import { challengeImageUrl } from './challenges'
import type { ProfileConfig } from './profile'
import SkyMonastery from './SkyMonastery.vue'
import './challenge-sky.css'
const props = defineProps<{ challenge: Challenge; config: ProfileConfig; number: number; winner?: string; preview?: boolean }>()
const failed = ref(false), heading = ref<HTMLHeadingElement | null>(null)
function focusHeading() { if (!props.preview) heading.value?.focus() }
onMounted(focusHeading)
watch(() => props.winner, async () => { await nextTick(); focusHeading() })
const image = computed(() => props.challenge.imageFilename ? challengeImageUrl(props.config.id, props.challenge.imageFilename, import.meta.env.BASE_URL) : '')
watch(image, () => { failed.value = false })
const winningTeam = computed(() => props.config.teams.find(t => t.id === props.winner))
const teamIndex = computed(() => props.config.teams.findIndex(t => t.id === props.winner))
</script>
<template>
  <section class="challenge-stage sky-call" :class="{ 'challenge-preview': preview, 'sky-celebration': !!winningTeam }" :style="{ '--mission-color': winningTeam?.color || '#a9e4dc' }" :aria-label="`Prueba ${number}: ${challenge.title}`">
    <SkyMonastery :teams="config.teams" :winner="winner" />
    <div class="sky-light" aria-hidden="true"></div>
    <div class="sky-cloud cloud-left" aria-hidden="true"></div><div class="sky-cloud cloud-right" aria-hidden="true"></div>
    <div class="sky-sparks" aria-hidden="true"><i v-for="n in 12" :key="n" :style="{ '--spark': n }"></i></div>
    <header class="sky-chapter">EL SECRETO DEL MAESTRO WU <span>LA LLAMADA DEL CIELO</span></header>
    <div :key="`${challenge.id}:${winner || 'mission'}`" class="sky-projection" :class="{ 'projection-victory': !!winningTeam }">
      <div class="projection-orbit" aria-hidden="true"></div><div class="projection-orbit orbit-inner" aria-hidden="true"></div>
      <template v-if="winningTeam">
        <p class="mission-number">PRUEBA {{ String(number).padStart(2,'0') }} · EL CIELO CELEBRA VUESTRO VALOR</p>
        <svg class="victory-emblem" viewBox="0 0 160 160" aria-hidden="true"><path d="m80 8 61 35v72l-61 37-61-37V43Z"/><path v-if="teamIndex === 0" d="m80 32-13 29-29-12 16 43 26 30 26-30 16-43-29 12ZM59 83l21 14 21-14"/><path v-else d="m91 29-44 59h31l-16 46 51-69H85Z"/></svg>
        <h1 ref="heading" tabindex="-1" class="winner-name">{{ winningTeam.name || `Equipo ${teamIndex + 1}` }}</h1>
        <strong class="winner-salute">¡EQUIPO GANADOR!</strong><p class="victory-mission">{{ challenge.title }}</p>
        <p class="shared-honor">DOS EQUIPOS VALIENTES. UNA AVENTURA COMPARTIDA.</p>
      </template>
      <template v-else>
        <p class="mission-number">PRUEBA {{ String(number).padStart(2,'0') }} · UNA NUEVA MISIÓN OS ESPERA</p>
        <h1 ref="heading" tabindex="-1" class="mission-title" :class="{ 'long-mission-title': challenge.title.length > 80 }">{{ challenge.title }}</h1>
        <figure class="projected-image"><img v-if="image && !failed" :src="image" :alt="challenge.title" @error="failed = true" /><svg v-else viewBox="0 0 320 240" role="img" aria-label="Emblema de misión ninja"><path d="m160 15 110 60v100l-110 55L50 175V75Z"/><path d="m160 45-18 55-65-20 40 58-20 60 63-35 63 35-20-60 40-58-65 20Z"/><path d="m167 83-30 48h26l-8 36 34-51h-26Z"/></svg></figure>
        <div class="mission-copy"><p v-if="challenge.description.length > 480" class="more-instructions">Más instrucciones abajo ↓</p><div class="mission-instructions" tabindex="0" aria-label="Instrucciones completas de la misión"><p>{{ challenge.description }}</p></div></div>
      </template>
    </div>
    <div class="clans-watching" aria-hidden="true"><span :style="{ color: config.teams[0].color || '#d1c29e' }">{{ config.teams[0].name || 'Equipo 1' }}</span><span :style="{ color: config.teams[1].color || '#a3cbd5' }">{{ config.teams[1].name || 'Equipo 2' }}</span></div>
    <footer class="sky-footer">JUNTOS, EL CIELO ES SOLO EL PRINCIPIO</footer>
  </section>
  <p v-if="preview && (!image || failed)" class="sky-resource-notice" role="status">{{ image ? 'No se encuentra la imagen. Comprueba el archivo en la carpeta privada de este perfil. El público verá el emblema.' : 'Sin imagen: se mostrará el emblema ninja.' }}</p>
</template>
