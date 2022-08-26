import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
	preset: 'ts-jest',
	testMatch: [
		'<rootDir>/packages/**/test/*.{spec,test}.{js,ts}',
		'<rootDir>/src/**/*.{spec,test}.{js,ts}',
	],
	moduleFileExtensions: ['ts', 'js', 'css'],
	transformIgnorePatterns: ["/node_modules/"],
}

export default config
