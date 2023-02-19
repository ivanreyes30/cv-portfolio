// eslint-disable-next-line no-undef
module.exports = {
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	root: true,
	rules: {
		semi: ['error', 'never'],
		quotes: ['error', 'single'],
		'object-curly-spacing': ['error', 'always'],
		'comma-dangle': ['error', 'never'],
		// 'indent': ['error', 'tab'],
		// 'eslint no-trailing-spaces': [
		//   'error',
		//   {
		//     'skipBlankLines': true
		//   }
		// ],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-inferrable-types': 'off'
	}
}
 