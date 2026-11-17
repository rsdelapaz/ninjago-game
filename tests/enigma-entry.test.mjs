import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const data=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64')
test('actual main entry imports only its chosen root: enigma is isolated and admin/public keep App',async()=>{
  const keys=['location','document','__enigmaEntryProbe'],saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]))
  try {
    for(const [i,search] of ['?screen=enigma','?screen=admin','','?screen=unknown'].entries()){
      let done,fail
      const mounted=new Promise((resolve,reject)=>{done=resolve;fail=reject})
      const probe={imports:[],mounted:null,selector:null,done}
      Object.defineProperty(globalThis,'__enigmaEntryProbe',{configurable:true,value:probe})
      Object.defineProperty(globalThis,'location',{configurable:true,value:{search}})
      Object.defineProperty(globalThis,'document',{configurable:true,value:{getElementById(){return {set textContent(message){fail(Error(message))}}}}})
      const vue=data(`export function createApp(component){return {mount(selector){const p=globalThis.__enigmaEntryProbe;p.mounted=component.id;p.selector=selector;p.done()}}}`)
      const enigma=data(`globalThis.__enigmaEntryProbe.imports.push('enigma');export default {id:'enigma-${i}'};`)
      const app=data(`globalThis.__enigmaEntryProbe.imports.push('game');export default {id:'game-${i}'};`)
      const css=data(`globalThis.__enigmaEntryProbe.imports.push('game-css');export const id=${i};`)
      const js=ts.transpileModule(readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
        .replace(/from ['"]vue['"]/g,`from '${vue}'`)
        .replace(/import\(['"]\.\/EnigmaStage.vue['"]\)/g,`import('${enigma}')`)
        .replace(/import\(['"]\.\/App.vue['"]\)/g,`import('${app}')`)
        .replace(/import\(['"]\.\/style.css['"]\)/g,`import('${css}')`)
      await import(data(js));await mounted
      assert.equal(probe.selector,'#app')
      assert.deepEqual(probe.imports,search==='?screen=enigma'?['enigma']:['game','game-css'])
      assert.equal(probe.mounted,`${search==='?screen=enigma'?'enigma':'game'}-${i}`)
    }
  } finally {for(const [key,descriptor] of Object.entries(saved)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}}
})
