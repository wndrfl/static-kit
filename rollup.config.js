// rollup.config.js (building more than one bundle)
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser'; // https://github.com/terser/terser#minify-options
import scss from 'rollup-plugin-scss';
import commonjs from '@rollup/plugin-commonjs'; // convert CommonJS modules to ES6 => solve for Error: "[name] is not exported by [module]"
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve'; // https://www.npmjs.com/package/rollup-plugin-serve
import livereload from 'rollup-plugin-livereload'; // https://github.com/thgh/rollup-plugin-livereload & https://www.npmjs.com/package/livereload - JS Object with options towards bottom

const production    = process.env.BUILD === 'prod'; // console.log(process.env.TRANSFORM, production, process.env.INCLUDE_DEPS, process.env.BUILD)
const pages         = new Set(['home', 'home', 'about']);
const pages_cleaned = Array.from(pages);
const max           = pages_cleaned.length;
for (let i = 0; i < max; i++) {
	pages_cleaned[i] = {
		input: `js/src/${pages_cleaned[i]}.js`,
		output: {
			file: production === true ? `js/min-${pages_cleaned[i]}.js` : `js/${pages_cleaned[i]}.js`,
			format: 'es',
			sourcemap: true
		},
		plugins: getPlugins(pages_cleaned[i])
	};
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default pages_cleaned;

/**
 * getPlugins --- Return global plugins Array and customize for each bundle
 * @param page  Page name
 * @returns {(Plugin|false|"")[]}
 */
function getPlugins(page) {
	return [
		resolve(),  // Resolve dependencies installed via NPM (stored in the node_modules directory)
		commonjs(), // https://github.com/rollup/plugins/tree/master/packages/commonjs#custom-named-exports
		production && terser({  // Minify JS
			compress: {
				keep_fargs: false
			},
			ecma: 2020,
			module: true,
			warnings: true,
		}),
		process.env.TRANSFORM && babel({ // https://github.com/rollup/plugins/tree/master/packages/babel
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
			babelrc: true
		}),
		scss({
			output: production === true ? `css/pages/min-${page}.css` : `css/pages/${page}.css`,
			sourceMap: true,
			...(production === true) && {outputStyle: 'compressed'},
		}),
		process.env.SERVE && serve({
				port: 10000
			}
		),
		process.env.SERVE && livereload({
			port: 10001
			// exts:['png']
		}),
	]
}