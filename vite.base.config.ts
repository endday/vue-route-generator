/// <reference types="vitest" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { getExternals } from './scripts/util'
import { builtinModules } from 'module'

const outputName = 'index'

// https://vitejs.dev/config/
export default defineConfig({
  ssr: {
    external: builtinModules
  },
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      name: 'index',
      fileName: (format) => `${outputName}.${format}.js`
    },
    rollupOptions: {
      external: [...getExternals(), ...builtinModules]
    }
  },
  resolve: {
    alias: {
      '@auto-route/core': resolve(__dirname, './packages/core/src/index.ts'),
    }
  },
  plugins: [
    dts({
      tsConfigFilePath: resolve(__dirname, './tsconfig.json'),
      skipDiagnostics: true,
      logDiagnostics: true,
      outputDir: './types',
      exclude: ['node_modules/**', './types']
    })
  ],
  optimizeDeps: {
    exclude: ['vue-demi', 'vue', 'vue2']
  },
  test: {
    globals: true,
    // root: path.resolve(__dirname, '../../packages/sell-ui/components'),
    environment: 'jsdom',
    watch: false,
    include: ['**/__tests__/**/*.spec.ts'],
    testTimeout: 10000,
    deps: {
      external: ['**/node_modules/**', '**/dist/**', ...getExternals()]
    }
  }
})
