import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readEnigmaSecret, normalizeEnigma, isEnigmaCorrect, prepareEnigmaText, enigmaRevealMs } from '../src/enigma.ts'

test('enigma reads only a fragment word, supports encoded expressions and never hardcodes an answer',()=>{
  for(const text of ['amistad','PODER NINJA','Árbol del dragón','Ñandú','ÜLTIMA','sol','a'.repeat(48)]) {
    const secret=readEnigmaSecret('#palabra='+encodeURIComponent(text))
    assert.equal(secret.ok,true);assert.equal(secret.answer,text.toLocaleUpperCase('es'))
    assert.equal(isEnigmaCorrect(text,secret),true)
  }
  assert.equal(readEnigmaSecret('#palabra=PODER+NINJA').answer,'PODER NINJA')
  assert.equal(readEnigmaSecret('#palabra=%20%20poder%20%20%20ninja%20').answer,'PODER NINJA')
  assert.equal(readEnigmaSecret('?palabra=sol').ok,false)
})

test('enigma rejects missing, malformed, duplicated, unsafe or excessive URL content without echoing it',()=>{
  for(const hash of ['', '#', '#otra=sol', '#palabra=', '#palabra=%', '#palabra=%FF', '#palabra=%E0%A4%A', '#palabra=sol&palabra=luna', '#palabra=<script>alert(1)</script>', '#palabra=123', '#palabra=si/no', '#palabra=niño%0A', '#palabra='+ 'a'.repeat(49), '#palabra='+ ' '.repeat(257), '#'+ 'x'.repeat(1024)]) {
    const secret=readEnigmaSecret(hash);assert.equal(secret.ok,false,hash);assert(!secret.error.includes('<script>'))
  }
})

test('comparison folds case, redundant spaces and vocal accents but keeps Ñ distinct from N',()=>{
  assert.equal(normalizeEnigma('  ÁrBOL   DEl  pingüino '),'ARBOL DEL PINGUINO')
  assert.equal(normalizeEnigma('nin\u0303o'),'NIÑO')
  assert.equal(isEnigmaCorrect('NINO',readEnigmaSecret('#palabra=NI%C3%91O')),false)
  assert.equal(isEnigmaCorrect('niño',readEnigmaSecret('#palabra=NI%C3%91O')),true)
  assert.equal(isEnigmaCorrect('ARBOL',readEnigmaSecret('#palabra=%C3%81RBOL')),true)
  assert.equal(isEnigmaCorrect('PODER    NINJA',readEnigmaSecret('#palabra=Poder%20Ninja')),true)
  assert.equal(isEnigmaCorrect('PODERNINJA',readEnigmaSecret('#palabra=Poder%20Ninja')),false)
  assert.equal(isEnigmaCorrect('otra',readEnigmaSecret('#palabra=sol')),false)
  assert.equal(isEnigmaCorrect('sol',readEnigmaSecret('#')),false)
  assert.equal(prepareEnigmaText('a'.repeat(49)),null)
  assert(enigmaRevealMs(48)<3000)
})
