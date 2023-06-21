import * as fs from 'fs'
import { resolve } from 'path'
import * as chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import type { Compiler } from 'webpack'
import { generateRoutes, GenerateConfig } from '@vue-auto-router/core'

const pluginName = 'AutoRoutingPlugin'

export interface PluginConfig extends GenerateConfig {
  pages: string,
  outFile?: string,
  useWatcher?: boolean
}

export class Plugin {
  options: PluginConfig
  modules: string[]
  folderSegments: string[]
  private watcher: FSWatcher | undefined

  constructor(options: PluginConfig) {
    this.options = options
    this.modules = []
    // 监听目录的层级 ./src/views
    this.folderSegments = this.options.pages.split('/').filter(folder => /[A-z]/.test(folder))
    if (this.options.useWatcher) {
      this.watcher = this.initWatcher()
    } else {
      this.watcher = undefined
    }
  }

  private initWatcher() {
    if (this.watcher) {
      return this.watcher
    }
    return chokidar.watch(this.options.pages)
  }

  apply(compiler: Compiler) {
    const generate = () => {
      const code = generateRoutes(this.options)
      const to = this.options.outFile || resolve(__dirname, '../router.js')
      if (
        fs.existsSync(to) &&
        fs.readFileSync(to, 'utf8').trim() === code.trim()
      ) {
        return
      }
      fs.writeFileSync(to, code)
    }
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      if (this.watcher && this.options.useWatcher) {
        this.watcher.on('all', () => {
          try {
            generate()
          } catch (error: any) {
            compilation.errors.push(error)
          }
        })
      } else {
        try {
          generate()
        } catch (error: any) {
          compilation.errors.push(error)
        }
      }
    })
  }
}
