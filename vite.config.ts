import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative assets for local HTTP serving: https://vite.dev/config/shared-options.html#base
export default defineConfig({ plugins: [vue()], base: './' })
