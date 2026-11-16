<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import OrganizerPanel from './OrganizerPanel.vue'
import { usePresentation } from './usePresentation'
import ProfileChooser from './ProfileChooser.vue'
import { mediaUrl, profileLabels } from './profile'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
import WuMessage from './WuMessage.vue'
import letsGoSeal from './assets/lets-go.svg'
import CeremonyStage from './CeremonyStage.vue'
import { browserScreenTransport, createPublicScreen } from './publicScreen'
import type { CeremonyAction } from './ceremony'
import type { RevealAction } from './reveal'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ChallengeStage from './ChallengeStage.vue'

// Explicit reactive state: https://vuejs.org/api/sfc-script-setup.html#reactivity
const isAdmin = new URLSearchParams(location.search).get('screen') === 'admin'
const { state, profile, ceremony, reveal, busy, activeScene, select, selectProfile, actCeremony, actReveal, results, resultsVersion, recordResult, announceResult, imageExpanded, setImageExpanded, resetProfile, refreshProfile, warning, initialized } = usePresentation()
const publicUrl = new URL(import.meta.env.BASE_URL, location.origin).href
const screenTransport = browserScreenTransport()
function openPublicWindow() {
  // Obtain/reuse the named window without reloading a live ceremony or its video.
  const view = window.open('', 'ninja-public', 'popup,width=1280,height=720')
  if (view && view.location.href === 'about:blank') view.location.replace(publicUrl)
  return view
}
const publicScreen = createPublicScreen({ role: isAdmin ? 'admin' : 'public', transport: screenTransport, open: openPublicWindow })
const { available: publicReady, message: publicMessage, waiting: publicWaiting } = publicScreen
const requestWarning = ref(''), operatorBusy = computed(() => busy.value || publicWaiting.value)
let mounted = true, publicMounted = false
onMounted(async () => { await initialized; await nextTick(); if (mounted && !isAdmin) { publicMounted = true; window.name = 'ninja-public'; publicScreen.markReady(!!profile.value && !!ceremony.value) } })
watch([profile, ceremony], () => { if (publicMounted && !isAdmin) publicScreen.markReady(!!profile.value && !!ceremony.value) })
onUnmounted(() => { mounted = false; publicScreen.dispose(); screenTransport.dispose() })
function withPublicScreen(action: () => Promise<unknown> | undefined) {
  const revision = state.value.revision, id = state.value.profileId
  requestWarning.value = ''
  // ensure opens synchronously in this click stack, then waits for a live public application's reply.
  const ready = publicScreen.ensure()
  return ready.then(confirmed => {
    if (!confirmed || !mounted) return
    if (state.value.revision !== revision || state.value.profileId !== id) { requestWarning.value = 'La presentación cambió durante la apertura. Revisa el perfil y repite la acción.'; return }
    return action()
  })
}
const showScene = (id: string) => withPublicScreen(() => select(id))
const commandCeremony = (action: CeremonyAction) => withPublicScreen(() => actCeremony(action))
const commandReveal = (action: RevealAction) => withPublicScreen(() => actReveal(action))
const commandAnnouncement = (id: string, winner: string) => withPublicScreen(() => announceResult(id, winner))
const commandImageView = (id: string, expanded: boolean) => withPublicScreen(() => setImageExpanded(id, expanded))
const scene = computed(() => state.value.sceneId)
watch(state, async () => { await nextTick(); if (!isAdmin) heading.value?.focus() })
const heading = ref<HTMLHeadingElement | null>(null)
const artworkAvailable = ref(true)
const artworkUrl = computed(() => profile.value ? mediaUrl(profile.value, 'artwork', import.meta.env.BASE_URL) : '')
const videoUrl = computed(() => profile.value ? mediaUrl(profile.value, 'video', import.meta.env.BASE_URL) : '')
watch(artworkUrl, () => { artworkAvailable.value = true })
const transitioning = ref(false)
async function goTo(target: string) {
  if (transitioning.value || scene.value === target) return
  const revision = state.value.revision
  transitioning.value = true
  // Match the CSS exit duration; reduced motion also skips this delay.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await new Promise(resolve => window.setTimeout(resolve, 360))
  }
  if (state.value.revision === revision) await select(target)
  await nextTick()
  heading.value?.focus()
  transitioning.value = false
}
</script>

