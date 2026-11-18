import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProfile, exportProfile, sortParticipants } from '../src/profile.ts'
import { createReveal, revealPlan, revealFrame, changeReveal, REVEAL_PAGE_MS } from '../src/reveal.ts'
test('clan pages reveal every ninja exactly once, captain first then Spanish alphabetical order',()=>{
  const c=createProfile('colegio')
  c.participants=Array.from({length:23},(_,i)=>({id:'synthetic-'+i,name:i===0?'Óscar':'Ninja '+(23-i)}))
  c.teams[0].memberIds=c.participants.slice(0,17).map(p=>p.id);c.teams[0].captainId='synthetic-0'
  c.teams[1].memberIds=c.participants.slice(17).map(p=>p.id);c.teams[1].captainId='synthetic-20'
  const before=exportProfile(c),plan=revealPlan(c)
  for(const t of plan.teams){
    const all=t.pages.flat();assert.equal(all.length,t.team.memberIds.length);assert.equal(new Set(all.map(p=>p.id)).size,all.length)
    assert.equal(all[0].id,t.team.captainId);assert.deepEqual(all.slice(1),sortParticipants(all.slice(1)))
    const seen=[]
    for(let i=0;i<plan.count;i++){const frame=revealFrame(createReveal(100),plan.count,100+i*REVEAL_PAGE_MS);seen.push(...(t.pages[frame.page]||[]).map(p=>p.id))}
    assert.deepEqual(seen,all.map(p=>p.id))
  }
  assert.equal(exportProfile(c),before)
})
test('long names wrap without one-ninja pages and asymmetric teams stay complete',()=>{
  const c=createProfile('colegio');c.participants=Array.from({length:15},(_,i)=>({id:'p'+i,name:'Nombre de prueba extremadamente largo '+i}))
  c.teams[0].memberIds=c.participants.slice(0,14).map(p=>p.id);c.teams[0].captainId='p0'
  c.teams[1].memberIds=['p14'];c.teams[1].captainId='p14'
  c.teams[0].name='Un nombre de equipo deliberadamente largo que nunca debe obligar a paginar individualmente'
  const plan=revealPlan(c);assert.equal(plan.count,2);assert.deepEqual(plan.teams[0].pages.map(p=>p.length),[12,2])
  assert.deepEqual(plan.teams[0].pages.flat().map(p=>p.name),plan.teams[0].members.map(p=>p.name))
  assert.equal(plan.teams[1].pages.length,1)
})

test('seven ninjas per clan remain together on one page, including long names and captains',()=>{
  const c=createProfile('colegio')
  c.participants=Array.from({length:14},(_,i)=>({id:'p'+i,name:i%2?'Álvaro de la Formación Ninja '+i:'Óscar '+i}))
  c.teams.forEach((t,i)=>{t.memberIds=c.participants.slice(i*7,i*7+7).map(p=>p.id);t.captainId=t.memberIds[5];t.name='Un clan con nombre largo que ocupa más de cuarenta caracteres'})
  const before=exportProfile(c), plan=revealPlan(c)
  assert.equal(plan.count,1)
  for(const t of plan.teams){
    assert.equal(t.pages[0].length,7)
    assert.equal(t.pages[0][0].id,t.team.captainId)
    assert.deepEqual(t.pages[0].slice(1),sortParticipants(t.members.slice(1)))
  }
  assert.equal(new Set(plan.teams.flatMap(t=>t.pages.flat().map(p=>p.id))).size,14)
  assert.equal(revealFrame(createReveal(0),1,100000).page,0)
  assert.equal(exportProfile(c),before)
})

test('larger formations fill up to twelve before paging with no empty last-page slots',()=>{
  const c=createProfile('urbanizacion')
  for(const count of [8,9,12,13,24,25]){
    c.participants=Array.from({length:count},(_,i)=>({id:'p'+i,name:'Ninja '+i}))
    c.teams[0].memberIds=c.participants.map(p=>p.id)
    const p=revealPlan(c)
    assert.equal(p.count,Math.ceil(count/12))
    assert(p.teams[0].pages.every(group=>group.length>0&&group.length<=12))
    assert.deepEqual(p.teams[0].pages.flat(),p.teams[0].members)
  }
})
test('skip, replay, page controls and reload share a deterministic timeline independent of gameplay',()=>{
  let r=createReveal(1000)
  assert.equal(revealFrame(r,3,1001).activated,false)
  assert.equal(revealFrame(r,3,1000+REVEAL_PAGE_MS).page,1)
  r=changeReveal(r,'skip',3,1200);assert.equal(r.animate,false);assert.equal(revealFrame(r,3,1200).activated,true)
  r=changeReveal(r,'next',3,1500);assert.equal(r.page,1);assert.equal(r.automatic,false)
  r=changeReveal(r,'pause',3,1600);assert.equal(r.automatic,true)
  const reloaded=JSON.parse(JSON.stringify(r));assert.deepEqual(revealFrame(reloaded,3,20000),revealFrame(r,3,20000))
  r=changeReveal(r,'replay',3,21000);assert.deepEqual(r,createReveal(21000))
})
