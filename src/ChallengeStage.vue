<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Challenge } from './challenges'
import { challengeImageUrl } from './challenges'
import type { ProfileConfig } from './profile'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
const props = defineProps<{ challenge: Challenge; config: ProfileConfig; number: number; winner?: string; preview?: boolean }>()
const failed = ref(false)
const heading = ref<HTMLHeadingElement | null>(null)
function focusHeading() { if (!props.preview) heading.value?.focus() }
onMounted(focusHeading)
watch(() => props.winner, async () => { await nextTick(); focusHeading() })
const image = computed(() => props.challenge.imageFilename ? challengeImageUrl(props.config.id, props.challenge.imageFilename, import.meta.env.BASE_URL) : '')
watch(image, () => { failed.value = false })
const winningTeam = computed(() => props.config.teams.find(t => t.id === props.winner))
</script>
<template>
  <section class="challenge-stage" :class="{ 'challenge-preview': preview }" :aria-label="`Prueba ${number}: ${challenge.title}`">
    <MonasteryBackdrop /><div class="challenge-mist" aria-hidden="true"></div>
    <header><p>EL SECRETO DEL MAESTRO WU</p><span>PRUEBA {{ String(number).padStart(2, '0') }}</span></header>
    <div v-if="winningTeam" class="challenge-victory" aria-live="polite"><span aria-hidden="true">✦</span><p>EL MONASTERIO CELEBRA A</p><h1 ref="heading" tabindex="-1">{{ winningTeam.name || `Equipo ${config.teams.indexOf(winningTeam) + 1}` }}</h1><strong>¡EQUIPO GANADOR!</strong><p>{{ challenge.title }}</p></div>
    <div v-else class="challenge-content"><div><p class="challenge-kicker">NINJAS, VUESTRA MISIÓN</p><h1 ref="heading" tabindex="-1">{{ challenge.title }}</h1><p class="challenge-description">{{ challenge.description }}</p></div><figure><img v-if="image && !failed" :src="image" :alt="challenge.title" @error="failed = true" /><svg v-else viewBox="0 0 320 240" role="img" aria-label="Emblema de misión ninja"><path d="m160 15 110 60v100l-110 55L50 175V75Z"/><path d="m160 45-18 55-65-20 40 58-20 60 63-35 63 35-20-60 40-58-65 20Z"/><path d="m167 83-30 48h26l-8 36 34-51h-26Z"/></svg><figcaption v-if="preview && (!image || failed)">{{ image ? 'No se encuentra la imagen. Comprueba el archivo en la carpeta privada de este perfil. El público verá el emblema.' : 'Sin imagen: se mostrará el emblema ninja.' }}</figcaption></figure></div>
    <footer>DOS EQUIPOS · VALOR COMPARTIDO · UNA MISIÓN</footer>
  </section>
</template>
<style scoped>
.challenge-stage { position: relative; isolation: isolate; min-height: 100svh; padding: clamp(1rem,3vw,3rem); background: #071f2d; color: #fff3d2; display: grid; grid-template-rows: auto 1fr auto; gap: 1.5rem; overflow-wrap: anywhere; }.challenge-stage > :deep(.landscape) { z-index: -3; }.challenge-mist { position: absolute; inset: 0; z-index: -1; background: linear-gradient(120deg,#031a28ed,#0c3245c9); }.challenge-stage header { display: flex; justify-content: space-between; gap: 1rem; color: #f4d590; font-weight: 800; letter-spacing: .12em; }.challenge-stage header p { margin: 0; }.challenge-content { display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; gap: clamp(1.5rem,4vw,5rem); }.challenge-kicker { color: #e9c67b; letter-spacing: .2em; font-size: .8rem; }.challenge-stage h1 { font: 900 clamp(2rem,4vw,5rem)/1.12 'Trebuchet MS',sans-serif; color: #fff1bd; margin: 1rem 0; }.challenge-description { white-space: pre-wrap; font-size: clamp(1.25rem,2vw,2.25rem); line-height: 1.5; }.challenge-stage figure { margin: 0; padding: 1rem; border: 1px solid #e6c78088; background: #071e2e88; }.challenge-stage figure img { display: block; width: 100%; max-height: 60svh; object-fit: contain; }.challenge-stage svg { display: block; width: 100%; max-height: 50svh; fill: #163d4e; stroke: #edcd84; stroke-width: 2; }.challenge-stage svg path:last-child { fill: #edcd84; }.challenge-stage footer { text-align: center; color: #d6c99f; font-size: .7rem; letter-spacing: .15em; }.challenge-victory { align-self: center; text-align: center; }.challenge-victory > span { font-size: 5rem; color: #ffe398; }.challenge-victory strong { color: #ffe398; font-size: clamp(1.2rem,2vw,2rem); }.challenge-preview { min-height: 0; padding: 1rem; gap: 1rem; }.challenge-preview header,.challenge-preview footer { font-size: .55rem; }.challenge-preview h1 { font-size: 1.5rem; }.challenge-preview .challenge-description { font-size: 1rem; }.challenge-preview .challenge-content { grid-template-columns: 1fr; gap: .75rem; }.challenge-preview figure img,.challenge-preview svg { max-height: 12rem; }.challenge-preview figcaption { font-size: .8rem; line-height: 1.5; color: #edcc9e; }
@media(max-width:767px) { .challenge-content { grid-template-columns: 1fr; }.challenge-stage header { font-size: .6rem; }.challenge-description { font-size: 1.15rem; } }
</style>
