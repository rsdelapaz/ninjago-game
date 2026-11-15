<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { newChallenge, duplicateChallenge, moveChallenge, MAX_CHALLENGES } from './challenges'
import type { ChallengeResults } from './challengeResults'
import { confirmAction } from './confirmation'
import ChallengeStage from './ChallengeStage.vue'
const props = defineProps<{ config: ProfileConfig; results: ChallengeResults; dirty: boolean }>()
const emit = defineEmits<{ present: [id: string] }>()
const selectedId = ref(''), editing = ref(false), titleInput = ref<HTMLInputElement | null>(null)
const selected = computed(() => props.config.challenges.find(c => c.id === selectedId.value))
const visibleNumber = computed(() => Math.max(1, props.config.challenges.filter(c => c.visible).findIndex(c => c.id === selectedId.value) + 1))
watch(() => props.config.challenges, list => { if (!list.some(c => c.id === selectedId.value)) selectedId.value = list[0]?.id || '' }, { immediate: true, deep: true })
async function choose(id: string) { selectedId.value = id; editing.value = true; await nextTick(); titleInput.value?.focus() }
function add() { if (props.config.challenges.length >= MAX_CHALLENGES) return; const c = newChallenge(); props.config.challenges.push(c); choose(c.id) }
function duplicate() { if (selected.value) choose(duplicateChallenge(props.config.challenges, selected.value.id).id) }
async function remove() {
  const c = selected.value, reviewed = props.config
  if (!c || !await confirmAction(`Se eliminará «${c.title}» al guardar. También se retirará su resultado guardado, si lo tiene. Si está en pantalla, el público volverá a la portada. Puedes descartar el borrador antes de guardar.`, 'Eliminar esta prueba', true)) return
  const index = props.config.challenges.findIndex(item => item.id === c.id)
  if (props.config === reviewed && index >= 0) props.config.challenges.splice(index, 1)
}
async function visibility() {
  const c = selected.value
  if (!c) return
  if (c.visible && !await confirmAction('La prueba saldrá del recorrido al guardar. Sus datos y resultado se conservan. Si está en pantalla, el público volverá a la portada.', 'Ocultar esta prueba')) return
  c.visible = !c.visible
}
const resultLabel = computed(() => props.config.teams.find(t => t.id === props.results[selectedId.value])?.name || (props.results[selectedId.value] ? `Equipo ${props.config.teams.findIndex(t => t.id === props.results[selectedId.value]) + 1}` : 'Pendiente'))
const imageError = computed(() => {
  const name = selected.value?.imageFilename
  return name && (!/^[\w-][\w. -]*\.(png|jpe?g|webp)$/i.test(name) || name.includes('..')) ? 'Usa solo el nombre de un archivo PNG, JPG o WebP, sin carpetas ni direcciones de internet.' : ''
})
</script>
<template>
  <section class="challenges-module" :class="{ editing }"><div class="command-row"><button class="primary" :disabled="config.challenges.length >= MAX_CHALLENGES" @click="add">Nueva prueba</button><span class="hint">{{ dirty ? 'Cambios sin guardar: usa Guardar cambios antes de presentar.' : 'Configuración guardada' }} · Editar pruebas conserva la ceremonia.</span></div>
    <p v-if="!config.challenges.length" class="panel empty-inline">Todavía no has creado pruebas. Pulsa Nueva prueba para empezar.</p>
    <div v-else class="challenge-editor-layout"><section class="panel challenge-index" aria-label="Pruebas en orden"><h2>El recorrido</h2><ol><li v-for="(c,i) in config.challenges" :key="c.id"><button :aria-current="selectedId === c.id ? 'true' : undefined" @click="choose(c.id)"><strong>{{ i + 1 }} · {{ c.title }}</strong><small>{{ c.visible ? 'Visible' : 'Oculta' }}</small></button><div class="order-controls"><button :disabled="i === 0" :aria-label="`Subir ${c.title}`" @click="moveChallenge(config.challenges,c.id,-1)">↑</button><button :disabled="i === config.challenges.length - 1" :aria-label="`Bajar ${c.title}`" @click="moveChallenge(config.challenges,c.id,1)">↓</button></div></li></ol></section>
      <section v-if="selected" class="panel challenge-edit" aria-label="Editar prueba"><button class="mobile-list" @click="editing = false">← Volver a la lista</button><h2>Editar prueba</h2><p class="hint">Aquí preparas el contenido. Mostrarlo y anunciar un ganador son acciones separadas en Presentación.</p><label>Título<input ref="titleInput" v-model="selected.title" maxlength="160" required /></label><p v-if="!selected.title.trim()" class="field-error" role="alert">Escribe un título para poder guardar.</p><label>Descripción<textarea v-model="selected.description" maxlength="4000" rows="4"></textarea></label><label>Nombre del archivo de imagen local<input v-model="selected.imageFilename" maxlength="120" placeholder="reto-del-dragon.png" /></label><p v-if="imageError" class="field-error" role="alert">{{ imageError }}</p><p class="hint">Guarda la imagen en public/private-media/{{ config.id }}/. No se sube ni se incluye en el JSON. PNG, JPG o WebP; solo nombre, sin rutas.</p><div class="command-row"><button @click="visibility">{{ selected.visible ? 'Ocultar prueba…' : 'Volver a mostrar' }}</button><button :disabled="config.challenges.length >= MAX_CHALLENGES" @click="duplicate">Duplicar</button><button @click="remove">Eliminar…</button></div><p>Resultado guardado: <strong>{{ resultLabel }}</strong></p><button :disabled="dirty || !selected.visible" @click="emit('present', selected.id)">Ir al control de esta prueba →</button><details open><summary>Vista previa {{ selected.visible ? '' : '(fuera del recorrido)' }}</summary><ChallengeStage :challenge="selected" :config="config" :number="visibleNumber" preview /></details></section>
    </div>
  </section>
</template>
<style scoped>
.challenge-editor-layout { display: grid; grid-template-columns: minmax(14rem, .7fr) minmax(0,2fr); gap: 1rem; margin-top: 1rem; }.challenge-editor-layout > * { min-width: 0; }.challenge-index ol { padding: 0; list-style: none; max-height: 65svh; overflow: auto; }.challenge-index li { display: grid; grid-template-columns: 1fr auto; gap: .5rem; border-bottom: 1px solid #dfc98a33; padding: .5rem 0; }.challenge-index li > button { text-align: left; min-width: 0; overflow-wrap: anywhere; }.challenge-index small { display: block; color: #d3c59e; margin-top: .3rem; }.challenge-index button[aria-current=true] { border-color: #f1d08b; background: #315064; }.order-controls { display: flex; gap: .25rem; align-self: center; }.order-controls button { min-width: 2.5rem; padding: .5rem; }.challenge-edit label { display: grid; gap: .5rem; margin: 1rem 0 .5rem; }.challenge-edit textarea { width: 100%; resize: vertical; }.challenge-edit details { margin-top: 1rem; }.mobile-list { display: none; }.field-error { color: #ffb6aa; }
@media(max-width:767px) { .challenge-editor-layout { grid-template-columns: minmax(0,1fr); }.editing .challenge-index { display: none; }.challenges-module:not(.editing) .challenge-edit { display: none; }.mobile-list { display: inline-block; }.challenge-index ol { max-height: none; } }
</style>
