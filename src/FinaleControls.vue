<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { finaleCanAnswer, finaleCeremony, finaleHasProgress, type FinaleAction, type FinaleProgress } from './finale'
import { finaleNarrative } from './finaleNarrative'
import { confirmAction } from './confirmation'
const props=defineProps<{progress:FinaleProgress;config?:ProfileConfig;disabled:boolean;publicReady:boolean;revision?:number}>()
const emit=defineEmits<{action:[action:FinaleAction];home:[]}>()
const proposal=ref(''),input=ref<HTMLTextAreaElement|null>(null)
const phase=computed(()=>finaleCeremony(props.progress)),story=computed(()=>props.config?finaleNarrative(props.config,props.progress):null)
const waiting=computed(()=>props.disabled||!props.publicReady),canAnswer=computed(()=>finaleCanAnswer(props.progress))
let mounted=true
onUnmounted(()=>{mounted=false})
watch(()=>props.progress.runId,()=>{proposal.value=''})
watch([canAnswer,waiting],async()=>{await nextTick();if(canAnswer.value&&!waiting.value)input.value?.focus({preventScroll:true})})
function submit(){if(!waiting.value&&canAnswer.value)emit('action',{type:'submit',proposal:proposal.value})}
async function reset(){const reviewed=JSON.stringify([props.revision,props.progress]);if(finaleHasProgress(props.progress)&&!await confirmAction('Se volverá a la presentación inicial de Wu y se limpiarán solo los intentos del desenlace. Equipos, configuración, pruebas y ganadores se conservan.','¿Volver a empezar la ceremonia?',true))return;if(mounted&&reviewed===JSON.stringify([props.revision,props.progress])&&!waiting.value)emit('action',{type:'reset'})}
async function home(){const reviewed=JSON.stringify([props.revision,props.progress]);if(await confirmAction('Volver a la portada conserva esta ceremonia y su resultado.','¿Volver a la portada?')&&mounted&&reviewed===JSON.stringify([props.revision,props.progress])&&!waiting.value)emit('home')}
</script>
<template>
 <section class="panel finale-controls" aria-labelledby="finale-controls-title">
  <p class="kicker">DIRECCIÓN DEL SANTUARIO</p><h2 id="finale-controls-title">Control de la ceremonia final</h2>
  <p role="status">{{progress.status==='revealing'?'El sello se abre; revelación en curso':progress.status==='rejecting'?'El sello reacciona a la respuesta':story?.title||'El santuario espera'}}</p>
  <p v-if="!publicReady" class="notice">La pantalla pública no está confirmada. Prepárala antes de continuar.</p>
  <p v-if="story" class="hint">{{story.lines.join(' ')}}</p>
  <div v-if="story?.canConfirm" class="command-row"><button data-action="clues-yes" :disabled="waiting" @click="emit('action',{type:'clues',ready:true})">SÍ, LAS TENEMOS</button><button data-action="clues-no" :disabled="waiting" @click="emit('action',{type:'clues',ready:false})">NO, TODAVÍA NOS FALTAN</button></div>
  <form v-if="canAnswer" @submit.prevent="submit"><label for="finale-proposal">{{phase==='joint'?'Frase final pronunciada por el capitán':'Frase que presenta este clan'}}</label><textarea id="finale-proposal" ref="input" v-model="proposal" rows="2" maxlength="1024" autocomplete="off" spellcheck="false" :disabled="waiting" @keydown.enter.exact.prevent="submit"></textarea><p class="hint">Entrada privada del organizador. Solo la última respuesta rechazada se conserva en el resultado de este turno; los canales no transportan su texto.</p><button data-action="submit" class="primary" :disabled="waiting||!proposal.trim()">{{phase==='joint'?'ENTREGAR LA FRASE FINAL':'Entregar al Maestro Wu'}}</button></form>
  <div class="command-row"><button v-if="story?.action&&!['rejecting','revealing','success'].includes(progress.status)" :data-action="phase==='jointFail'?'retry':'advance'" class="primary" :disabled="waiting" @click="emit('action',{type:phase==='jointFail'?'retry':'advance'})">{{story.action}}</button><button data-action="restore" :disabled="waiting" @click="emit('action',{type:'restore'})">RESTABLECER ESCENA</button><button v-if="progress.status==='success'" data-action="replay" :disabled="waiting" @click="emit('action',{type:'replay'})">REPETIR REVELACIÓN</button><button data-action="reset" :disabled="waiting" @click="reset">VOLVER A EMPEZAR</button><button data-action="home" :disabled="waiting" @click="home">VOLVER A LA PORTADA</button><button :disabled="waiting" :aria-pressed="progress.sound" @click="emit('action',{type:'sound',enabled:!progress.sound})">{{progress.sound?'Desactivar sonido final':'Activar sonido final'}}</button></div>
  <p class="hint">Restablecer detiene efectos y conserva la historia. Volver a empezar limpia solo la ceremonia final. Repetir revelación conserva la victoria. Las preguntas esperan sin caducidad.</p>
 </section>
</template>
<style scoped>
.finale-controls label{display:block;margin:.7rem 0;font-weight:700}.finale-controls textarea{width:100%;min-height:5rem;background:#071c29;color:#fff0c7;border:1px solid #a4b3a4;padding:.8rem;font:inherit}.finale-controls .command-row{flex-wrap:wrap;margin:1rem 0;gap:.7rem}.finale-controls textarea:focus-visible{outline:3px solid #f4d68d;outline-offset:3px}
</style>
