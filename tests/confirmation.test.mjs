import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createConfirmations } from '../src/confirmation.ts'
test('confirmation accepts once, rejects duplicate requests and keeps async actions busy',async()=>{
  const c=createConfirmations();let count=0,finish
  const result=c.ask({title:'Cambiar resultado',explanation:'Revisado'},()=>{count++;return new Promise(resolve=>{finish=resolve})})
  assert.equal(await c.ask({title:'Duplicado',explanation:'No'}),false)
  const accepting=c.accept();await c.accept();c.cancel();assert.equal(c.busy.value,true);assert.equal(count,1)
  finish();await accepting;assert.equal(await result,true);assert.equal(c.request.value,null)
})
test('cancel/Escape path does not execute; async failures keep dialog recoverable',async()=>{
  const c=createConfirmations();let count=0
  const cancelled=c.ask({title:'Eliminar',explanation:'Destructiva',destructive:true},()=>count++)
  c.cancel();assert.equal(await cancelled,false);assert.equal(count,0)
  const failed=c.ask({title:'Guardar',explanation:'Intentar'},()=>{throw Error('Sin espacio')})
  await c.accept();assert.equal(c.error.value,'Sin espacio');assert(c.request.value);assert.equal(c.busy.value,false)
  c.cancel();assert.equal(await failed,false)
})
