import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse,compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer,h,nextTick } from 'vue'

test('real enigma template hides the solution, handles form submission/retry/replay and supports long expressions accessibly',async()=>{
  const {descriptor}=parse(readFileSync(new URL('../src/EnigmaStage.vue',import.meta.url),'utf8'))
  const compiled=compileScript(descriptor,{id:'enigma-stage-test',inlineTemplate:true,templateOptions:{compilerOptions:{hoistStatic:false}}}).content
  const js=ts.transpileModule(compiled,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    .replace(/from ['"]vue['"]/g,`from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/(enigma|useEnigma)['"]/g,(_,file)=>`from '${new URL('../src/'+file+'.ts',import.meta.url).href}'`)
    .replace(/import ['"].*enigma\.css['"];?\r?\n/g,'')
    .replaceAll('import.meta.env.BASE_URL',"'./'")
  const Stage=(await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).default
  const keys=['window','document','Document','ShadowRoot','localStorage','BroadcastChannel','setTimeout','clearTimeout']
  const saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)])),timers=new Map(),listeners=new Map()
  let now=0,id=0
  const win={location:{hash:'#palabra=CIELO'},matchMedia(){return {matches:false,addEventListener(){},removeEventListener(){}}},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name){listeners.delete(name)}}
  const doc={title:'',fullscreenEnabled:false,addEventListener(){},removeEventListener(){}}
  const define=(key,value)=>Object.defineProperty(globalThis,key,{configurable:true,value})
  define('window',win);define('document',doc);define('Document',class {});define('ShadowRoot',class {})
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('Enigma touched storage')}})
  define('BroadcastChannel',class {constructor(){throw Error('Enigma opened game channel')}})
  define('setTimeout',(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id});define('clearTimeout',key=>timers.delete(key))
  const node=tag=>({tag,children:[],props:{},events:{},focus(){this.focused=true},addEventListener(name,fn){this.events[name]=fn},removeEventListener(){},getRootNode(){return doc}})
  const renderer=createRenderer({createElement:node,createText:text=>({...node('text'),text}),createComment:text=>({...node('comment'),text}),insert(child,parent,anchor){if(child.parent)child.parent.children=child.parent.children.filter(c=>c!==child);const i=anchor?parent.children.indexOf(anchor):-1;if(i<0)parent.children.push(child);else parent.children.splice(i,0,child);child.parent=parent},remove(child){if(child?.parent)child.parent.children=child.parent.children.filter(c=>c!==child)},patchProp(el,key,old,value){el.props[key]=value},setText(el,text){el.text=text},setElementText(el,text){el.text=text},parentNode:el=>el?.parent,nextSibling:el=>el?.parent?.children[el.parent.children.indexOf(el)+1]||null})
  const root=node('root'),all=n=>[n,...n.children.flatMap(all)],text=n=>all(n).map(e=>e.text||'').join(' ')
  const find=tag=>all(root).find(n=>n.tag===tag)
  function tick(ms){const end=now+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn()}now=end}
  async function propose(value){const input=find('input');input.value=value;input.events.input({target:input});await nextTick();find('form').props.onSubmit({preventDefault(){},stopPropagation(){}});await nextTick()}
  const app=renderer.createApp({render:()=>h(Stage)})
  try {
    app.mount(root);await nextTick()
    assert(!text(root).includes('CIELO'));assert(find('input').focused)
    assert(text(root).includes('EL ORÁCULO AGUARDA VUESTRA RESPUESTA'))
    assert.equal(find('img').props.src,'./private-media/enigma-sanctuary.png')
    find('img').props.onLoad();await nextTick();assert(find('main').props.class.includes('enigma-has-art'))
    find('img').props.onError();await nextTick();assert.equal(find('img'),undefined)
    assert(!find('main').props.class.includes('enigma-has-art'))
    await propose('nube');assert(!text(root).includes('CIELO'));assert.equal(find('form'),undefined)
    tick(2900);await nextTick();assert(text(root).includes('¡EL ENIGMA NO HA SIDO RESUELTO!'));assert(text(root).includes('EL ORÁCULO AÚN GUARDA SU SECRETO'));assert(!text(root).includes('CIELO'))
    assert(!all(root).some(n=>n.props.class?.includes('enigma-letter')))
    all(root).find(n=>n.tag==='button'&&text(n).includes('VOLVER A INTENTARLO')).props.onClick();await nextTick();await nextTick()
    assert(find('input').focused);await propose('cielo');tick(1550);await nextTick()
    assert(all(root).some(n=>n.props['aria-label']==='CIELO'))
    tick(10000);await nextTick();assert(text(root).includes('¡EL ENIGMA HA SIDO RESUELTO!'))
    assert(all(root).some(n=>n.props.role==='status'&&text(n).includes('CIELO')))
    all(root).find(n=>n.tag==='button'&&text(n).includes('Repetir revelación')).props.onClick();await nextTick();tick(10000);await nextTick()
    assert(text(root).includes('¡EL ENIGMA HA SIDO RESUELTO!'));assert.equal(timers.size,0)
    all(root).find(n=>n.tag==='button'&&text(n).includes('REINICIAR ENIGMA')).props.onClick();await nextTick();await nextTick()
    assert(find('input').focused);assert.equal(find('input').value,'');assert(!text(root).includes('CIELO'))
    await propose('cielo');tick(10000);await nextTick();assert(text(root).includes('¡EL ENIGMA HA SIDO RESUELTO!'))
    for(const answer of ['SOL','PODER NINJA','Á'.repeat(48)]){
      win.location.hash='#palabra='+encodeURIComponent(answer);listeners.get('hashchange')();await nextTick()
      assert(!all(root).some(n=>n.props['aria-label']===answer))
      await propose(answer);tick(10000);await nextTick()
      assert(all(root).some(n=>n.props['aria-label']===answer));assert.equal(timers.size,0)
    }
    win.location.hash='#palabra=%3Cscript%3E';listeners.get('hashchange')();await nextTick()
    assert(text(root).includes('El enlace no contiene una palabra válida'));assert.equal(find('form'),undefined)
    assert(!all(root).some(n=>n.tag==='script'));assert.equal(timers.size,0)
  } finally {
    app.unmount();assert.equal(timers.size,0)
    for(const [key,descriptor] of Object.entries(saved)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}
  }
})
