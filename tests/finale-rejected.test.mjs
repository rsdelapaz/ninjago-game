import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createFinaleProgress,transitionFinale,settledFinale,currentFinale,finaleRejectedAnswer,validFinaleProgress} from '../src/finale.ts'
test('the exact rejected phrase belongs only to its failed turn, survives restore/read and never stores a correct proposal',()=>{
 const config={answer:'FRASE CORRECTA',secret:'SECRETO',videoFilename:'',audioFilename:'',failureMessage:''}
 let p=createFinaleProgress(config),run=0
 const act=a=>p=transitionFinale(config,p,a,String(++run))
 act({type:'advance'});act({type:'advance'});act({type:'clues',ready:true})
 const raw='  ¡Sombra & <b>de piedra</b>!  '
 act({type:'submit',proposal:raw});p=settledFinale(p)
 assert.equal(finaleRejectedAnswer(config,p),raw);assert(validFinaleProgress(p))
 p=currentFinale(config,JSON.parse(JSON.stringify(p)));act({type:'restore'})
 assert.equal(finaleRejectedAnswer(config,p),raw)
 assert.equal(finaleRejectedAnswer(config,{...p,ceremonyPhase:'fail2'}),'')
 assert.equal(finaleRejectedAnswer(config,{...p,rejectedAnswer:{turn:0,text:config.answer}}),'')
 assert(!validFinaleProgress({...p,rejectedAnswer:{turn:9,text:raw}}))
 act({type:'advance'});assert.equal(p.rejectedAnswer,undefined)
 act({type:'advance'});act({type:'clues',ready:true});act({type:'submit',proposal:'fraSE correcta'})
 assert.equal(p.ceremonyPhase,'captain');assert.equal(p.rejectedAnswer,undefined)
 act({type:'advance'});act({type:'submit',proposal:raw});p=settledFinale(p)
 assert.equal(finaleRejectedAnswer(config,p),raw);act({type:'retry'});assert.equal(p.rejectedAnswer,undefined)
 act({type:'submit',proposal:config.answer});p=settledFinale(p)
 assert.equal(p.status,'success');assert.equal(p.rejectedAnswer,undefined)
})
