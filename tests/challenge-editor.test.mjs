import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, createSSRApp, h, reactive, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'
import { confirmations } from '../src/confirmation.ts'

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
  assert(html.includes('Incluir en el recorrido'));assert(html.includes('Incluida'))
  assert(html.indexOf('Incluir en el recorrido') < html.indexOf('<details'))
  assert(!html.includes('Organizar esta prueba'))
  assert.match(html, /<button disabled[^>]*>Ir al control de presentación/)
  assert.equal(JSON.stringify(config), before)
  challenge.publicInstruction='Instrucción '.repeat(10)
  const longBefore=JSON.stringify(config)
  const longHtml=await renderToString(createSSRApp({render:()=>h(Editor,{config,results:{},dirty:true})}))
  assert(longHtml.includes('Hay bastante texto para leer desde lejos'))
  assert.equal(JSON.stringify(config),longBefore)
})

test('persistent inclusion checkbox confirms removal, cancels safely and rejects a changed selection', async () => {
  const Editor=await component('ChallengeEditor'), config=reactive(createProfile('colegio'))
  config.challenges=[newChallenge(),newChallenge()];config.challenges[1].title='Segunda misión'
  const node=tag=>({tag,children:[],props:{},focus(){},addEventListener(){},removeEventListener(){},getRootNode(){return {activeElement:null}}})
  const renderer=createRenderer({createElement:node,createText:text=>({...node('text'),text}),createComment:text=>({...node('comment'),text}),insert(child,parent,anchor){if(child.parent)child.parent.children=child.parent.children.filter(c=>c!==child);const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(child);else parent.children.splice(i,0,child);child.parent=parent},remove(child){if(child?.parent)child.parent.children=child.parent.children.filter(c=>c!==child)},patchProp(el,key,old,value){el.props[key]=value},setText(el,text){el.text=text},setElementText(el,text){el.text=text},parentNode:el=>el?.parent,nextSibling:el=>el?.parent?.children[el.parent.children.indexOf(el)+1]||null})
  const root=node('root'), emitted=[]
  const previousDocument=globalThis.Document, previousShadowRoot=globalThis.ShadowRoot
  globalThis.Document=class {};globalThis.ShadowRoot=class {}
  const app=renderer.createApp({render:()=>h(Editor,{config,results:{},dirty:true,onPresent:id=>emitted.push(id)})})
  const all=n=>[n,...n.children.flatMap(all)], text=n=>all(n).map(e=>e.text||'').join(' ')
  const checkbox=()=>all(root).find(n=>n.tag==='input'&&n.props.type==='checkbox')
  try {
    app.mount(root);await nextTick()
    const input={checked:false}, cancel=checkbox().props.onChange({target:input})
    assert.equal(input.checked,true);assert.equal(config.challenges[0].visible,true)
    assert(confirmations.request.value.explanation.includes('al guardar'))
    confirmations.cancel();await cancel;await nextTick();assert.equal(config.challenges[0].visible,true)
    const remove=checkbox().props.onChange({target:{checked:false}})
    await confirmations.accept();await remove;await nextTick()
    assert.equal(config.challenges[0].visible,false);assert(text(root).includes('Fuera del recorrido'))
    await checkbox().props.onChange({target:{checked:true}});await nextTick()
    assert.equal(config.challenges[0].visible,true);assert.equal(confirmations.request.value,null)
    const stale=checkbox().props.onChange({target:{checked:false}})
    const second=all(root).find(n=>n.tag==='button'&&text(n).includes('Segunda misión'))
    await second.props.onClick();await confirmations.accept();await stale;await nextTick()
    assert.equal(config.challenges[0].visible,true);assert.equal(config.challenges[1].visible,true)
    assert.deepEqual(emitted,[])
  } finally {
    confirmations.cancel();app.unmount()
    if(previousDocument===undefined)delete globalThis.Document;else globalThis.Document=previousDocument
    if(previousShadowRoot===undefined)delete globalThis.ShadowRoot;else globalThis.ShadowRoot=previousShadowRoot
  }
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
