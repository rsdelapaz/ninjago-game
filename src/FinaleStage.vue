<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { ProfileConfig } from './profile'
import { finaleCanAnswer, finaleHasProgress, finaleRejectedAnswer, normalizeFinaleAnswer, type FinaleAction, type FinaleProgress } from './finale'
import { finaleNarrative } from './finaleNarrative'
import { confirmAction } from './confirmation'
import { useFinaleCinema } from './useFinaleCinema'
import FinaleWordBoard from './FinaleWordBoard.vue'
import './finale.css'
const props = defineProps<{ config: ProfileConfig; progress: FinaleProgress; preview?: boolean; sendAction?: (action: FinaleAction) => Promise<boolean> }>()
const emit = defineEmits<{ finish: [runId: string]; home: [] }>()
const root=ref<HTMLElement|null>(null),canvas=ref<HTMLCanvasElement|null>(null),heading=ref<HTMLHeadingElement|null>(null),proposalInput=ref<HTMLTextAreaElement|null>(null)
const audio=ref<HTMLAudioElement|null>(null),videoFailed=ref(false),artworkFailed=ref(false),wuFailed=ref(false),audioNotice=ref(''),audioAllowed=ref(false)
const proposal=ref(''),submitting=ref(false),proposalProblem=ref(''),actionNotice=ref('')
const colors=computed<[string,string]>(()=>[props.config.teams[0].color||'#e2aa65',props.config.teams[1].color||'#70d9e5'])
const story=computed(()=>finaleNarrative(props.config,props.progress)),canAnswer=computed(()=>finaleCanAnswer(props.progress))
const roster=computed(()=>story.value.index!==null?story.value.clan:null)
const showMembers=computed(()=>story.value.phase==='call1'||story.value.phase==='call2')
const rejectedAnswer=computed(()=>finaleRejectedAnswer(props.config.finale,props.progress))
const artworkUrl=`${import.meta.env.BASE_URL}private-media/finale-sanctuary.png`,wuUrl=`${import.meta.env.BASE_URL}private-media/ninjago-key-art.png`
const mediaUrl=(name:string)=>`${import.meta.env.BASE_URL}private-media/${props.config.id}/${encodeURIComponent(name)}`
let audioContext:AudioContext|undefined,disposed=false
const voices=new Set<OscillatorNode>()
function stopAudio(){voices.forEach(voice=>{try{voice.stop();voice.disconnect()}catch{/* Already ended. */}});voices.clear();if(audio.value){audio.value.pause();try{audio.value.currentTime=0}catch{/* Not loaded. */}}}
function cue(name:'gather'|'burst'|'reject'){
 if(!audioAllowed.value||!props.progress.sound||!audioContext||audioContext.state!=='running')return
 try{const context=audioContext,oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime
 oscillator.type='sine';oscillator.frequency.setValueAtTime(name==='reject'?110:name==='gather'?174:220,now);oscillator.frequency.exponentialRampToValueAtTime(name==='reject'?70:name==='gather'?260:440,now+1.3)
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.055,now+.25);gain.gain.exponentialRampToValueAtTime(.001,now+1.5)
 oscillator.connect(gain);gain.connect(context.destination);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(now);oscillator.stop(now+1.6)
 }catch{stopAudio();audioNotice.value='La aventura continúa sin sonido.'}
}
const {phase,reducedMotion,canvasAvailable}=useFinaleCinema(root,canvas,()=>({progress:props.progress,preview:props.preview,colors:colors.value}),id=>emit('finish',id),cue)
const resolved=computed(()=>!props.preview&&['phrase','secret','success'].includes(phase.value))
const revealed=computed(()=>!props.preview&&['secret','success'].includes(phase.value))
const animating=computed(()=>['rejecting','revealing'].includes(props.progress.status))
const failed=computed(()=>['destabilizing','failure'].includes(phase.value))
const sectors=computed(()=>[(props.progress.attempts?.[0]||0)>0&&!props.progress.earlyCorrect,(props.progress.attempts?.[1]||0)>0&&!props.progress.earlyCorrect])
// Presentation density only; the configured secret remains exact, including whitespace.
const inscriptionSize=computed(()=>props.config.finale.secret.length<=28?'monumental':props.config.finale.secret.length<=110?'ceremonial':'extended')
const words=computed(()=>resolved.value?props.config.finale.answer.split(/\s+/).filter(Boolean):[])
async function send(action:FinaleAction){
 if(props.preview||submitting.value||!props.sendAction)return
 proposalProblem.value='';actionNotice.value=''
 if(action.type==='submit'&&!normalizeFinaleAnswer(action.proposal)){proposalProblem.value='Escribid una frase de hasta 256 caracteres significativos, sin caracteres de control.';proposalInput.value?.focus();return}
 const reviewed=JSON.stringify([props.config,props.progress])
 if(action.type==='replay'&&!await confirmAction('Se volverá a abrir el pergamino. El resultado se conserva.','¿Repetir revelación?'))return
 if(action.type==='reset'&&finaleHasProgress(props.progress)&&!await confirmAction('Volveréis al inicio de la ceremonia final. Se borrarán los intentos, el resultado y el tablero del desenlace.','¿Restablecer escena?',true))return
 if(disposed||reviewed!==JSON.stringify([props.config,props.progress]))return
 submitting.value=true
 try{const accepted=await props.sendAction(action);if(!disposed&&accepted&&action.type==='reset')actionNotice.value='Escena restablecida. Podéis comenzar la ceremonia.';if(!disposed&&!accepted)proposalProblem.value='La escena ha cambiado o está ocupada. Revisad el estado antes de continuar.'}
 catch{if(!disposed)proposalProblem.value='No se pudo entregar la respuesta. Volved a intentarlo.'}finally{submitting.value=false}
}
async function home(){const reviewed=JSON.stringify([props.config,props.progress]);if(await confirmAction('Volveréis a la portada. Esta ceremonia y su resultado se conservarán.','¿Volver a la portada?')&&!disposed&&reviewed===JSON.stringify([props.config,props.progress]))emit('home')}
async function toggleAudio(){if(audioAllowed.value){audioAllowed.value=false;stopAudio();return}try{const Audio=window.AudioContext;if(Audio){audioContext||=new Audio();await audioContext.resume()}if(disposed)return;audioAllowed.value=true;audioNotice.value='';if(revealed.value&&audio.value)await audio.value.play()}catch{audioAllowed.value=false;audioNotice.value='La aventura continúa sin sonido.'}}
watch(()=>props.progress.runId,()=>{root.value?.getAnimations?.({subtree:true}).forEach(animation=>{if(Number.isFinite(animation.effect?.getComputedTiming().endTime))animation.cancel()});stopAudio();audioNotice.value='';videoFailed.value=false;proposal.value='';proposalProblem.value='';actionNotice.value=''})
watch(()=>props.progress.sound,enabled=>{if(!enabled)stopAudio()})
watch(revealed,async value=>{if(!value)return;await nextTick();if(!disposed&&audioAllowed.value&&props.progress.sound&&audio.value){try{await audio.value.play()}catch{audioNotice.value='Podéis seguir leyendo el secreto.'}}})
watch([phase,()=>props.progress.runId,submitting,canAnswer],async([value,run])=>{await nextTick();if(disposed||props.preview||story.value.phase==='words'||phase.value!==value||props.progress.runId!==run)return;if(canAnswer.value&&!submitting.value)proposalInput.value?.focus({preventScroll:true});else if(!submitting.value){if(revealed.value)root.value?.querySelector<HTMLElement>('.finale-secret-copy')?.focus({preventScroll:true});else heading.value?.focus({preventScroll:true})}},{flush:'post',immediate:true})
watch(()=>story.value.phase, async value=>{if(value!=='words'||props.preview)return;await nextTick();if(story.value.phase==='words')heading.value?.focus({preventScroll:true})},{flush:'post',immediate:true})
onUnmounted(()=>{disposed=true;stopAudio();void audioContext?.close().catch(()=>{})})
</script>
<template>
 <div v-if="preview" class="finale-preview finale-thumbnail" role="img" aria-label="El santuario espera. Vista previa sin respuestas ni secretos.">
  <img v-if="!artworkFailed" :src="artworkUrl" alt="" @error="artworkFailed=true"/><div class="finale-thumbnail-copy"><span>EL SANTUARIO OS ESPERA</span><strong>EL ÚLTIMO SECRETO</strong><p>La ceremonia del Maestro Wu</p><small>EL SELLO AGUARDA.</small></div>
 </div>
 <main v-else ref="root" class="finale-stage" :data-story-phase="story.phase" :class="[`finale-phase-${phase}`,`finale-story-${story.phase}`,{'finale-reduced':reducedMotion,'finale-failed':failed,'finale-resolved':resolved,'finale-revealed':revealed,'finale-sector-a-dark':sectors[0],'finale-sector-b-dark':sectors[1],'finale-second-failure':story.phase==='answer2'||story.phase==='fail2'}]" :style="{'--finale-clan-a':colors[0],'--finale-clan-b':colors[1],'--finale-active-color':roster?.color||colors[0],'--finale-stone':'url('+artworkUrl+')'}" :aria-busy="submitting||animating">
  <div class="finale-fallback-temple" aria-hidden="true"><i></i><i></i><div class="finale-fallback-portal"></div></div>
  <img v-if="!artworkFailed" class="finale-sanctuary" :src="artworkUrl" alt="" @error="artworkFailed=true"/>
  <!-- Surface wear follows the existing sanctuary perspective; no alternate scene or story state. -->
  <svg v-if="failed" class="finale-ruin-wear" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
   <defs>
    <filter id="finale-ruin-soft-light" x="-.25" y="-.1" width="1.5" height="1.2"><feGaussianBlur stdDeviation="11"/></filter>
    <linearGradient id="finale-ruin-rake" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#b4c0be" stop-opacity=".14"/><stop offset=".5" stop-color="#718888" stop-opacity=".045"/><stop offset="1" stop-color="#718888" stop-opacity="0"/></linearGradient>
    <linearGradient id="finale-ruin-floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#171d1d" stop-opacity="0"/><stop offset="1" stop-color="#0a1010" stop-opacity=".78"/></linearGradient>
    <pattern id="finale-ruin-grit" width="79" height="61" patternUnits="userSpaceOnUse"><path d="m8 14 3-1m35 25 2 1m21-27-2 2M23 54l4-1M58 48l3 1" stroke="#b7afa0" stroke-opacity=".17" stroke-width=".8"/><path d="m16 31 6-2m32-11 7 2M32 8l2 6" stroke="#04090b" stroke-opacity=".5" stroke-width="1.4"/></pattern>
   </defs>
   <path class="finale-ruin-light" d="M328 0 389 0 889 880 484 813Z" fill="url(#finale-ruin-rake)" filter="url(#finale-ruin-soft-light)"/>
   <g class="finale-ruin-banners" fill="#161d1c" stroke="#615b49" stroke-opacity=".35"><path d="m429 229 57 2-3 282-14-18-5 54-12-37-13 12-6-79Z"/><path d="m1187 231 55-2-10 260-9 32-8-25-11 58-8-32Z"/></g>
   <g class="finale-ruin-fractures" fill="none" stroke-linejoin="bevel">
    <path d="m88 178 28 68-10 52 31 73-17 24 14 58-29 43 6 49M118 246l34-20 15-34M136 371l32 18 24-8M105 496l-29 17-8 27M1542 197l-30 75 17 48-35 71 12 54-31 48 11 73M1511 274l-32-18-17-32M1494 392l-43 13-19-7M770 99l-24 19 6 23-36 28M915 128l18 24-7 36 25 16M617 337l-30 30 9 35-38 47 10 44M1050 323l29 43-14 39 36 49-9 26"/>
    <path d="m75 931 121-73 20-55 94-46M197 858l88 23 65-10M216 803l-43-18M676 936l43-66-22-51 44-42M718 870l62 19 47-11M1191 939l-81-58 19-56-53-56M1110 881l-72 8-33-16M1556 923l-95-71-10-40-77-39M1461 852l52-22"/>
   </g>
   <path class="finale-ruin-soot" d="M0 105h192v655H0ZM1491 105h181v655h-181ZM199 743h1273v198H199Z" fill="url(#finale-ruin-grit)"/>
   <path d="m203 755 19-14 31 4-14 21-23-3Zm1184 14 25-22 36 8-20 17ZM544 841l28-12 37 12-15 12-35-2Z" fill="#252b29" stroke="#6d7268" stroke-opacity=".3"/>
   <path d="M0 785h1672v156H0Z" fill="url(#finale-ruin-floor)"/>
   <g class="finale-ruin-roots" fill="none"><path d="M0 941q130-51 181-130t104-87M104 870l-30-81-25-20M175 822l88 2 51-31M1672 941q-113-56-177-152t-104-62M1551 849l43-72 34-20M1480 778l-69 28-49-8"/></g>
   <g class="finale-ruin-dust" fill="#b4bbb2"><circle cx="378" cy="309" r="1.1"/><circle cx="445" cy="385" r="1.5"/><circle cx="495" cy="453" r="1"/><circle cx="534" cy="551" r="1.3"/><circle cx="585" cy="628" r="1.6"/><circle cx="635" cy="683" r=".9"/><circle cx="718" cy="745" r="1.3"/><circle cx="462" cy="593" r=".8"/><circle cx="542" cy="711" r="1.2"/><circle cx="805" cy="794" r=".9"/></g>
  </svg>
  <div v-if="failed" class="finale-ruin-air" aria-hidden="true"></div>
  <div class="finale-atmosphere" aria-hidden="true"></div><div class="finale-cinematic-shade" aria-hidden="true"></div>
  <div class="finale-chamber" aria-hidden="true"></div>
  <div class="finale-seal-left" aria-hidden="true"></div><div class="finale-seal-right" aria-hidden="true"></div>
  <div class="finale-clan-stream finale-stream-left" aria-hidden="true"><span></span><span></span></div><div class="finale-clan-stream finale-stream-right" aria-hidden="true"><span></span><span></span></div>
  <div class="finale-door-light" aria-hidden="true"></div><div class="finale-ignition" aria-hidden="true"></div><div class="finale-wave" aria-hidden="true"></div><div class="finale-wave finale-wave-outer" aria-hidden="true"></div>
  <div class="finale-sigil" aria-hidden="true"><svg viewBox="0 0 600 600"><g class="finale-seal-traces"><circle cx="300" cy="300" r="265"/><circle cx="300" cy="300" r="235"/><path d="m300 35 188 77 77 188-77 188-188 77-188-77-77-188 77-188Z"/></g><g v-for="n in 16" :key="n" class="finale-rune" :transform="`rotate(${n*22.5} 300 300)`"><path d="M291 58h18l-9 14-9 8h18M294 83h12"/></g><path class="finale-crack finale-fracture-left" d="m264 52-45 94 25 68-67 80 35 70-40 88"/><path class="finale-crack finale-fracture-right" d="m340 57 36 90-23 90 70 70-40 63 32 86"/></svg></div>
  <canvas ref="canvas" class="finale-particles" aria-hidden="true"></canvas>
  <header class="finale-header"><p>EL SECRETO <span>DEL MAESTRO WU</span></p><button v-if="progress.sound" type="button" :aria-pressed="audioAllowed" @click="toggleAudio">{{audioAllowed?'Silenciar esta pantalla':'Activar sonido aquí'}}</button><span v-else class="finale-header-mark" aria-hidden="true">EL SANTUARIO ANCESTRAL</span></header>
  <section class="finale-story" aria-labelledby="finale-title">
   <aside v-if="story.phase!=='words'" class="finale-wu" aria-label="El Maestro Wu en el santuario"><img v-if="!wuFailed" :src="wuUrl" alt="El Maestro Wu con su sombrero y su bastón" @error="wuFailed=true"/><p v-else class="finale-wu-fallback">MAESTRO WU<span>El maestro os acompaña con sus palabras.</span></p><span class="finale-wu-name">MAESTRO WU <small>GUARDIÁN DEL SANTUARIO</small></span></aside>
   <div class="finale-dialogue" :key="story.phase">
    <p v-if="story.phase!=='words'" class="finale-kicker">{{revealed?'EL LEGADO DEL MAESTRO WU':resolved?'EL PODER HA DESPERTADO':animating?'EL SELLO ESTÁ ESCUCHANDO…':'EL MAESTRO WU OS HABLA'}}</p>
    <h1 id="finale-title" ref="heading" tabindex="-1">{{revealed?'EL SECRETO HA SIDO REVELADO':resolved?'¡LO HABÉIS CONSEGUIDO!':animating?'EL SELLO DESPIERTA':showMembers?'EL ÚLTIMO SECRETO':story.title}}</h1>
    <section v-if="roster&&!animating&&!revealed" class="finale-clan" :aria-label="`Integrantes de ${roster.name}`">
     <div class="finale-clan-heading"><svg class="finale-emblem" viewBox="0 0 80 80" aria-hidden="true"><path d="m40 4 28 16 6 30-34 26L6 50l6-30Z"/><path :d="story.index===1?'M25 50 40 15 55 50 40 42Z':'m20 45 24-29-4 22 20-4-25 30 5-22Z'"/></svg><span>{{roster.name}}</span></div>
     <ul v-if="showMembers" class="finale-roster"><li v-for="person in roster.members" :key="person.id" :data-captain="person.id===roster.captain?.id" :class="{'finale-captain':person.id===roster.captain?.id}"><small v-if="person.id===roster.captain?.id">CAPITÁN</small><span>{{person.name}}</span></li></ul>
    </section>
    <div v-if="!animating&&!revealed" class="finale-dialogue-lines"><p v-for="(line,index) in story.lines" :key="index" :style="{'--line':index}">{{line}}</p></div>
    <FinaleWordBoard v-if="story.phase==='words' && progress.wordBoard" :answer="config.finale.answer" :board="progress.wordBoard" :disabled="submitting" @move="(from,to)=>send({type:'move-word',from,to})" />
    <p v-if="story.custom&&!animating" class="finale-custom-message">{{story.custom}}</p>
    <section v-if="rejectedAnswer&&!animating" class="finale-rejected-answer" aria-label="Respuesta rechazada de este turno"><h2>VUESTRA RESPUESTA</h2><blockquote><p>{{rejectedAnswer}}</p></blockquote><small>EL SELLO NO LA RECONOCE</small></section>

    <div v-if="story.canConfirm&&!animating" class="finale-actions"><p v-if="progress.cluesMissing" class="finale-clues-question">¿Habéis reunido todas vuestras pistas?</p><button data-action="clues-yes" :disabled="submitting" @click="send({type:'clues',ready:true})">SÍ, LAS TENEMOS</button><button data-action="clues-no" class="finale-secondary" :disabled="submitting" @click="send({type:'clues',ready:false})">NO, TODAVÍA NOS FALTAN</button></div>
    <form v-if="canAnswer&&!animating" class="finale-response" @submit.prevent="send({type:'submit',proposal})"><label for="finale-public-proposal">{{story.phase==='joint'?'Capitán, ¿cuál es la frase final?':'¿Qué frase habéis descubierto?'}}</label><textarea id="finale-public-proposal" ref="proposalInput" v-model="proposal" rows="2" maxlength="1024" autocomplete="off" spellcheck="false" placeholder="Escribid aquí vuestra respuesta…" :disabled="submitting" :aria-invalid="!!proposalProblem" :aria-describedby="proposalProblem?'finale-proposal-problem':undefined" @keydown.enter.exact.prevent="send({type:'submit',proposal})"></textarea><button data-action="submit" type="submit" :disabled="submitting||!proposal.trim()">{{submitting?'EL SELLO ESTÁ ESCUCHANDO…':story.phase==='joint'?'ENTREGAR LA FRASE FINAL':'ENTREGAR RESPUESTA'}}</button></form>
    <div v-if="story.action&&!animating&&!canAnswer" class="finale-actions"><button :data-action="story.phase==='jointFail'?'retry':'advance'" :disabled="submitting" @click="send({type:story.phase==='jointFail'?'retry':'advance'})">{{story.action}}</button></div>
    <p v-if="proposalProblem" id="finale-proposal-problem" class="finale-media-notice" role="alert">{{proposalProblem}}</p>
    <div v-if="resolved&&!revealed" class="finale-answer" role="group" :aria-label="config.finale.answer"><span v-for="(word,index) in words" :key="index" class="finale-answer-word" aria-hidden="true"><span v-for="(letter,n) in [...word]" :key="n" class="finale-glyph">{{letter}}</span></span></div>
    <article v-if="revealed" class="finale-parchment" :data-inscription-size="inscriptionSize" aria-label="Pergamino del último secreto"><div class="finale-parchment-roll" aria-hidden="true"></div><header><p>EL LEGADO DEL MAESTRO WU</p><h2>EL SECRETO HA SIDO REVELADO</h2><span aria-hidden="true">◆ ━━━━━ ◆ ━━━━━ ◆</span></header><div class="finale-parchment-paper"><div class="finale-secret-copy" tabindex="0" aria-label="Texto del secreto; desplázate para leerlo completo"><p>{{config.finale.secret}}</p></div><div class="finale-wax-seal" aria-hidden="true"><svg viewBox="0 0 60 60"><path d="m30 4 8 5 10 1 2 10 6 10-6 8-2 12-11 1-7 5-9-6-11-2-1-10-5-8 5-10 2-10 10-1Z"/><path d="m19 35 15-19-4 15 12-3-18 18 5-14Z"/></svg></div></div><div class="finale-parchment-roll" aria-hidden="true"></div></article>
    <p v-if="revealed" class="finale-wu-closing">Recordad este día, ninjas. Las mayores victorias son las que conseguimos juntos.</p>
    <details v-if="revealed&&(config.finale.videoFilename||config.finale.audioFilename)" class="finale-optional-media"><summary>Otro mensaje del Maestro Wu</summary><div v-if="config.finale.videoFilename" class="finale-video-frame"><video v-if="!videoFailed" :key="config.finale.videoFilename" controls playsinline preload="metadata" :muted="!progress.sound||!audioAllowed" :src="mediaUrl(config.finale.videoFilename)" @error="videoFailed=true" aria-label="El mensaje final del Maestro Wu"></video><p v-else role="status">El mensaje escrito del pergamino sigue disponible.</p></div><audio v-if="config.finale.audioFilename" ref="audio" controls preload="none" :muted="!progress.sound||!audioAllowed" :src="mediaUrl(config.finale.audioFilename)" aria-label="Narración o música final" @error="audioNotice='Podéis seguir leyendo el pergamino.'"></audio></details>
    <p v-if="audioNotice" class="finale-media-notice" role="status">{{audioNotice}}</p>
   </div>
  </section>
  <footer class="finale-footer"><p v-if="actionNotice" class="finale-action-status" role="status">{{actionNotice}}</p><span>{{revealed?'EL LEGADO PERMANECE':'EL SELLO AGUARDA.'}}</span><nav class="finale-transport" aria-label="Controles de la escena"><button data-action="reset" :disabled="submitting" @click="send({type:'reset'})">RESTABLECER ESCENA</button><button v-if="progress.status==='success'" data-action="replay" :disabled="submitting" @click="send({type:'replay'})">REPETIR REVELACIÓN</button><button data-action="home" :disabled="submitting" @click="home">VOLVER A LA PORTADA</button></nav></footer>
  <p class="finale-sr" role="status" aria-live="polite" aria-atomic="true">{{animating?'El sello está escuchando.':story.title}}{{!canvasAvailable?' La experiencia continúa con el sello estático.':''}}</p>
 </main>
</template>
