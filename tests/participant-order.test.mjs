import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortParticipants, publicMembers, memberCandidateGroups, createProfile, exportProfile, initialSuggestedNames, parseProfile, assignProfileMembers } from '../src/profile.ts'
import { initializeProfiles, readProfile, saveProfile, profileKey } from '../src/profileStorage.ts'
test('Spanish ordering respects accents, ñ and numeric names without mutating arrays or IDs',()=>{
  const names=['Ninja 10','Zoe','Óscar','Álvaro','Ninja 2','Érika','Ñu','Nube','alvaro']
  const people=names.map((name,i)=>({id:String(i),name})), before=JSON.stringify(people)
  const sorted=sortParticipants(people)
  assert.deepEqual(sorted.map(p=>p.name),['Álvaro','alvaro','Érika','Ninja 2','Ninja 10','Nube','Ñu','Óscar','Zoe'])
  assert.equal(JSON.stringify(people),before);assert.equal(sorted[0],people[3])
})
test('public captain comes first; remaining members are alphabetical without changing stored members',()=>{
  const c=createProfile('colegio');c.participants=['Zoe','Óscar','Álvaro','Érika'].map((name,i)=>({id:String(i),name}))
  const t=c.teams[0];t.memberIds=['1','0','3','2'];t.captainId='0'
  const before=exportProfile(c)
  assert.deepEqual(publicMembers(c,t).map(p=>p.name),['Zoe','Álvaro','Érika','Óscar'])
  assert.equal(exportProfile(c),before)
})
test('candidate selector puts unassigned before opposite members, each alphabetical and excluding destination',()=>{
  const c=createProfile('colegio');c.participants=['Zoe','Álvaro','Óscar','Érika','Ana'].map((name,i)=>({id:String(i),name}))
  c.teams[0].memberIds=['4'];c.teams[1].memberIds=['3','2'];c.teams[1].captainId='2'
  const groups=memberCandidateGroups(c,c.teams[0].id)
  assert.deepEqual(groups.map(g=>g.participants.map(p=>p.name)),[['Álvaro','Zoe'],['Érika','Óscar']])
  assignProfileMembers(c,['1','2'],c.teams[0].id)
  assert.equal(c.teams[1].captainId,null);assert.deepEqual(c.teams[1].memberIds,['3'])
  assert.equal(c.teams.flatMap(t=>t.memberIds).filter(id=>id==='2').length,1)
})
test('new profiles get independent editable initial suggestions; saved intentional emptiness stays empty',()=>{
  const data=new Map(),s={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}
  initializeProfiles(s)
  const c=readProfile(s,'colegio'),other=readProfile(s,'urbanizacion')
  assert.deepEqual(c.teams.map(t=>t.suggestedNames),initialSuggestedNames)
  c.teams[0].suggestedNames.reverse();c.teams[1].suggestedNames=[]
  saveProfile(s,c,s.getItem(profileKey(c.id)));initializeProfiles(s)
  const loaded=readProfile(s,c.id)
  assert.deepEqual(loaded.teams[0].suggestedNames,[...initialSuggestedNames[0]].reverse())
  assert.deepEqual(loaded.teams[1].suggestedNames,[])
  assert.deepEqual(parseProfile(JSON.parse(exportProfile(loaded))).teams[1].suggestedNames,[])
  assert.deepEqual(readProfile(s,'urbanizacion'),other)
})
