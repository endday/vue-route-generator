import type { InitialOptionsTsJest } from 'ts-jest/dist/types'
import base from '../../jest.config.base'
import * as pkg from './package.json'

const config: InitialOptionsTsJest = {
	...base,
	name: pkg.name
}

export default config
