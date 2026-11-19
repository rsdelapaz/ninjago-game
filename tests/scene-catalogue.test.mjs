import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ref, nextTick, effectScope, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { useSceneCatalogue } from '../src/useSceneCatalogue.ts'
import { createProfile, exportProfile } from '../src/profile.ts'
import { newChallenge } from '../src/challenges.ts'
import { scenesFor, adjacentScene, sceneByNumber } from '../src/scenes.ts'
import { createCeremony } from '../src/ceremony.ts'
import { createReveal } from '../src/reveal.ts'

test('preview never changes active scene and follows confirmed navigation, profile changes and retired scenes',async()=>{
  const c=createProfile('colegio');c.challenges=[newChallenge(),newChallenge()]
  const config=ref(c), activeId=ref('intro'), requestedPreview=ref(''), scope=effectScope()
  const catalogue=scope.run(()=>useSceneCatalogue(()=>({config:config.value,activeId:activeId.value,requestedPreview:requestedPreview.value})))
  const before=exportProfile(c)
  try {
    catalogue.selectPreview(`challenge:${c.challenges[0].id}`)
    assert.equal(catalogue.active.value.id,'intro');assert.equal(catalogue.preview.value.type,'challenge')
    activeId.value=adjacentScene('intro',1,c).id;await nextTick();assert.equal(catalogue.previewId.value,'ceremony')
    activeId.value=sceneByNumber(4,c).id;await nextTick();assert.equal(catalogue.previewId.value,activeId.value)
    requestedPreview.value=sceneByNumber(5,c).id;await nextTick();assert.notEqual(catalogue.previewId.value,activeId.value)
    activeId.value=adjacentScene(activeId.value,1,c).id;await nextTick();assert.equal(catalogue.previewId.value,activeId.value)
    config.value.challenges[1].visible=false;activeId.value='intro';await nextTick();assert.equal(catalogue.preview.value.id,'intro')
    catalogue.selectPreview('missing');assert.equal(catalogue.preview.value.id,'intro')
    config.value=createProfile('urbanizacion');await nextTick();assert.equal(catalogue.active.value.id,'intro');assert.equal(catalogue.preview.value.id,'intro')
    assert.equal(config.value.challenges.length,0)
    // Only the deliberate fixture visibility edit changed the original configuration.
    c.challenges[1].visible=true;assert.equal(exportProfile(c),before)
  } finally {scope.stop()}
})

test('actual catalogue markup highlights active separately from preview and never claims an unconfirmed public display',async()=>{
  const file=new URL('../src/SceneController.vue',import.meta.url)
  const {descriptor}=parse(readFileSync(file,'utf8'))
  const script=compileScript(descriptor,{id:'catalogue-test',inlineTemplate:true}).content
  let js=ts.transpileModule(script,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
  js=js.replace(/import (\w+) from ['"][^'"]+\.vue['"];?/g,'const $1={render:()=>null};')
    .replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/(\w+)['"]/g,(_,name)=>`from '${new URL(`../src/${name}.ts`,import.meta.url).href}'`)
  const Component=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const config=createProfile('colegio');config.challenges=[newChallenge()]
  const scene=scenesFor(config)[0], requestedPreview=scenesFor(config)[3].id
  const base={scene,config,ceremony:createCeremony(config.id),reveal:createReveal(0),disabled:false,results:{},resultsVersion:null,saveResult:async()=>true,requestedPreview,imageExpanded:false,showingWinner:false}
  for(const publicReady of [false,true]){
    const html=await renderToString(createSSRApp({render:()=>h(Component,{...base,publicReady})}))
    const cards=[...html.matchAll(/<button[^>]*class="scene-card[^>]*>[\s\S]*?<\/button>/g)].map(m=>m[0])
    assert.equal(cards.length,6)
    assert.match(cards[0],/is-active/);assert.match(cards[0],/aria-current="step"/)
    assert.match(cards[3],/is-preview/);assert(!cards[3].includes('aria-current'));assert(!cards[3].includes('is-active'))
    assert(cards[3].includes('Vista previa'))
    if(publicReady)assert(cards[0].includes('En pantalla'));else {assert(!cards[0].includes('En pantalla'));assert(cards[0].includes('sin confirmar'))}
  }
})
