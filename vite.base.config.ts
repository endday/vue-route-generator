/// <reference types="vitest" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

const outputName = 'index'

// https://vitejs.dev/config/
export const baseBuildConfig = defineConfig({
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      name: 'index',
      fileName: (format) => `${outputName}.${format}.js`
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
        '@auto-route/core',
        '@auto-route/webpack-plugin'
      ]
    }
  },
  plugins: [
    dts({
      tsConfigFilePath: resolve(__dirname, './tsconfig.json'),
      skipDiagnostics: false,
      logDiagnostics: true,
      insertTypesEntry: true
    })
  ],
  optimizeDeps: {
    exclude: ['vue-demi', 'vue', 'vue2']
  },
  test: {
    globals: true,
    // root: path.resolve(__dirname, '../../packages/sell-ui/components'),
    environment: 'jsdom',
    include: ['**/__tests__/**/*.spec.ts']
  }
})
