import { describe, expect, beforeEach, it } from 'vitest'
import * as path from 'path'
import * as fse from 'fs-extra'
import { webpack } from 'webpack'
import type { Compiler } from 'webpack'
import { Plugin } from '../src'

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
    plugins: [plugin]
  })
}

const matchOutputWithSnapshot = async (path?: string) => {
  const out = await fse.readFile(
    resolve(path || './fixtures/out/main.js'),
    'utf8'
  )
  console.log(out)
  expect(out).toMatchSnapshot()
}

const addPage = (p: string, content = '') => {
  const to = resolve(path.join('fixtures/pages', p))
  return fse.outputFile(to, content)
}

const removePage = (p: string) => {
  const to = resolve(path.join('fixtures/pages', p))
  return fse.remove(to)
}

describe('webpack plugin', () => {
  beforeEach(async () => {
    await Promise.all([
      fse.remove(resolve('../index.js')),
      // reset pages
      fse.remove(resolve('fixtures/pages')),
      addPage('index.vue'),
      addPage('users/foo.vue'),
      addPage('users/_id.vue')
    ])
  })

  it('imports dynamically created routes', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
    })

    compiler(plugin).run(async () => {
      await matchOutputWithSnapshot()
      done(1)
    })
  }))

  it('watches adding a page', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, async () => {
      count++
      switch (count) {
        case 1:
          await addPage('users.vue')
        default:
          await matchOutputWithSnapshot()
          watching.close(done)
          break
      }
    })
  }))

  it('watches changing route custom block data', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, async () => {
      count++
      switch (count) {
        case 1:
          await addPage(
            'users/foo.vue',
            `
              <route>
              {
                "requiresAuth": true
              }
              </route>
            `
          )
        default:
          await matchOutputWithSnapshot()
          watching.close(done)
          break
      }
    })
  }), 10000)

  it('watches removing a page', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, async () => {
      count++
      switch (count) {
        case 1:
          await removePage('users/foo.vue')
        default:
          await matchOutputWithSnapshot()
          watching.close(done)
          break
      }
    })
  }))

  it('does not fire compilation when the route does not changed', () => new Promise((done, fail) => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
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

  it('should not stop watching after detecting route custom block syntax errors', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages')
    })

    let count = 0
    const watching = compiler(plugin).watch({}, async () => {
      count++
      switch (count) {
        case 1:
          await addPage(
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
        case 2:
          await addPage(
            'users/foo.vue',
            `
              <route>
              {
                "meta": {
                  "requiresAuth": true
                }
              }
              </route>
            `
          )
        case 3:
          // Somehow, changing content triggers compilation twice.
          break
        default:
          await matchOutputWithSnapshot()
          watching.close(done)
          break
      }
    })
  }))

  it('should write to custom output file if specified', () => new Promise(done => {
    const plugin = new Plugin({
      pages: resolve('fixtures/pages'),
      outFile: resolve('fixtures/out/custom.js')
    })

    compiler(plugin).run(async () => {
      await fse.pathExists(resolve('./fixtures/out/custom.js'))
      await matchOutputWithSnapshot('fixtures/out/custom.js')
      done(1)
    })
  }))
})


