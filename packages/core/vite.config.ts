import { defineConfig } from 'vite'
import { baseBuildConfig, defaultPlugins } from '../../vite.base.config'

export default defineConfig({
  plugins: [...defaultPlugins],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      'vue': '../node_modules/vue/dist/vue.runtime.esm-browser.js',
      'vue-demi': '../node_modules/vue-demi/lib/v3/index.mjs'
    }
  },
  ...baseBuildConfig
})
