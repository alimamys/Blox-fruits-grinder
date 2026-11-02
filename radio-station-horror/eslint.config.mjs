import {config} from '@remotion/eslint-config-flat';

export default [
	...config,
	{
		// Node scripts (asset generation, script export)
		files: ['scripts/**/*.{mjs,ts}'],
		languageOptions: {
			globals: {process: 'readonly', console: 'readonly', Buffer: 'readonly'},
		},
	},
	{
		ignores: ['out/**', 'build/**', 'node_modules/**'],
	},
];
