<script setup lang="ts">
import { ref, watch } from 'vue'
import { mediaUrl, type ProfileConfig } from './profile'
const props = defineProps<{ config: ProfileConfig }>()
const imageStatus = ref('Comprobando archivo…'), videoStatus = ref('Comprobando archivo…')
watch(() => props.config.media.artwork, () => { imageStatus.value = 'Comprobando archivo…' })
watch(() => props.config.media.video, () => { videoStatus.value = 'Comprobando archivo…' })
</script>
<template>
  <div><div class="notice">Los archivos pertenecen solo a este perfil. Colócalos en <code>public/private-media/{{ config.id }}/</code>. Aquí se guardan sus nombres, no se suben archivos a ningún servidor.</div>
    <div class="team-grid resources-grid">
      <section class="panel"><p class="kicker">ILUSTRACIÓN DE PORTADA</p><h3>El escenario de la aventura</h3><label>Nombre del archivo<input v-model="config.media.artwork" maxlength="120" spellcheck="false" /></label>
        <div class="resource-frame"><img :key="config.media.artwork" :src="mediaUrl(config, 'artwork', './')" alt="Ilustración privada del perfil" @load="imageStatus = 'Ilustración disponible'" @error="imageStatus = 'No disponible: la pantalla pública usará el monasterio vectorial.'" /></div><p role="status" class="hint">{{ imageStatus }}</p></section>
      <section class="panel"><p class="kicker">MENSAJE DEL MAESTRO</p><h3>Vídeo local</h3><label>Nombre del archivo<input v-model="config.media.video" maxlength="120" spellcheck="false" /></label>
        <div class="resource-frame"><video :key="config.media.video" :src="mediaUrl(config, 'video', './')" controls playsinline preload="metadata" aria-label="Vista previa del vídeo del perfil" @loadedmetadata="videoStatus = 'Vídeo disponible'" @error="videoStatus = 'No disponible o no compatible: la pantalla pública mostrará el aviso.'" /></div><p role="status" class="hint">{{ videoStatus }}</p></section>
    </div><p class="hint">MP4/WebM para vídeo; PNG/JPG/WebP para imagen. Guarda los cambios para aplicarlos a la pantalla pública. Los recursos privados no viajan en el JSON.</p>
  </div>
</template>