<template>
  <ConfirmationDialog v-if="isAdmin" />
  <ProfileChooser v-if="!profile" :warning="warning" @choose="selectProfile" />
  <OrganizerPanel v-else-if="isAdmin" :profile="profile" :scene="activeScene" :ceremony="ceremony!" :reveal="reveal" :busy="operatorBusy" :reset-profile="resetProfile" :results="results" :results-version="resultsVersion" :record-result="recordResult" :image-expanded="imageExpanded" :showing-winner="!!state.announcement" :announced-winner="state.announcement?.winner" @image-view="commandImageView" @announce="commandAnnouncement" :public-ready="publicReady" :public-waiting="publicWaiting" :public-message="publicMessage" :public-url="publicUrl" :warning="requestWarning || warning" @select="showScene" @activate="selectProfile" @ceremony="commandCeremony" @reveal="commandReveal" @open-public="publicScreen.ensure()" @saved="refreshProfile" />
  <ChallengeStage v-else-if="activeScene.type === 'challenge' && profile.challenges.find(c => c.id === activeScene.challengeId)" :key="`${profile.id}:${activeScene.id}`" :challenge="profile.challenges.find(c => c.id === activeScene.challengeId)!" :config="profile" :number="activeScene.challengeNumber!" :expanded="imageExpanded" :winner="state.announcement?.challengeId === activeScene.challengeId ? state.announcement?.winner : undefined" />
  <CeremonyStage v-else-if="activeScene.type === 'ceremony' && ceremony" :config="profile" :progress="ceremony" :reveal="reveal" />
  <main v-else class="adventure" :class="{ 'video-scene': activeScene.type === 'video', 'is-transitioning': transitioning }" :aria-busy="transitioning">
    <MonasteryBackdrop />
    <img v-if="artworkAvailable" :key="artworkUrl" class="key-art" :src="artworkUrl" alt="" @error="artworkAvailable = false" />
    <div class="energy-halo halo-fire" aria-hidden="true"></div>
    <div class="energy-halo halo-ice" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true"><i v-for="n in 18" :key="n" :style="{ '--i': n }"></i></div>
    <header class="scene-header">
      <span class="chapter"><span class="public-profile">PERFIL · {{ profileLabels[profile!.id] }}</span><span class="chapter-mark" aria-hidden="true">◆</span> {{ activeScene.type === 'opening' ? 'LA AVENTURA OS ESPERA' : 'MISIÓN 01 · EL MENSAJE' }}</span>
    </header>
    <section :key="`${profile!.id}:${scene}`" class="scene-content" :class="{ encounter: activeScene.type === 'video' }" aria-labelledby="scene-title">
      <p class="eyebrow">{{ activeScene.type === 'opening' ? 'LOS ELEMENTOS OS HAN ELEGIDO' : 'MONASTERIO DEL SPINJITZU' }}</p>
      <div class="ornament" aria-hidden="true"><span></span>◆<span></span></div>
      <template v-if="activeScene.type === 'opening'">
        <h1 id="scene-title" ref="heading" tabindex="-1"><span>EL SECRETO DEL</span>MAESTRO <strong>WU</strong></h1>
        <p class="subtitle">Una antigua misión. Dos equipos de ninjas.<br class="desktop-break" /> Un secreto que solo podrán descubrir juntos.</p>
        <button class="start-button" :disabled="transitioning || busy" @click="goTo('ceremony')">
          <svg class="mission-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="m27 3-4 15 17-3-12 12 3 17-12-12-15 4 9-14-6-13 15 4Z" fill="currentColor" /><path d="m28 13-12 13h9l-4 10 14-16h-10Z" fill="#fff3b0" /></svg>
          <span>START GAME</span><span class="mission-arrow" aria-hidden="true">&#10140;</span>
        </button>
        <p class="invitation">REÚNE A TU EQUIPO. DESPIERTA TU PODER.</p>
        <p v-if="warning" class="public-warning" role="status">El organizador debe revisar la preparación de los equipos antes de continuar.</p>
      </template>
      <template v-else>
        <h1 id="scene-title" ref="heading" tabindex="-1" class="second-title"><span>VUESTRA MISIÓN COMIENZA AQUÍ</span>ESCUCHAD AL MAESTRO WU</h1>
        <WuMessage :key="`${profile!.id}:${profile!.media.video}`" :src="videoUrl" />
        <button class="back-button" :disabled="transitioning" @click="goTo('intro')">← VOLVER AL INICIO</button>
      </template>
    </section>
    <img class="lets-go-seal" :src="letsGoSeal" alt="Let's Go" />
    <footer class="scene-footer"><div class="elements"><span class="fire">FUEGO</span><span class="ice">HIELO</span><span class="energy">ENERGÍA</span><span class="lightning">RAYO</span></div><p>DOS EQUIPOS. UN SECRETO. JUNTOS, INVENCIBLES.</p></footer>
  </main>
</template>

<style scoped>
.public-profile { display: block; color: #ffe18a; margin-bottom: .5rem; font-size: .65rem; letter-spacing: .08em; }
.public-warning { max-width: 36rem; padding: .75rem 1rem; color: #fff3cf; background: #102a36ed; border: 1px solid #e3c787; font-size: 1rem; line-height: 1.5; }
</style>
