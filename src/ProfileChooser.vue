<script setup lang="ts">
import { profileIds, profileLabels, type ProfileId } from './profile'
defineProps<{ warning: string }>()
defineEmits<{ choose: [id: ProfileId] }>()
</script>
<template>
  <main class="profile-chooser">
    <span class="chooser-symbol" aria-hidden="true">✦</span>
    <p class="eyebrow">CENTRO DE MANDO NINJA</p>
    <h1>Elige tu perfil</h1>
    <p>Cada aventura tiene sus ninjas, sus equipos y sus recursos.<br />Recordaremos tu elección en este navegador.</p>
    <div class="profile-options"><button v-for="(id, index) in profileIds" :key="id" @click="$emit('choose', id)"><small>PERFIL 0{{ index + 1 }}</small><strong>{{ profileLabels[id] }}</strong><span>Usar este perfil →</span></button></div>
    <p v-if="warning" role="alert">{{ warning }}</p>
  </main>
</template>
<style scoped>
.profile-chooser { min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: 2rem; max-width: 65rem; margin: auto; text-align: center; }
.chooser-symbol { color: #ffe18a; font-size: 3.5rem; }.profile-chooser h1 { font: 900 clamp(2rem,5vw,3.5rem)/1.1 'Trebuchet MS',sans-serif; transform: none; -webkit-text-stroke: 0; text-shadow: none; }
.profile-chooser p { color: #c6dce1; line-height: 1.7; }.profile-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
button { min-height: 12rem; padding: 2rem; border: 1px solid #b49756; border-radius: .7rem; background: #143441; color: #fff3cf; cursor: pointer; text-align: left; }button:hover { background: #204956; }small,strong,button span { display: block; }small { color: #e5bd65; letter-spacing: .15em; }strong { font-size: 1.75rem; margin: .75rem 0; }button span { color: #c6dce1; font-size: .85rem; }
@media(max-width:600px) { .profile-options { grid-template-columns: 1fr; }button { min-height: 9rem; padding: 1.5rem; } }
</style>
