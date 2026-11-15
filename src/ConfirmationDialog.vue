<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { confirmations } from './confirmation'
const { request, busy, error, accept, cancel } = confirmations
const dialog = ref<HTMLDialogElement | null>(null), cancelButton = ref<HTMLButtonElement | null>(null)
let origin: HTMLElement | null = null
watch(request, async value => {
  if (value) {
    origin = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick(); dialog.value?.showModal(); cancelButton.value?.focus()
  } else { dialog.value?.close(); origin?.focus(); origin = null }
})
onUnmounted(cancel)
</script>
<template>
  <dialog ref="dialog" class="confirmation-dialog" aria-labelledby="confirmation-title" aria-describedby="confirmation-copy" :aria-busy="busy" @cancel.prevent="cancel">
    <template v-if="request"><p class="kicker">CENTRO DE MANDO</p><h2 id="confirmation-title">{{ request.title }}</h2><p id="confirmation-copy">{{ request.explanation }}</p><p v-if="error" role="alert">{{ error }}</p><div class="command-row"><button ref="cancelButton" :disabled="busy" @click="cancel">Cancelar</button><button :class="{ destructive: request.destructive, primary: !request.destructive }" :disabled="busy" @click="accept">{{ busy ? 'Un momento…' : request.actionLabel || 'Confirmar' }}</button></div></template>
  </dialog>
</template>
<style>
.confirmation-dialog { width: min(92vw,32rem); max-height: 85svh; overflow: auto; padding: 1.5rem; border: 1px solid #e4c180; background: #102c3b; color: #fff3d3; box-shadow: 0 2rem 6rem #0009; }.confirmation-dialog::backdrop { background: #020c15bb; }.confirmation-dialog p { line-height: 1.6; }.confirmation-dialog button { padding: .75rem 1rem; cursor: pointer; }.confirmation-dialog .destructive { background: #722f2c; color: #fff3d3; border: 1px solid #e6a19a; }
</style>
