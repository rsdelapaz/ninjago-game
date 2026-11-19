<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import OrganizerPanel from './OrganizerPanel.vue'
import { usePresentation } from './usePresentation'
import { useIntroMusic } from './useIntroMusic'
import ProfileChooser from './ProfileChooser.vue'
import { ceremonyProblems, mediaUrl, profileLabels } from './profile'
import MonasteryBackdrop from './MonasteryBackdrop.vue'
import WuMessage from './WuMessage.vue'
import TrialsOpeningStage from './TrialsOpeningStage.vue'
import letsGoSeal from './assets/lets-go.svg'
import CeremonyStage from './CeremonyStage.vue'
import { browserScreenTransport, createPublicScreen, openPublicView, reserveAdminWindow } from './publicScreen'
import type { CeremonyAction } from './ceremony'
import type { RevealAction } from './reveal'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ChallengeStage from './ChallengeStage.vue'
import FinaleStage from './FinaleStage.vue'
import type { FinaleAction } from './finale'

// Explicit reactive state: https://vuejs.org/api/sfc-script-setup.html#reactivity
const isAdmin = new URLSearchParams(location.search).get('screen') === 'admin'
if (isAdmin) reserveAdminWindow(window)
const { state, profile, ceremony, reveal, busy, activeScene, select, advanceTrials, selectProfile, actCeremony, actReveal, results, resultsVersion, recordResult, announceResult, imageExpanded, setImageExpanded, finale, actFinale, finishFinale, resetProfile, refreshProfile, warning, initialized } = usePresentation()
const publicUrl = new URL(import.meta.env.BASE_URL, location.origin).href
const screenTransport = browserScreenTransport()
function openPublicWindow() {
  return openPublicView(window, publicUrl)
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
  const configuration = JSON.stringify(profile.value)
  requestWarning.value = ''
  // ensure opens synchronously in this click stack, then waits for a live public application's reply.
  const ready = publicScreen.ensure()
  return ready.then(confirmed => {
    if (!confirmed || !mounted) return
    if (state.value.revision !== revision || state.value.profileId !== id || JSON.stringify(profile.value) !== configuration) { requestWarning.value = 'La presentación o su configuración cambió durante la apertura. Revisa el perfil y repite la acción.'; return }
    return action()
  })
}
const showScene = (id: string) => withPublicScreen(() => select(id))
const commandCeremony = (action: CeremonyAction) => withPublicScreen(() => actCeremony(action))
const commandReveal = (action: RevealAction) => withPublicScreen(() => actReveal(action))
const commandAnnouncement = (id: string, winner: string) => withPublicScreen(() => announceResult(id, winner))
const commandImageView = (id: string, expanded: boolean) => withPublicScreen(() => setImageExpanded(id, expanded))
const commandFinale = (action: FinaleAction) => withPublicScreen(() => actFinale(action))
const publicFinale = (action: FinaleAction) => !isAdmin && publicMounted ? actFinale(action) : Promise.resolve(false)
const scene = computed(() => state.value.sceneId)
watch([scene, () => state.value.profileId], async () => { await nextTick(); if (!isAdmin) heading.value?.focus() })
const heading = ref<HTMLHeadingElement | null>(null)
const startWarning = ref('')
const startAlert = ref<HTMLParagraphElement | null>(null)
watch([scene, () => state.value.profileId], () => { startWarning.value = '' })
async function showStartWarning(message: string) {
  startWarning.value = message
  await nextTick()
  startAlert.value?.focus()
}
async function startGame() {
  if (!profile.value || scene.value !== 'intro' || transitioning.value || busy.value) return
  if (ceremonyProblems(profile.value).length) {
    await showStartWarning('La aventura aún no está preparada. Consulta con el organizador para que configure el juego antes de comenzar.')
    return
  }
  const id = profile.value.id
  startWarning.value = ''
  if (!await goTo('ceremony') && mounted && scene.value === 'intro' && profile.value?.id === id) {
    await showStartWarning('No se ha podido comenzar la aventura. Pide al organizador que revise la preparación e inténtalo de nuevo.')
  }
}
const artworkAvailable = ref(true)
const artworkUrl = computed(() => profile.value ? mediaUrl(profile.value, 'artwork', import.meta.env.BASE_URL) : '')
const videoUrl = computed(() => profile.value ? mediaUrl(profile.value, 'video', import.meta.env.BASE_URL) : '')
watch(artworkUrl, () => { artworkAvailable.value = true })
const transitioning = ref(false)
function videoEnded() {
  if (!transitioning.value) void advanceTrials('wu')
}
const publicIntro = computed(() => !isAdmin && !!profile.value && state.value.profileId === profile.value.id && scene.value === 'intro')
const { musicStatus, toggleMusic } = useIntroMusic(
  () => publicIntro.value && !transitioning.value,
  `${import.meta.env.BASE_URL}private-media/intro-theme.mp3`,
)
async function goTo(target: string) {
  if (transitioning.value || scene.value === target) return
  const revision = state.value.revision
  transitioning.value = true
  // Match the CSS exit duration; reduced motion also skips this delay.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await new Promise(resolve => window.setTimeout(resolve, 360))
  }
  // select rechecks the persisted configuration under the shared write lock.
  const selected = mounted && state.value.revision === revision && await select(target)
  transitioning.value = false
  await nextTick()
  if (selected) heading.value?.focus()
  return selected
}
</script>

