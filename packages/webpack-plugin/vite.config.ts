import { defineConfig, mergeConfig } from 'vite'
import { baseBuildConfig } from '../../vite.base.config'

export default mergeConfig(
  baseBuildConfig,
  defineConfig({
    server: {
      port: 3000
    },
    resolve: {
      alias: {
        'vue': '../node_modules/vue/dist/vue.runtime.esm-browser.js',
        'vue-demi': '../node_modules/vue-demi/lib/v3/index.mjs'
      }
    }
  })
)


