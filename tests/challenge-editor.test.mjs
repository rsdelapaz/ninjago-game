import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'

async function component(name) {
  const { descriptor } = parse(readFileSync(new URL(`../src/${name}.vue`, import.meta.url), 'utf8'))
  const script = compileScript(descriptor, { id: `${name}-test`, inlineTemplate: true }).content
  const js = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/import (\w+) from ['"][^'"]+\.vue['"];?/g, 'const $1={render:()=>null};')
    .replace(/from ['"]vue['"]/g, `from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/(\w+)['"]/g, (_, file) => `from '${new URL(`../src/${file}.ts`, import.meta.url).href}'`)
  return (await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))).default
}

test('generic editor distinguishes public copy, complete organizer script and unpublished draft without modifying definitions', async () => {
  const Editor = await component('ChallengeEditor')
  const config = createProfile('colegio'), challenge = newChallenge()
  challenge.title = 'Una prueba preparada por el organizador'
  challenge.description = 'Instrucciones heredadas completas: preparar, arbitrar y recoger.'
  config.challenges = [challenge]
  const before = JSON.stringify(config)
  const html = await renderToString(createSSRApp({ render: () => h(Editor, { config, results: {}, dirty: true }) }))
  assert(html.includes('Instrucción para los niños'))
  assert(html.includes('Regla importante'))
  assert(html.includes('Instrucciones para el organizador'))
  assert(html.includes(challenge.description))
  assert(html.includes('Falta instrucción pública'))
  assert(html.includes('Pendiente de preparar'))
  assert(html.includes('Borrador sin guardar'))
  assert(html.includes('Vista previa del borrador'))
  assert(!html.includes('Añadir prueba del aro'))
  assert.match(html, /<button disabled[^>]*>Ir al control de presentación/)
  assert.equal(JSON.stringify(config), before)
})

test('presentation controls retain full private organizer instructions alongside independent manual result actions', async () => {
  const Controls = await component('ChallengeControls')
  const config = createProfile('urbanizacion'), challenge = newChallenge()
  challenge.description = 'Solo organizador: montaje y criterios para adjudicar el resultado.'
  config.challenges = [challenge]
  const html = await renderToString(createSSRApp({ render: () => h(Controls, {
    config, challengeId: challenge.id, winner: null, version: null, disabled: false,
    imageExpanded: false, showingWinner: false, saveResult: async () => true,
  }) }))
  assert(html.includes(challenge.description))
  assert(html.includes('Guion del organizador'))
  assert(html.includes('aún no tiene instrucción pública breve'))
  assert(html.includes('guardar no anuncia nada'))
  assert(html.includes('Anunciar ganador al público'))
})