import { createApp } from 'vue'

// Resolve the root before importing game code. The enigma never initializes App.
// https://vuejs.org/api/application.html#createapp
async function mountScreen() {
  if (new URLSearchParams(location.search).get('screen') === 'enigma') {
    const { default: EnigmaStage } = await import('./EnigmaStage.vue')
    createApp(EnigmaStage).mount('#app')
  } else {
    const { default: App } = await import('./App.vue')
    await import('./style.css')
    createApp(App).mount('#app')
  }
}
void mountScreen().catch(() => {
  const target = document.getElementById('app')
  if (target) target.textContent = 'No se pudo cargar la pantalla. Comprueba el servidor local y recarga la página.'
})