<template>
  <ConfirmationDialog v-if="isAdmin || activeScene.type === 'finale'" :class="{ 'sanctuary-confirmation': !isAdmin }" />
  <ProfileChooser v-if="!profile" :warning="warning" @choose="selectProfile" />
  <OrganizerPanel :control-revision="state.revision" :finale-progress="finale || undefined" @finale="commandFinale" v-else-if="isAdmin" :profile="profile" :scene="activeScene" :ceremony="ceremony!" :reveal="reveal" :busy="operatorBusy" :reset-profile="resetProfile" :results="results" :results-version="resultsVersion" :record-result="recordResult" :image-expanded="imageExpanded" :showing-winner="!!state.announcement" :announced-winner="state.announcement?.winner" @image-view="commandImageView" @announce="commandAnnouncement" :public-ready="publicReady" :public-waiting="publicWaiting" :public-message="publicMessage" :public-url="publicUrl" :warning="requestWarning || warning" @select="showScene" @activate="selectProfile" @ceremony="commandCeremony" @reveal="commandReveal" @open-public="publicScreen.ensure()" @saved="refreshProfile" />
  <FinaleStage v-else-if="activeScene.type === 'finale' && finale" :key="profile.id + ':finale'" :config="profile" :progress="finale"  :send-action="publicFinale" @home="goTo('intro')" @finish="finishFinale" />
  <ChallengeStage v-else-if="activeScene.type === 'challenge' && profile.challenges.find(c => c.id === activeScene.challengeId)" :key="`${profile.id}:${activeScene.id}`" :challenge="profile.challenges.find(c => c.id === activeScene.challengeId)!" :config="profile" :number="activeScene.challengeNumber!" :expanded="imageExpanded" :winner="state.announcement?.challengeId === activeScene.challengeId ? state.announcement?.winner : undefined" />
  <CeremonyStage v-else-if="activeScene.type === 'ceremony' && ceremony" :config="profile" :progress="ceremony" :reveal="reveal" />
  <TrialsOpeningStage v-else-if="activeScene.type === 'threshold'" :key="state.token" :advance="() => advanceTrials('trials-opening')" :busy="busy" />
  <main v-else class="adventure" :class="{ 'video-scene': activeScene.type === 'video', 'is-transitioning': transitioning }" :aria-busy="transitioning">
    <MonasteryBackdrop />
    <img v-if="artworkAvailable" :key="artworkUrl" class="key-art" :src="artworkUrl" alt="" @error="artworkAvailable = false" />
    <div class="energy-halo halo-fire" aria-hidden="true"></div>
    <div class="energy-halo halo-ice" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true"><i v-for="n in 18" :key="n" :style="{ '--i': n }"></i></div>
    <header class="scene-header">
      <div v-if="publicIntro" class="intro-music">
        <span v-if="musicStatus === 'unavailable'" role="status">Música no disponible</span>
        <button v-else type="button" :disabled="transitioning" @click="toggleMusic">
          {{ musicStatus === 'playing' || musicStatus === 'starting' ? 'Silenciar música' : 'Activar música' }}
        </button>
      </div>
      <span class="chapter"><span class="public-profile">PERFIL · {{ profileLabels[profile!.id] }}</span><span class="chapter-mark" aria-hidden="true">◆</span> {{ activeScene.type === 'opening' ? 'LA AVENTURA OS ESPERA' : 'MISIÓN 01 · EL MENSAJE' }}</span>
    </header>
    <section :key="`${profile!.id}:${scene}`" class="scene-content" :class="{ encounter: activeScene.type === 'video' }" aria-labelledby="scene-title">
      <p class="eyebrow">{{ activeScene.type === 'opening' ? 'LOS ELEMENTOS OS HAN ELEGIDO' : 'MONASTERIO DEL SPINJITZU' }}</p>
      <div class="ornament" aria-hidden="true"><span></span>◆<span></span></div>
      <template v-if="activeScene.type === 'opening'">
        <h1 id="scene-title" ref="heading" tabindex="-1"><span>EL SECRETO DEL</span>MAESTRO <strong>WU</strong></h1>
        <p class="subtitle">Una antigua misión. Dos equipos de ninjas.<br class="desktop-break" /> Un secreto que solo podrán descubrir juntos.</p>
        <button class="start-button" :disabled="transitioning || busy" @click="startGame">
          <svg class="mission-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="m27 3-4 15 17-3-12 12 3 17-12-12-15 4 9-14-6-13 15 4Z" fill="currentColor" /><path d="m28 13-12 13h9l-4 10 14-16h-10Z" fill="#fff3b0" /></svg>
          <span>START GAME</span><span class="mission-arrow" aria-hidden="true">&#10140;</span>
        </button>
        <p class="invitation">REÚNE A TU EQUIPO. DESPIERTA TU PODER.</p>
        <p v-if="startWarning" ref="startAlert" class="public-warning" role="alert" tabindex="-1">{{ startWarning }}</p>
        <p v-else-if="warning" class="public-warning" role="status">El organizador debe revisar la preparación de los equipos antes de continuar.</p>
      </template>
      <template v-else>
        <h1 id="scene-title" ref="heading" tabindex="-1" class="second-title"><span>VUESTRA MISIÓN COMIENZA AQUÍ</span>ESCUCHAD AL MAESTRO WU</h1>
        <WuMessage :key="`${profile!.id}:${profile!.media.video}`" :src="videoUrl" @ended="videoEnded" />
        <button class="back-button" :disabled="transitioning" @click="goTo('intro')">← VOLVER AL INICIO</button>
      </template>
    </section>
    <img class="lets-go-seal" :src="letsGoSeal" alt="Let's Go" />
    <footer class="scene-footer"><div class="elements"><span class="fire">FUEGO</span><span class="ice">HIELO</span><span class="energy">ENERGÍA</span><span class="lightning">RAYO</span></div><p>DOS EQUIPOS. UN SECRETO. JUNTOS, INVENCIBLES.</p></footer>
  </main>
</template>

<style scoped>
.public-profile { display: block; color: #ffe18a; margin-bottom: .5rem; font-size: .65rem; letter-spacing: .08em; }
.public-warning { max-width: 36rem; margin: 1rem 0 0; padding: .75rem 1rem; color: #fff3cf; background: #102a36ed; border: 1px solid #e3c787; font-size: clamp(1rem, 1.4vw, 1.3rem); line-height: 1.5; }
.public-warning:focus { outline: 2px solid #fff3cf; outline-offset: 3px; }
.intro-music { margin-inline-end: auto; color: #fff3cf; font-size: .875rem; }
.intro-music > * { display: inline-flex; align-items: center; min-height: 44px; padding: .35rem .7rem; border: 1px solid #e3c7879c; border-radius: .35rem; background: #102a36ed; }
.intro-music button { color: inherit; cursor: pointer; }
.intro-music button:hover { background: #245165; }
</style>
