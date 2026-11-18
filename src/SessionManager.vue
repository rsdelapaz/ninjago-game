<script setup lang="ts">
import { computed, ref } from 'vue'
import ParticipantEditor from './ParticipantEditor.vue'
import TeamEditor from './TeamEditor.vue'
import { copyConfig, createConfig, distribute, exportConfig, parseConfig, type LegacySessionConfig } from './session'
import { loadConfigs, saveConfig, storedConfig } from './sessionStorage'
import { sortParticipants, teamMembers } from './profile'
const props = defineProps<{ activeId: string | null }>()
const emit = defineEmits<{ activate: [id: string] }>()
const configs = ref<LegacySessionConfig[]>([])
const draft = ref(createConfig())
const baseline = ref<string | null>(null)
const message = ref('')
const preview = ref<LegacySessionConfig | null>(null)
const loading = ref(false)
const dirty = computed(() => exportSafe(draft.value) !== baseline.value)
function exportSafe(c: LegacySessionConfig) { try { return exportConfig(c) } catch { return '' } }
function report(error: unknown) { message.value = error instanceof Error ? error.message : 'No se ha podido completar la operación.' }
try {
  configs.value = loadConfigs(localStorage)
  const initial = configs.value.find(c => c.id === props.activeId) || configs.value[0]
  if (initial) edit(initial, false)
} catch (error) { report(error) }
function edit(config: LegacySessionConfig, check = true) {
  if (check && dirty.value && !confirm('Hay cambios sin guardar. ¿Descartar el borrador y cambiar de sesión?')) return
  try {
    const saved = storedConfig(localStorage, config.id)
    // Read the current saved value, rather than a stale in-memory session list.
    draft.value = parseConfig(JSON.parse(saved || exportConfig(config)))
    baseline.value = saved
  } catch (error) { report(error) }
}
function fresh() {
  if (dirty.value && !confirm('¿Descartar el borrador sin guardar y preparar otra sesión?')) return
  draft.value = createConfig(); baseline.value = null; message.value = 'Nueva sesión preparada. Guarda para conservarla.'
}
function persist(config = draft.value, ask = true): boolean {
  try {
    const candidate = parseConfig(JSON.parse(exportConfig(config)))
    if (baseline.value !== null && ask && !confirm('¿Guardar los cambios sobre la configuración de esta sesión? El progreso se conservará.')) return false
    const saved = saveConfig(localStorage, candidate, baseline.value)
    baseline.value = saved; draft.value = candidate
    configs.value = loadConfigs(localStorage)
    message.value = 'Configuración guardada. El progreso no se ha modificado.'
    return true
  } catch (error) { report(error); return false }
}
function shuffle() {
  if (!confirm('¿Realizar y guardar un nuevo reparto? Sustituirá las asignaciones actuales de esta sesión.')) return
  try { const c = parseConfig(JSON.parse(exportConfig(draft.value))); distribute(c); persist(c, false) } catch (error) { report(error) }
}
function duplicate() {
  try {
    const copy = copyConfig(draft.value); copy.name = `${copy.name.slice(0, 110)} (copia)`
    saveConfig(localStorage, copy)
    configs.value = loadConfigs(localStorage); edit(copy, false)
    message.value = 'Copia creada con identificadores nuevos y sin progreso.'
  } catch (error) { report(error) }
}
function download() {
  try {
    const blob = new Blob([exportConfig(draft.value)], { type: 'application/json' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = `sesion-${draft.value.id}.json`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    message.value = 'Configuración exportada, sin progreso.'
  } catch (error) { report(error) }
}
async function read(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  preview.value = null
  if (!file) return
  loading.value = true
  try {
    if (file.size > 1024 * 1024) throw new Error('El JSON supera el límite de 1 MB.')
    preview.value = parseConfig(JSON.parse(await file.text()))
    message.value = 'Archivo válido. Revisa la previsualización antes de crear la sesión.'
  } catch (error) { report(error) } finally { loading.value = false; input.value = '' }
}
function importNew() {
  if (!preview.value) return
  if (dirty.value && !confirm('¿Descartar el borrador sin guardar y abrir la nueva sesión importada?')) return
  try {
    const copy = copyConfig(preview.value)
    saveConfig(localStorage, copy); configs.value = loadConfigs(localStorage); edit(copy, false)
    preview.value = null; message.value = 'Importada como sesión nueva. Reparto conservado, progreso vacío.'
  } catch (error) { report(error) }
}
function activate() { if (dirty.value) { message.value = 'Guarda la configuración antes de activar esta sesión.'; return } emit('activate', draft.value.id) }
</script>
<template>
  <div class="session-command">
    <section class="command-section" aria-labelledby="session-title">
      <h2 id="session-title">Centro de mando ninja</h2>
      <p>Prepara cada misión por separado. Los cambios se aplican al guardar.</p>
      <label>Sesiones guardadas<select :value="baseline ? draft.id : ''" @change="edit(configs.find(c => c.id === ($event.target as HTMLSelectElement).value)!)"><option value="" disabled>Elige una sesión</option><option v-for="c in configs" :key="c.id" :value="c.id">{{ c.date }} · {{ c.name }}</option></select></label>
      <div class="command-row"><button @click="fresh">Nueva sesión</button><button @click="duplicate">Duplicar borrador sin progreso</button></div>
      <div class="command-row"><label>Nombre de sesión<input v-model="draft.name" maxlength="120" required /></label><label>Fecha<input v-model="draft.date" type="date" required /></label></div>
      <p class="session-id">ID: {{ draft.id }}</p>
      <div class="command-row"><button @click="persist()">Guardar configuración</button><button :disabled="dirty" @click="activate">Usar en la presentación</button></div>
      <p role="status">{{ dirty ? 'Borrador con cambios sin guardar' : 'Configuración guardada' }} · {{ activeId === draft.id ? 'Sesión activa' : 'No activa' }}</p>
    </section>
    <p v-if="message" class="command-message" role="status">{{ message }}</p>
    <ParticipantEditor :config="draft" />
    <TeamEditor :config="draft" @distribute="shuffle" />
    <section class="command-section" aria-labelledby="names-title"><h2 id="names-title">Nombres propuestos</h2>
      <label>Un nombre por línea<textarea :value="draft.proposedTeamNames.join('\n')" rows="5" @change="draft.proposedTeamNames = ($event.target as HTMLTextAreaElement).value.split('\n').filter(s => s.trim())" /></label>
      <datalist id="proposed-names"><option v-for="(name, index) in draft.proposedTeamNames" :key="index" :value="name" /></datalist>
    </section>
    <section class="command-section" aria-labelledby="transfer-title"><h2 id="transfer-title">Importar y exportar configuración</h2>
      <p>JSON de configuración versión 1. No incluye progreso. Importar crea siempre una sesión nueva.</p>
      <button @click="download">Exportar configuración JSON</button>
      <label>Seleccionar JSON local<input type="file" accept=".json,application/json" :disabled="loading" @change="read" /></label>
      <div v-if="preview" class="import-preview"><h3>Revisar antes de importar</h3><p>{{ preview.name }} · {{ preview.date }} · {{ preview.assignmentMode === 'manual' ? 'Manual' : 'Automático' }}</p>
        <p>{{ preview.participants.length }} participantes: {{ sortParticipants(preview.participants).map(p => p.name).join(', ') }}</p>
        <ul><li v-for="t in preview.teams" :key="t.id">{{ t.name }} · {{ t.color }} · {{ t.memberIds.length }} miembros: {{ teamMembers(preview, t).map(p => p.name).join(', ') }}</li></ul>
        <p>Nombres propuestos: {{ preview.proposedTeamNames.join(', ') || 'Ninguno' }}</p>
        <details><summary>Ver todos los datos de configuración</summary><pre>{{ JSON.stringify(preview, null, 2) }}</pre></details>
        <button @click="importNew">Confirmar: crear sesión nueva</button><button @click="preview = null">Cancelar importación</button>
      </div>
    </section>
  </div>
</template>
<style scoped>
.session-command { margin-top: 2rem; }
.command-section { padding: 1.5rem; margin: 1.5rem 0; background: #102c39; border: 1px solid #b99a5055; border-radius: .5rem; }
.command-section h2 { margin-top: 0; color: #ffe18a; font-size: 1.4rem; }
.session-command :deep(label) { display: flex; flex-direction: column; gap: .4rem; flex: 1; min-width: 0; }
.session-command :deep(input), .session-command :deep(select), textarea { width: 100%; min-height: 44px; padding: .6rem; background: #061925; color: #fff8e8; border: 1px solid #819da5; border-radius: .25rem; font: inherit; }
.session-command :deep(input:focus-visible), .session-command :deep(select:focus-visible), textarea:focus-visible { outline: 3px solid #ffe18a; outline-offset: 2px; }
.session-command :deep(input[type=color]) { padding: .2rem; }
.session-command :deep(.command-row), .session-command :deep(.participant-row) { display: flex; align-items: end; gap: .75rem; margin: 1rem 0; flex-wrap: wrap; }
.session-command :deep(.participant-row) { border-top: 1px solid #819da533; padding-top: 1rem; }
.session-command :deep(.team-grid) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.session-command :deep(fieldset) { min-width: 0; border: 1px solid #819da5; border-radius: .4rem; }.session-command :deep(fieldset label) { margin-bottom: 1rem; }
.session-command :deep(.assignment-row) { margin: .75rem 0; }.command-message { padding: 1rem; border-left: 3px solid #ffe18a; }
.session-id { font-size: .8rem; overflow-wrap: anywhere; color: #c6dce1; }.import-preview { margin-top: 1rem; border: 1px solid #ffe18a; padding: 1rem; overflow-wrap: anywhere; }
pre { white-space: pre-wrap; font-size: .8rem; }
button:disabled { opacity: .5; cursor: default; }.import-preview button { margin: .5rem; }
@media(max-width: 600px) { .command-section { padding: 1rem; }.session-command :deep(.team-grid) { grid-template-columns: 1fr; }.session-command :deep(.participant-row label) { flex-basis: 100%; } }
</style>
