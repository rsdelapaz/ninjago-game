import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, nextTick } from 'vue'
import { confirmations } from '../src/confirmation.ts'

// Compile the real SFC with the project's existing Vue/TypeScript compilers.
// The renderer exercises handlers and focus hooks, not a browser's native focus trap.
test('actual dialog opens modally, cancels via Escape, restores focus and accepts only once',async()=>{
  const file=new URL('../src/ConfirmationDialog.vue',import.meta.url)
  const {descriptor}=parse(readFileSync(file,'utf8'))
  const compiled=compileScript(descriptor,{id:'dialog-test',inlineTemplate:true,templateOptions:{compilerOptions:{hoistStatic:false}}}).content
  const js=ts.transpileModule(compiled,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    .replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/confirmation['"]/g,`from '${new URL('../src/confirmation.ts',import.meta.url).href}'`)
  const Component=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const saved=Object.fromEntries(['document','HTMLElement'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  const doc={activeElement:null}
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.props={};this.open=false;this.modalCalls=0}
    focus(){doc.activeElement=this}showModal(){this.open=true;this.modalCalls++}close(){this.open=false}
  }
  Object.defineProperty(globalThis,'document',{configurable:true,value:doc})
  Object.defineProperty(globalThis,'HTMLElement',{configurable:true,value:Element})
  const renderer=createRenderer({createElement:tag=>new Element(tag),createText:text=>({text}),createComment:text=>({text}),insert(child,parent,anchor){if(child.parent)child.parent.children=child.parent.children.filter(c=>c!==child);const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(child);else parent.children.splice(i,0,child);child.parent=parent},remove(child){if(child?.parent)child.parent.children=child.parent.children.filter(c=>c!==child)},patchProp(el,key,old,value){el.props[key]=value},setText(el,text){el.text=text},setElementText(el,text){el.text=text},parentNode:el=>el?.parent,nextSibling:el=>el?.parent?.children[el.parent.children.indexOf(el)+1]||null})
  const root=new Element('root'),origin=new Element('origin');origin.focus()
  const app=renderer.createApp(Component)
  function elements(node){return [node,...(node.children||[]).flatMap(elements)]}
  try {
    app.mount(root)
    const cancelled=confirmations.ask({title:'Eliminar prueba',explanation:'Se perderá el resultado',destructive:true})
    await nextTick();await nextTick()
    const dialog=elements(root).find(e=>e.tag==='dialog')
    assert.equal(dialog.open,true);assert.equal(dialog.modalCalls,1);assert.equal(doc.activeElement.text,'Cancelar')
    let prevented=false;dialog.props.onCancel({preventDefault(){prevented=true}})
    assert.equal(await cancelled,false);await nextTick();assert.equal(prevented,true);assert.equal(dialog.open,false);assert.equal(doc.activeElement,origin)
    let calls=0
    const accepted=confirmations.ask({title:'Guardar',explanation:'Confirmar',actionLabel:'Guardar'},()=>{calls++})
    await nextTick();await nextTick()
    const action=elements(root).find(e=>e.tag==='button'&&e.text==='Guardar')
    action.props.onClick();action.props.onClick();assert.equal(await accepted,true);await nextTick()
    assert.equal(calls,1);assert.equal(doc.activeElement,origin)
    const viaButton=confirmations.ask({title:'Cancelar',explanation:'Sin cambios'})
    await nextTick();await nextTick()
    elements(root).find(e=>e.tag==='button'&&e.text==='Cancelar').props.onClick()
    assert.equal(await viaButton,false)
  } finally {
    app.unmount();confirmations.cancel()
    for(const [k,v] of Object.entries(saved)){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k]}
  }
})
