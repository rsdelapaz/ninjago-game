import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, h, nextTick, ref } from 'vue'
import { confirmations } from '../src/confirmation.ts'

test('actual finale reset confirmation rejects unmounted controls, changed progress and stale presentation revision', async () => {
  const { descriptor } = parse(readFileSync(new URL('../src/FinaleControls.vue', import.meta.url), 'utf8'))
  const compiled = compileScript(descriptor, { id: 'finale-controls-test', inlineTemplate: true, templateOptions: { compilerOptions: { hoistStatic: false } } }).content
  const js = ts.transpileModule(compiled, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/from ['"]vue['"]/g, `from '${import.meta.resolve('vue')}'`)
    .replace(/from ['"]\.\/(confirmation|finale|finaleNarrative)['"]/g,(_,name)=>`from '${new URL('../src/'+name+'.ts',import.meta.url).href}'`)
    .replace(/import FinaleWordBoard from ['"]\.\/FinaleWordBoard\.vue['"]/, 'const FinaleWordBoard = { render: () => null }')
  const Controls = (await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))).default
  const node = tag => ({ tag, children: [], props: {} })
  const renderer = createRenderer({
    createElement: node, createText: text => ({ ...node('text'), text }), createComment: text => ({ ...node('comment'), text }),
    insert(child, parent, anchor) { if (child.parent) child.parent.children = child.parent.children.filter(value => value !== child); const index = anchor ? parent.children.indexOf(anchor) : -1; if (index < 0) parent.children.push(child); else parent.children.splice(index, 0, child); child.parent = parent },
    remove(child) { if (child?.parent) child.parent.children = child.parent.children.filter(value => value !== child) },
    patchProp(el, key, old, value) { el.props[key] = value }, setText(el, text) { el.text = text }, setElementText(el, text) { el.text = text },
    parentNode: el => el?.parent, nextSibling: el => el?.parent?.children[el.parent.children.indexOf(el) + 1] || null,
  })
  const all = n => [n, ...n.children.flatMap(all)]
  for (const scenario of ['accepted', 'progress-changed', 'revision-changed', 'unmounted']) {
    const root = node('root'), actions = []
    const progress = ref({ runId: 'completed-synthetic', status: 'success', signature: 'config-synthetic', sound: false }), revision = ref(10)
    const app = renderer.createApp({ render: () => h(Controls, { progress: progress.value, revision: revision.value, disabled: false, publicReady: true, onAction: action => actions.push(action) }) })
    let mounted = true
    try {
      app.mount(root); await nextTick()
      const button = all(root).find(el => el.tag === 'button' && el.text?.includes('RESTABLECER ESCENA'))
      assert(button, scenario + ': reset action is present')
      const pending = button.props.onClick()
      assert(confirmations.request.value, scenario + ': confirmation must be explicit')
      if (scenario === 'progress-changed') progress.value = { ...progress.value, sound: true }
      if (scenario === 'revision-changed') revision.value++
      if (scenario === 'unmounted') { app.unmount(); mounted = false }
      await nextTick(); await confirmations.accept(); await pending; await nextTick()
      assert.deepEqual(actions, scenario === 'accepted' ? [{ type: 'reset' }] : [], scenario)
    } finally { if (mounted) app.unmount(); confirmations.cancel() }
  }
})
