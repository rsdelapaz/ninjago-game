import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile } from '../src/profile.ts'
import { createFinaleProgress } from '../src/finale.ts'
import { finaleNarrative } from '../src/finaleNarrative.ts'

function fixture() {
  const config=createProfile('colegio')
  config.participants=[{id:'captain-a',name:'Aitana de ensayo'},{id:'member-a',name:'Álvaro de ensayo'},{id:'captain-b',name:'Bruno de ensayo'},{id:'member-b',name:'Zoe de ensayo'}]
  config.teams.forEach((team,index)=>{team.name=index?'Los Vientos de ensayo':'Las Montañas de ensayo';team.color=index?'#55c4de':'#d36b3d';team.memberIds=index?['member-b','captain-b']:['member-a','captain-a'];team.captainId=index?'captain-b':'captain-a'})
  config.finale={answer:'RESPUESTA PRIVADA DE ENSAYO',secret:'SECRETO PRIVADO DE ENSAYO',videoFilename:'',audioFilename:'',failureMessage:'Unid los dos clanes: mensaje personalizado que podría anticipar el giro.'}
  return config
}

test('public dialogue never leaks the cooperation twist, answer, secret or customizable hint before Wu reveals the truth',()=>{
  const config=fixture(),initial=createFinaleProgress(config.finale)
  for(const phase of ['intro','call1','clues1','answer1','fail1','call2','clues2','answer2','fail2']) {
    const progress={...initial,ceremonyPhase:phase,status:phase.startsWith('fail')?'failure':'ready',attempts:phase==='fail2'?[1,1,0]:[1,0,0]}
    const dialogue=JSON.stringify(finaleNarrative(config,progress))
    assert(!dialogue.includes(config.finale.answer),phase)
    assert(!dialogue.includes(config.finale.secret),phase)
    assert(!dialogue.includes(config.finale.failureMessage),phase)
    for(const spoiler of ['Unid vuestras pistas','Cada clan guarda una parte','Ninguno tiene la frase completa','descubierto juntos'])assert(!dialogue.includes(spoiler),`${phase}: ${spoiler}`)
  }
  const truth=finaleNarrative(config,{...initial,ceremonyPhase:'truth',attempts:[1,1,0]})
  assert(truth.lines.join(' ').includes('Ninguno tiene la frase completa'))
  assert(truth.lines.join(' ').includes('Unid vuestras pistas'))
  assert.equal(truth.custom,config.finale.failureMessage)
  assert(!JSON.stringify(truth).includes(config.finale.answer));assert(!JSON.stringify(truth).includes(config.finale.secret))
})

test('each call uses its actual clan, all members and its own captain, while the last act always calls the first captain',()=>{
  const config=fixture(),initial=createFinaleProgress(config.finale),raw=JSON.stringify(config)
  for(const [phase,index] of [['call1',0],['call2',1]]){
    const story=finaleNarrative(config,{...initial,ceremonyPhase:phase})
    assert.equal(story.clan.name,config.teams[index].name)
    assert(story.lines.join(' ').includes(config.teams[index].name))
    assert.deepEqual(story.clan.members.map(person=>person.id),index?['captain-b','member-b']:['captain-a','member-a'])
    assert.equal(story.clan.captain.id,index?'captain-b':'captain-a')
  }
  const captain=finaleNarrative(config,{...initial,ceremonyPhase:'captain',attempts:[1,1,0]})
  assert(captain.title.includes('Aitana de ensayo'));assert(captain.lines.join(' ').includes('Aitana de ensayo'))
  assert(!captain.title.includes('Bruno de ensayo'))
  assert.equal(JSON.stringify(config),raw)
})

test('early correctness receives a truthful captain proclamation without fabricated rejections or the two-failure dialogue',()=>{
  const config=fixture(),initial=createFinaleProgress(config.finale)
  for(const attempts of [[1,0,0],[1,1,0]]){
    const story=finaleNarrative(config,{...initial,ceremonyPhase:'captain',earlyCorrect:true,attempts})
    assert(story.lines.join(' ').includes('El sello ha reconocido vuestras palabras.'))
    assert(story.lines.join(' ').includes('Habéis descubierto la frase.'))
    assert(!story.lines.join(' ').includes('Ninguno tiene la frase completa'))
    assert(!story.lines.join(' ').includes('sello sigue cerrado'))
    assert.equal(story.custom,'')
  }
  const missed=finaleNarrative(config,{...initial,ceremonyPhase:'clues2',cluesMissing:true})
  assert(missed.lines.join(' ').includes('El sello seguirá esperando.'));assert.equal(missed.canConfirm,true)
  assert.equal(missed.action,undefined,'Missing clues never offer an advance to the next act')
})
