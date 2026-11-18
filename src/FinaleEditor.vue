<script setup lang="ts">
import { ref } from 'vue'
import type { ProfileConfig } from './profile'
import { finalePreparationProblems } from './finale'
defineProps<{ config: ProfileConfig }>()
const showAnswer = ref(false)
</script>
<template>
  <section class="panel finale-editor" aria-labelledby="finale-editor-title">
    <p class="kicker">EL ÚLTIMO SECRETO DEL MAESTRO WU</p><h2 id="finale-editor-title">Desenlace final</h2>
    <p class="hint">Configuración privada de este perfil. Guardar no muestra la escena ni valida una respuesta. Cambiar el desenlace y guardar reinicia su resultado; conserva ceremonia, pruebas y el otro perfil.</p>
    <div class="field-grid">
      <label>Frase secreta correcta <span aria-hidden="true">*</span><input v-model="config.finale.answer" :type="showAnswer ? 'text' : 'password'" maxlength="1024" autocomplete="off" spellcheck="false" aria-describedby="finale-answer-help" /></label>
      <button type="button" :aria-pressed="showAnswer" @click="showAnswer = !showAnswer">{{ showAnswer ? 'Ocultar frase' : 'Ver frase configurada' }}</button>
    </div>
    <p id="finale-answer-help" class="hint">Hasta 256 caracteres significativos. Se ignoran caso, puntuación y tildes vocálicas; Ñ y N son distintas. No se incluye una respuesta por defecto.</p>
    <label>Texto del secreto a revelar <span aria-hidden="true">*</span><textarea v-model="config.finale.secret" rows="5" maxlength="3000" aria-describedby="finale-secret-help"></textarea></label>
    <p id="finale-secret-help" class="hint">Hasta 3000 caracteres, sin recortes. Solo aparece en público después de acertar; los textos extensos pueden requerir desplazamiento.</p>
    <div class="field-grid"><label>Vídeo final local (opcional)<input v-model="config.finale.videoFilename" maxlength="120" placeholder="desenlace.mp4" /></label><label>Narración o música local (opcional)<input v-model="config.finale.audioFilename" maxlength="120" placeholder="desenlace.mp3" /></label></div>
    <p class="hint">Solo nombres de archivos dentro de la carpeta privada del perfil. Vídeo: MP4/WebM. Audio: MP3/WAV/OGG/M4A. Sin URL. La revelación funciona sin estos medios; el sonido requiere permiso en la pantalla pública.</p>
    <label>Mensaje adicional tras el giro de Wu (opcional)<textarea v-model="config.finale.failureMessage" rows="2" maxlength="280" placeholder="Se muestra después del segundo fallo, nunca durante los turnos individuales."></textarea></label>
    <p v-if="finalePreparationProblems(config).length" class="notice">Desenlace sin preparar: {{ finalePreparationProblems(config).join(' ') }} Puedes guardar el borrador incompleto, pero no mostrarlo.</p>
  </section>
</template>
<style scoped>
.finale-editor label { display: grid; gap: .5rem; margin: 1rem 0; }.finale-editor textarea { width: 100%; font: inherit; padding: .75rem; color: #ecf1e5; background: #081c29; border: 1px solid #526d70; border-radius: .4rem; }.field-grid { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }.field-grid label { flex: 1 1 16rem; min-width: 0; }.finale-editor input { width: 100%; }
</style>
