import * as fs from 'fs'
import * as path from 'path'
import chokidar from 'chokidar'
import { generateRoutes } from '@auto-route/core'
import { GenerateConfig } from '../../../src/types'

const pluginName = 'AutoRoutingPlugin'

class AutoRoutingPlugin {
	constructor(options: GenerateConfig) {
		this.options = options
		this.watched = false
		this.runFirsted = false
		this.modules = []
		// 监听目录的层级 ./src/views
		this.folderSegments = this.options.pages.split('/').filter(folder => /[A-z]/.test(folder))
		if (this.options.module) {
			// 模块的话
			// this.parseFolders(this.options.pages)
			this.createModuleDir()
		}
	}

	// 创建module文件
	createModuleDir() {
		const existDir = fs.existsSync(path.resolve(__dirname, '../module'))
		if (!existDir) {
			fs.mkdirSync(path.resolve(__dirname, '../module'))
		}
	}

	// 监听每个module
	watchFolder(module) {
		// 还没有监听的话就去监听
		if (!this.modules.includes(module)) {
			chokidar.watch(`${this.options.pages}/${module}`).on('all', (event, _path) => {
				this.generate({
					...this.options,
					pages: `${this.options.pages}/${module}`,
					outFile: path.resolve(__dirname, '../module', `${module}.js`),
					importPrefix: `${this.options.importPrefix}/${module}/`,
					module
				})
			})
			this.modules.push(module)
		}
	}

	// module的index文件 用来导出所有路由模块
	// 每次添加或删除模块的时候 refresh一下
	refreshModuleIndexFile() {
		const moduleExportString = this.modules.reduce((pre, cur, index, arr) => {
			let importString = `import ${cur} from './${cur}.js'\r\n`
			if (index === arr.length - 1) {
				importString += `export { \r\n ${arr.join(',')} \r\n}`
			}
			return pre + importString
		}, '')
		const moduleIndexPath = path.resolve(__dirname, '../module/index.js')
		fs.writeFileSync(moduleIndexPath, moduleExportString)
	}

	// 构造路由代码并输出到对应模块的js文件中去
	generate(options) {
		const code = generateRoutes(options)
		const to = options.outFile || path.resolve(__dirname, '../index.js')
		const existInModuleIndex = fs.existsSync(to)
		console.log(existInModuleIndex, 'existInModuleIndex...')
		if (fs.existsSync(to) && fs.readFileSync(to, 'utf8').trim() === code.trim()) {
			return
		}
		fs.writeFile(to, code, (err, _data) => {
			if (!existInModuleIndex || !fs.existsSync(path.resolve(__dirname, '../module/index.js'))) {
				console.log(to, 'changeIndex...')
				// 第一次有模块文件 导出写进去index
				this.refreshModuleIndexFile()
			}
		})
	};

	// 删除文件的时候 把产生的路由文件也删了
	removeRouteFile(module) {
		try {
			fs.unlinkSync(path.resolve(__dirname, '../module', `${module}.js`))
			console.log('removeRouteFile...')
			this.modules = this.modules.filter(item => item !== module)
			this.refreshModuleIndexFile()
		} catch (error) {
			console.log(error)
		}
	}

	apply(compiler) {
		compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
			this.runFirsted = true
			if (!this.watched) {
				chokidar.watch(this.options.pages, {
					depth: 0,
					ignored: /index$/
				}).on('addDir', (path, stats) => {
					let curFolderSegments = path.replace(/\\/g, '/').split('/')
					let curModule = curFolderSegments.pop()
					// ./src/views 不监听views这一层 而是监听子目录
					if (curFolderSegments.length === this.folderSegments.length) {
						this.watchFolder(curModule)
					}
				})
				chokidar.watch(this.options.pages, {
					depth: 0,
					ignored: /index$/
				}).on('unlinkDir', (path, stats) => {
					let curFolderSegments = path.replace(/\\/g, '/').split('/')
					let curModule = curFolderSegments.pop()
					console.log('remove...')
					this.removeRouteFile(curModule)
				})
				this.watched = true
			}
		})
	}
}

module.exports = AutoRoutingPlugin
