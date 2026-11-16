import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, createSSRApp, h, reactive, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'

test('actual generic public template renders full content, missing-image fallback and explicit winner without controls',async()=>{
  const file=new URL('../src/ChallengeStage.vue',import.meta.url)
  const {descriptor}=parse(readFileSync(file,'utf8'))
  const compiled=compileScript(descriptor,{id:'stage-test',inlineTemplate:true,templateOptions:{compilerOptions:{hoistStatic:false}}}).content
  const js=ts.transpileModule(compiled,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    .replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/challenges['"]/g,`from '${new URL('../src/challenges.ts',import.meta.url).href}'`)
    .replace(/import SkyMonastery from [^\n]+\n/, 'const SkyMonastery = {render:()=>null};\n')
    .replace(/import ['"].*challenge-sky\.css['"];?\r?\n/g, '')
    .replaceAll('import.meta.env.BASE_URL',"'./'")
  const Stage=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const node=tag=>({tag,children:[],props:{},focus(){this.focused=true}})
  const renderer=createRenderer({createElement:node,createText:text=>({...node('text'),text}),createComment:text=>({...node('comment'),text}),insert(child,parent,anchor){if(child.parent)child.parent.children=child.parent.children.filter(c=>c!==child);const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(child);else parent.children.splice(i,0,child);child.parent=parent},remove(child){if(child?.parent)child.parent.children=child.parent.children.filter(c=>c!==child)},patchProp(el,key,old,value){el.props[key]=value},setText(el,text){el.text=text},setElementText(el,text){el.text=text},parentNode:el=>el?.parent,nextSibling:el=>el?.parent?.children[el.parent.children.indexOf(el)+1]||null})
  const config=createProfile('colegio'), challenge=newChallenge();challenge.title='Título completo '+ 'largo '.repeat(20);challenge.description='Descripción de ensayo\n'+'extensa '.repeat(200);challenge.publicInstruction='Pasad el aro del primer ninja al último.';challenge.keyRule='No soltéis las manos.';challenge.imageFilename='ausente.png';config.teams[0].name='Dragones de prueba'
  const state=reactive({winner:undefined,preview:false,expanded:false}), root=node('root')
  const before=JSON.stringify({config,challenge})
  const app=renderer.createApp({render:()=>h(Stage,{config,challenge,number:2,...state})})
  const all=n=>[n,...n.children.flatMap(all)], text=n=>all(n).map(e=>e.text||'').join(' ')
  try {
    app.mount(root);await nextTick()
    assert(text(root).includes(challenge.title));assert(!text(root).includes(challenge.description));assert(text(root).includes(challenge.publicInstruction));assert(text(root).includes(challenge.keyRule));assert(text(root).includes('PRUEBA 02'));assert(text(root).includes('MISIÓN DE EQUIPO'))
    assert(!all(root).some(e=>['button','input','textarea'].includes(e.tag)))
    const background=all(root).find(e=>e.tag==='img'&&e.props.class==='sky-art')
    assert.equal(background.props.src,'./private-media/la-llamada-del-cielo.png')
    assert(!all(root).some(e=>e.tag==='svg'&&e.props.class==='sky-monastery'))
    const image=all(root).find(e=>e.tag==='img'&&e!==background);assert.equal(image.props.src,'./private-media/colegio/ausente.png')
    image.props.onLoad({target:{naturalWidth:600,naturalHeight:900}});await nextTick()
    assert(all(root).some(e=>String(e.props.class).includes('projection-portrait')))
    image.props.onLoad({target:{naturalWidth:900,naturalHeight:900}});await nextTick()
    assert(all(root).some(e=>String(e.props.class).includes('projection-portrait')))
    image.props.onLoad({target:{naturalWidth:1600,naturalHeight:900}});await nextTick()
    assert(!all(root).some(e=>String(e.props.class).includes('projection-portrait')))
    state.expanded=true;await nextTick();assert(all(root).find(e=>e.tag==='section').props.class.includes('image-expanded'))
    assert.equal(all(root).find(e=>e.tag==='img'&&e!==background).props.src,image.props.src)
    state.expanded=false;await nextTick()
    image.props.onError();await nextTick()
    assert(all(root).some(e=>String(e.props.class).includes('projection-emblem')))
    assert(!all(root).some(e=>e.tag==='img'&&e!==background));assert(all(root).some(e=>e.tag==='svg'&&e.props.role==='img'))
    assert(!text(root).includes('No se encuentra'))
    state.preview=true;await nextTick();assert(text(root).includes('No se encuentra la imagen'))
    background.props.onError();await nextTick()
    assert(all(root).find(e=>e.tag==='section').props.class.includes('sky-fallback'))
    assert(!all(root).some(e=>e.tag==='img'&&e.props.class==='sky-art'))
    assert(text(root).includes('No se encuentra el fondo cinematográfico'))
    state.preview=false;state.winner=config.teams[0].id;await nextTick();await nextTick()
    assert(text(root).includes('Dragones de prueba'));assert(text(root).includes('¡EQUIPO GANADOR!'));assert(all(root).find(e=>e.tag==='h1').focused)
    state.winner=undefined;await nextTick();assert(!text(root).includes(challenge.description));assert(text(root).includes(challenge.publicInstruction));assert(text(root).includes(challenge.keyRule));assert(!text(root).includes('¡EQUIPO GANADOR!'))
    assert.equal(JSON.stringify({config,challenge}),before)
    const legacy={...challenge,publicInstruction:'',keyRule:''}
    const legacyHtml=await renderToString(createSSRApp({render:()=>h(Stage,{config,challenge:legacy,number:1,preview:true})}))
    assert(legacyHtml.includes('Escuchad al organizador'));assert(legacyHtml.includes('Falta preparar'));assert(!legacyHtml.includes(challenge.description))
    const other={...newChallenge(),title:'Otra misión',publicInstruction:'Á'.repeat(120),keyRule:'Ñ'.repeat(100),description:'Solo para organizar'}
    const otherHtml=await renderToString(createSSRApp({render:()=>h(Stage,{config,challenge:other,number:3})}))
    assert(otherHtml.includes(other.title));assert(otherHtml.includes(other.publicInstruction));assert(otherHtml.includes(other.keyRule))
    assert(!otherHtml.includes(other.description));assert(!otherHtml.includes(challenge.publicInstruction))
    assert(otherHtml.includes('EL SECRETO DEL MAESTRO WU'));assert(otherHtml.includes('JUNTOS, EL CIELO ES SOLO EL PRINCIPIO'))
    const nestedJs=js.replaceAll("'./'","'/evento/'")
    const Nested=(await import('data:text/javascript;base64,'+Buffer.from(nestedJs).toString('base64'))).default
    const nestedHtml=await renderToString(createSSRApp({render:()=>h(Nested,{config,challenge,number:2,preview:true})}))
    assert(nestedHtml.includes('src="/evento/private-media/la-llamada-del-cielo.png"'))
    assert(nestedHtml.includes('src="/evento/private-media/colegio/ausente.png"'))
  } finally { app.unmount() }
})

test('original monastery keeps both varied clans with team colors and unique paint IDs in repeated previews',async()=>{
  const {descriptor}=parse(readFileSync(new URL('../src/SkyMonastery.vue',import.meta.url),'utf8'))
  const script=compileScript(descriptor,{id:'monastery-test',inlineTemplate:true}).content
  const js=ts.transpileModule(script,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
  const Scene=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const config=createProfile('colegio');config.teams[0].color='#e34b42';config.teams[1].color='#2787c3'
  const html=await renderToString(createSSRApp({render:()=>h('div',[h(Scene,{teams:config.teams,winner:config.teams[0].id}),h(Scene,{teams:config.teams})])}))
  assert.equal((html.match(/class="watching-clan/g)||[]).length,4)
  assert.equal((html.match(/celebrating-clan/g)||[]).length,1)
  assert(html.includes('#e34b42'));assert(html.includes('#2787c3'))
  const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length)
})
