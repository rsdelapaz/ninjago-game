import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHoopChallenge } from '../src/hoopChallenge.ts'
import { createProfile, exportProfile, parseProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'

test('hoop template is opt-in, independently editable and round trips as ordinary profile content',()=>{
  const config=createProfile('colegio');assert.deepEqual(config.challenges,[])
  const existing=newChallenge();existing.title='Prueba existente';config.challenges.push(existing)
  const original=JSON.stringify(existing), first=createHoopChallenge(), second=createHoopChallenge()
  assert.notEqual(first.id,second.id)
  first.title='Título adaptado por el organizador';first.description='Instrucciones adaptadas';first.visible=false
  assert.notEqual(first.title,second.title);assert.notEqual(first.description,second.description);assert.equal(second.visible,true)
  config.challenges.push(first,second)
  const exported=exportProfile(config), loaded=parseProfile(JSON.parse(exported))
  assert.deepEqual(loaded.challenges,config.challenges)
  assert.equal(JSON.stringify(config.challenges[0]),original)
  assert(!exported.includes('winner'));assert(!exported.includes('imageView'));assert(!exported.includes('data:image'))
  assert.equal(loaded.challenges[2].imageFilename,'aro-del-dragon-unido.png')
})
