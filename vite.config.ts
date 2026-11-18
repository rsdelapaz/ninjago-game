import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative assets for local HTTP serving: https://vite.dev/config/shared-options.html#base
export default defineConfig({
  plugins: [vue()],
  base: './',
  // Browser rehearsal profiles/captures are not source and may contain locked files.
  server: { watch: { ignored: ['**/.preview.local/**'] } },
})
