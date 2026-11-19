<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { finaleWords, type WordBoard } from './finaleWords'

const props = defineProps<{ answer: string; board: WordBoard; disabled: boolean; operator?: boolean }>()
const emit = defineEmits<{ move: [from: number, to: number] }>()
const root = ref<HTMLElement | null>(null)
const selected = ref<number | null>(null)
const dragging = ref<number | null>(null)
const target = ref<number | null>(null)
const restoreFocus = ref(false)
const words = computed(() => finaleWords(props.answer))
const selection = computed(() => selected.value === null ? -1 : props.board.order.indexOf(selected.value))
const imperfect = computed(() => props.board.initial.some((id, index) => words.value[id] === words.value[index]))
const orderKey = computed(() => props.board.order.join(','))

function move(from: number, to: number, focus = false) {
  if (props.disabled || from < 0 || to < 0 || to >= props.board.order.length || from === to) return
  selected.value = props.board.order[from]
  restoreFocus.value = focus
  emit('move', from, to)
}
function clearDrag() {
  dragging.value = null
  target.value = null
}
function drag(event: DragEvent, index: number) {
  if (props.disabled || !event.dataTransfer) { event.preventDefault(); return }
  dragging.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', 'Ficha del santuario')
}
function over(event: DragEvent, index: number) {
  if (props.disabled || dragging.value === null) return
  if (dragging.value === index) { target.value = null; return }
  event.preventDefault()
  target.value = index
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}
function drop(event: DragEvent, index: number) {
  if (dragging.value === null) return
  event.preventDefault()
  move(dragging.value, index)
  clearDrag()
}
function leave(event: DragEvent, index: number) {
  if (target.value === index && event.currentTarget instanceof Node &&
      !(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) target.value = null
}
watch(orderKey, clearDrag)
watch([orderKey, () => props.disabled], async () => {
  if (!restoreFocus.value || props.disabled) return
  restoreFocus.value = false
  await nextTick()
  root.value?.querySelector<HTMLButtonElement>('.word-tile[aria-pressed="true"]')?.focus({ preventScroll: true })
})
</script>

<template>
  <div ref="root" class="word-board">
    <p v-if="operator && imperfect" class="word-board-note">Con esta frase es imposible que todas las fichas empiecen en posiciones distintas.</p>
    <TransitionGroup tag="ol" name="word-board" class="word-fragments" aria-label="Palabras del destino">
      <li v-for="(id, index) in board.order" :key="id" class="word-fragment"
        :class="{ 'word-dragging': dragging === index, 'word-before': target === index && dragging !== null && dragging > index, 'word-after': target === index && dragging !== null && dragging < index }"
        @dragover="over($event, index)" @dragleave="leave($event, index)"
        @drop="drop($event, index)">
        <button type="button" class="word-tile" :draggable="!disabled" :aria-disabled="disabled" :aria-pressed="selected === id"
          @click="!disabled && (selected = selected === id ? null : id)"
          @keydown.left.prevent="move(index, index - 1, true)" @keydown.right.prevent="move(index, index + 1, true)"
          @dragstart="drag($event, index)" @dragend="clearDrag">{{ words[id] }}</button>
      </li>
    </TransitionGroup>
    <p class="word-board-help">Arrastrad una ficha o seleccionadla y usad las flechas.</p>
    <div class="word-board-controls" role="group" aria-label="Mover la ficha seleccionada">
      <button type="button" :disabled="disabled || selection <= 0" @click="move(selection, selection - 1, true)">← Antes</button>
      <button type="button" :disabled="disabled || selection < 0 || selection === board.order.length - 1" @click="move(selection, selection + 1, true)">Después →</button>
    </div>
    <span class="word-board-live" role="status">{{ selection >= 0 ? `${words[board.order[selection]]}, posición ${selection + 1} de ${board.order.length}` : '' }}</span>
  </div>
</template>

<style scoped>
.word-board { min-width: 0; text-align: center; }
.word-fragments { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: clamp(.65rem, 1.35vw, 1.35rem); margin: 0; padding: 0; list-style: none; }
.word-fragment { position: relative; max-width: 100%; }
.word-tile { display: block; max-width: 100%; min-height: 48px; padding: .58em .85em; border: 2px solid #c49a55; border-radius: .35rem; background: radial-gradient(ellipse at 50% 0%, #ffe8a02b, transparent 65%), linear-gradient(165deg, #554434, #2a2924 54%, #1e2524); box-shadow: inset 0 0 0 3px #1a2322, inset 0 0 0 4px #ceaa666b, 0 6px 0 #141d1d, 0 14px 20px #050d0caa, 0 -2px 18px #ffe8a031; color: #fff3d2; text-shadow: 0 2px 0 #1c1710; font: 900 clamp(1.15rem, 2.6vw, 3.1rem)/1.18 Georgia, serif; letter-spacing: .06em; overflow-wrap: anywhere; cursor: grab; transition: transform .16s, box-shadow .16s; animation: word-suspend 5s ease-in-out infinite alternate; }
.word-fragment:nth-child(even) .word-tile { animation-delay: -2.2s; }
.word-tile[aria-pressed="true"], .word-tile:hover, .word-dragging .word-tile { animation: none; transform: translateY(-4px); border-color: #ffdf94; box-shadow: inset 0 0 0 3px #273131, 0 10px 18px #050d0cbf, 0 0 20px #f5c76869; }
.word-dragging .word-tile { opacity: .65; cursor: grabbing; }
.word-before::before, .word-after::after { position: absolute; z-index: 1; top: 10%; bottom: 10%; width: 4px; border-radius: 4px; background: #fff0ad; box-shadow: 0 0 12px #f9ce75; content: ''; pointer-events: none; }
.word-before::before { left: -.45rem; }
.word-after::after { right: -.45rem; }
.word-board-move { transition: transform .22s ease; }
.word-board-help, .word-board-note { margin: 1rem 0 .4rem; color: #fff0c7; font-size: .9rem; }
.word-board-controls { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }
.word-board-controls button { min-height: 44px; padding: .35rem .7rem; background: #14292a; color: #fff0c7; border: 1px solid #bb9b62; border-radius: .3rem; }
.word-board-controls button:disabled { opacity: .6; }
.word-tile:focus-visible, .word-board-controls button:focus-visible { outline: 3px solid #fff6c9; outline-offset: 4px; }
.word-board-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.finale-controls .word-tile { font-size: clamp(1.05rem, 1.5vw, 1.5rem); }
@keyframes word-suspend { from { translate: 0 -2px; } to { translate: 0 2px; } }
@media (max-height: 800px) {
  .word-tile { padding-block: .36em; }
  .word-fragments { row-gap: .85rem; }
}
@media (prefers-reduced-motion: reduce) {
  .word-tile, .word-board-move { animation: none; transition: none; }
}
</style>
