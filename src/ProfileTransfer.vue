<script setup lang="ts">
import { ref } from 'vue'
import { exportProfile, migrateLegacy, parseProfile, profileLabels, type ProfileConfig } from './profile'
import { legacyEntries } from './profileStorage'
const props = defineProps<{ config: ProfileConfig }>()
const emit = defineEmits<{ replace: [config: ProfileConfig] }>()
const preview = ref<ProfileConfig | null>(null), message = ref(''), loading = ref(false)
const legacy = ref<ReturnType<typeof legacyEntries>>([]), legacyKey = ref('')
try { legacy.value = legacyEntries(localStorage) } catch { message.value = 'No se pueden leer las configuraciones anteriores.' }
function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function download() {
  try { downloadText(exportProfile(props.config), `perfil-${props.config.id}.json`); message.value = 'Exportación de configuración preparada. No contiene progreso ni archivos multimedia.' }
  catch(e) { message.value = e instanceof Error ? e.message : 'No se puede exportar.' }
}
async function read(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]; preview.value = null
  if (!file) return
  loading.value = true
  try {
    if (file.size > 1024 * 1024) throw Error('El JSON supera 1 MB.')
    preview.value = parseProfile(JSON.parse(await file.text())); message.value = 'Archivo validado. Revisa el contenido antes de reemplazar el perfil activo.'
  } catch(e) { message.value = e instanceof Error ? e.message : 'JSON no válido.' }
  finally { loading.value = false; input.value = '' }
}
function migrate() {
  try { preview.value = migrateLegacy(JSON.parse(legacy.value.find(e => e.key === legacyKey.value)!.raw), props.config.id); message.value = 'Conversión preparada. La configuración anterior y su progreso permanecerán intactos.' }
  catch(e) { message.value = e instanceof Error ? e.message : 'No se puede convertir esta configuración.' }
}
function replace() { if (preview.value) { emit('replace', parseProfile({ ...preview.value, id: props.config.id })); preview.value = null } }
function downloadLegacy() { const entry = legacy.value.find(e => e.key === legacyKey.value); if (entry) downloadText(entry.raw, 'configuracion-anterior-privada.json') }
</script>
<template>
  <div class="transfer-module">
    <div class="team-grid"><section class="panel"><p class="kicker">CONFIGURACIÓN PORTÁTIL</p><h3>Exportar este perfil</h3><p>Participantes, dos equipos y nombres de archivo. El progreso y los archivos multimedia se quedan en este ordenador.</p><button class="primary" @click="download">Exportar perfil JSON</button></section>
      <section class="panel"><p class="kicker">JSON · ESQUEMA 2</p><h3>Importar configuración</h3><label>Archivo JSON local<input type="file" accept=".json,application/json" :disabled="loading" @change="read" /></label><p class="hint">Siempre requiere confirmar el reemplazo del perfil activo. El guardado anterior se conserva en el historial local.</p></section></div>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <section v-if="preview" class="panel import-preview"><h3>Revisar antes de reemplazar</h3><p>Origen: {{ profileLabels[preview.id] }} → Destino: <strong>{{ profileLabels[config.id] }}</strong></p><p>{{ preview.participants.length }} participantes · {{ preview.assignmentMode === 'manual' ? 'Reparto manual' : 'Reparto automático guardado' }}</p><ul><li v-for="(t, i) in preview.teams" :key="t.id">Equipo {{ i + 1 }}: {{ t.name || 'Sin nombre' }} · {{ t.memberIds.length }} integrantes</li></ul><details><summary>Ver todos los datos</summary><pre>{{ JSON.stringify(preview, null, 2) }}</pre></details><div class="command-row"><button class="primary" @click="replace">Reemplazar perfil activo…</button><button @click="preview = null">Cancelar</button></div></section>
    <section class="panel"><p class="kicker">RECUPERACIÓN DE DATOS ANTERIORES</p><h3>Conservar y trasladar tu configuración</h3><p v-if="!legacy.length" class="empty-inline">No se han encontrado configuraciones del formato anterior en este navegador.</p><template v-else><p>Hay {{ legacy.length }} configuraciones anteriores. Elige una y asígnala expresamente a este perfil. No se borran ni sus datos ni su progreso.</p><label>Configuración anterior<select v-model="legacyKey"><option value="">Selecciona una configuración</option><option v-for="entry in legacy" :key="entry.key" :value="entry.key">{{ entry.name }}</option></select></label><div class="command-row"><button :disabled="!legacyKey" @click="migrate">Previsualizar conversión</button><button :disabled="!legacyKey" @click="downloadLegacy">Descargar original privado</button></div></template></section>
  </div>
</template>
