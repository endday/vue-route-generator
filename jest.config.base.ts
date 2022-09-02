import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
	preset: 'ts-jest',
	testRegex: '(/__tests__/.*.(test|spec)).(js|ts)$',
	moduleFileExtensions: ['ts', 'js', 'css'],
	transformIgnorePatterns: ["/node_modules/"],
}

export default config
