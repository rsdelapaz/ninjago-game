import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, h, reactive, nextTick } from 'vue'
import { createProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'

test('actual generic public template renders full content, missing-image fallback and explicit winner without controls',async()=>{
  const file=new URL('../src/ChallengeStage.vue',import.meta.url)
  const {descriptor}=parse(readFileSync(file,'utf8'))
  const compiled=compileScript(descriptor,{id:'stage-test',inlineTemplate:true,templateOptions:{compilerOptions:{hoistStatic:false}}}).content
  const js=ts.transpileModule(compiled,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    .replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/challenges['"]/g,`from '${new URL('../src/challenges.ts',import.meta.url).href}'`)
    .replace(/import MonasteryBackdrop from [^\n]+\n/, 'const MonasteryBackdrop = {render:()=>null};\n')
    .replaceAll('import.meta.env.BASE_URL',"'./'")
  const Stage=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const node=tag=>({tag,children:[],props:{},focus(){this.focused=true}})
  const renderer=createRenderer({createElement:node,createText:text=>({...node('text'),text}),createComment:text=>({...node('comment'),text}),insert(child,parent,anchor){if(child.parent)child.parent.children=child.parent.children.filter(c=>c!==child);const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(child);else parent.children.splice(i,0,child);child.parent=parent},remove(child){if(child?.parent)child.parent.children=child.parent.children.filter(c=>c!==child)},patchProp(el,key,old,value){el.props[key]=value},setText(el,text){el.text=text},setElementText(el,text){el.text=text},parentNode:el=>el?.parent,nextSibling:el=>el?.parent?.children[el.parent.children.indexOf(el)+1]||null})
  const config=createProfile('colegio'), challenge=newChallenge();challenge.title='Título completo '+ 'largo '.repeat(20);challenge.description='Descripción de ensayo\n'+'extensa '.repeat(200);challenge.imageFilename='ausente.png';config.teams[0].name='Dragones de prueba'
  const state=reactive({winner:undefined,preview:false}), root=node('root')
  const app=renderer.createApp({render:()=>h(Stage,{config,challenge,number:2,...state})})
  const all=n=>[n,...n.children.flatMap(all)], text=n=>all(n).map(e=>e.text||'').join(' ')
  try {
    app.mount(root);await nextTick()
    assert(text(root).includes(challenge.title));assert(text(root).includes(challenge.description));assert(text(root).includes('PRUEBA 02'))
    assert(!all(root).some(e=>['button','input','textarea'].includes(e.tag)))
    const image=all(root).find(e=>e.tag==='img');assert.equal(image.props.src,'./private-media/colegio/ausente.png')
    image.props.onError();await nextTick()
    assert(!all(root).some(e=>e.tag==='img'));assert(all(root).some(e=>e.tag==='svg'&&e.props.role==='img'))
    assert(!text(root).includes('No se encuentra'))
    state.preview=true;await nextTick();assert(text(root).includes('No se encuentra la imagen'))
    state.preview=false;state.winner=config.teams[0].id;await nextTick();await nextTick()
    assert(text(root).includes('Dragones de prueba'));assert(text(root).includes('¡EQUIPO GANADOR!'));assert(all(root).find(e=>e.tag==='h1').focused)
    state.winner=undefined;await nextTick();assert(text(root).includes(challenge.description));assert(!text(root).includes('¡EQUIPO GANADOR!'))
  } finally { app.unmount() }
})
