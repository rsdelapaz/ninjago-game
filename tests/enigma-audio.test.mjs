import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createEnigmaAudio } from '../src/enigmaAudio.ts'

test('original enigma audio is lazy, gesture-enabled, bounded and cleans every voice on mute/dispose',async()=>{
  const saved=Object.getOwnPropertyDescriptor(globalThis,'AudioContext')
  let contexts=0,resumes=0,closed=0,stops=0,disconnects=0
  const voices=[]
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){}}
  class Context {
    state='running';currentTime=10;destination={}
    constructor(){contexts++}
    async resume(){resumes++}
    createOscillator(){const voice={frequency:parameter,connect(){},disconnect(){disconnects++},start(t){assert(t>=10)},stop(t){if(t!==undefined)assert(t<12);stops++}};voices.push(voice);return voice}
    createGain(){return {gain:parameter,connect(){},disconnect(){disconnects++}}}
    async close(){closed++;this.state='closed'}
  }
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:Context})
  try {
    const audio=createEnigmaAudio();audio.play('charge');assert.equal(contexts,0)
    assert.equal(await audio.unlock(),true);assert.equal(contexts,1);assert.equal(resumes,1)
    audio.play('victory');assert.equal(voices.length,4)
    voices[0].onended();assert(disconnects>=2)
    audio.stop();assert(stops>=7)
    const old=voices.length;audio.dispose();await Promise.resolve();assert.equal(closed,1)
    assert.equal(await audio.unlock(),false);audio.play('reject');assert.equal(voices.length,old)
  } finally {if(saved)Object.defineProperty(globalThis,'AudioContext',saved);else delete globalThis.AudioContext}
})
