import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	verbose: true,
	preset: 'ts-jest',
	testRegex: '.e2e.spec.ts$',
	displayName: 'test',
	globals: {
		'ts-jest': {
		  tsconfig: '<rootDir>/tsconfig.jest.json',
		},
	  },
	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'js'],
	coverageDirectory: './coverage',
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js)'
	],
};

export default config;
