import { describe, expect, beforeEach, it } from 'vitest'
import * as path from 'path'
import * as fse from 'fs-extra'
import { webpack } from 'webpack'
import type { Compiler } from 'webpack'
import { Plugin } from '../src'
import { getExternals } from '../../../scripts/util'
import { builtinModules } from 'module'

const resolve = (p: string): string => path.resolve(__dirname, p)

const compiler = (plugin: Plugin): Compiler => {
  return webpack({
    mode: 'none',
    entry: resolve('./fixtures/fake-router.js'),
    output: {
      path: resolve('./fixtures/out'),
      filename: 'main.js'
    },
    resolve: {
      alias: {
        '@': resolve('./fixtures/')
      }
    },
    externals: [...getExternals(), ...builtinModules],
    plugins: [plugin]
  })
}

const matchOutputWithSnapshot = (path?: string) => {
  const out = fse.readFileSync(
    resolve(path || './fixtures/router.js'),
    'utf8'
  )
  expect(out).toMatchSnapshot()
}

const addPage = (p: string, content = '') => {
  const to = resolve(path.join('fixtures/pages', p))
  fse.outputFileSync(to, content)
}

const removePage = (p: string) => {
  const to = resolve(path.join('fixtures/pages', p))
  fse.removeSync(to)
}

describe('webpack plugin', () => {
  beforeEach(() => {
    fse.removeSync(resolve('../router.js'))

    // reset pages
    fse.removeSync(resolve('fixtures/pages'))
    addPage('index.vue')
    addPage('users/foo.vue')
    addPage('users/_id.vue')
  })

  it('imports dynamically created routes', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    compiler(plugin).run(() => {
      matchOutputWithSnapshot()
      done('done')
    })
  }))

  it('watches adding a page', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          addPage('users.vue')
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  }))

  it('watches changing route custom block data', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          addPage(
            'users/foo.vue',
            `
              <route>
              {
                "requiresAuth": true
              }
              </route>
            `
          )
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  }))

  it('watches removing a page', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      if (count === 1) {
        removePage('users/foo.vue')
      } else {
        matchOutputWithSnapshot()
        watching.close(done)
      }
    })
  }))

  it('does not fire compilation when the route does not changed', () => new Promise((done, fail) => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      if (count === 10) {
        fail('webpack watcher seems to go infinite loop')
      }
    })

    setTimeout(() => {
      watching.close(done)
    }, 5000)
  }), 10000)

  it('should write to custom output file if specified', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/out/custom.js')
    })

    compiler(plugin).run(() => {
      expect(fse.existsSync(resolve('./fixtures/out/custom.js'))).toBeTruthy()
      matchOutputWithSnapshot('fixtures/out/custom.js')
      done('done')
    })
  }))

  it('should not stop watching after detecting route custom block syntax errors', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/router.js')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      if (count === 1) {
        addPage(
          'users/foo.vue',
          `
              <route>
              {
                "meta": {
                  "requiresAuth": true,
                }
              }
              </route>
            `
        )
      } else if (count === 2) {
        addPage(
          'users/foo.vue',
          `
              <route>
              {
                "meta": {
                  "requiresAuth": true
                }

              </route>
            `
        )
      } else if (count === 3) {// Somehow, changing content triggers compilation twice.
      } else {
        matchOutputWithSnapshot()
        watching.close(done)
      }

    })
    setTimeout(() => {
      matchOutputWithSnapshot()
      watching.close(done)
    }, 8000)
  }), 10000)
})
