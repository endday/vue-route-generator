import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import type { Compiler } from 'webpack'
import { generateRoutes, GenerateConfig } from '@auto-route/core'

const pluginName = 'AutoRoutingPlugin'

export interface PluginConfig extends GenerateConfig {
	outFile?: string
}

export class Plugin {
	options: PluginConfig
	hasRun: boolean
	modules: string[]
	folderSegments: string[]
	private watcher: FSWatcher

	constructor(options: PluginConfig) {
		this.options = options
		this.hasRun = false
		this.modules = []
		// 监听目录的层级 ./src/views
		this.folderSegments = this.options.pages.split('/').filter(folder => /[A-z]/.test(folder))
		this.watcher = this.initWatcher()
	}

	private initWatcher() {
		if (this.watcher) {
			return this.watcher
		}
		return chokidar.watch(this.options.pages)
	}

	apply(compiler: Compiler) {
		compiler.hooks.thisCompilation.tap(pluginName, compilation => {
			this.hasRun = true
			const generate = () => {
				const code = generateRoutes(this.options)
				const to = this.options.outFile || path.resolve(__dirname, '../index.js')
				if (
					fs.existsSync(to) &&
					fs.readFileSync(to, 'utf8').trim() === code.trim()
				) {
					return
				}

				fs.writeFileSync(to, code)
			}
			this.watcher.on('all', () => {
				try {
					generate()
				} catch (error: any) {
					compilation.errors.push(error)
				}
			})
		})
	}
}
