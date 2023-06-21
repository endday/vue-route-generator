import { defineConfig, mergeConfig } from 'vite'
import baseBuildConfig from '../../vite.base.config'

export default mergeConfig(
  baseBuildConfig,
  defineConfig({
    server: {
      port: 3000
    }
  })
)


