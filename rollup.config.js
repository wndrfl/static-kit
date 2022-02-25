// rollup.config.js (building more than one bundle)
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser'; // https://github.com/terser/terser#minify-options
import scss from 'rollup-plugin-scss';
import commonjs from '@rollup/plugin-commonjs'; // convert CommonJS modules to ES6 => solve for Error: "[name] is not exported by [module]"
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve'; // https://www.npmjs.com/package/rollup-plugin-serve
import livereload from 'rollup-plugin-livereload'; // https://github.com/thgh/rollup-plugin-livereload & https://www.npmjs.com/package/livereload - JS Object with options towards bottom

const path = require('path');
const fs = require('fs');
const production = process.env.BUILD === 'prod'; // console.log(process.env.TRANSFORM, production, process.env.INCLUDE_DEPS, process.env.BUILD)

// Import our per-project configurations
let config;
try {
	config = require('./statickit.json');
} catch (err) { }

// A dictionary of various directories
const directories = {
	dist: {
		css: "dist/css",
		images: "dist/images",
		js: "dist/js"
	},
	src: {
		images: "src/images",
		js: "src/js",
		scss: "src/css"
	}
};

// Allow for overwrites
if (config && config.paths) {
	if (config.paths.dist) {
		for (var i in config.paths.dist) {
			if (directories.dist[i]) {
				directories.dist[i] = config.paths.dist[i];
			}
		}
	}
	if (config.paths.src) {
		for (var i in config.paths.src) {
			if (directories.src[i]) {
				directories.src[i] = config.paths.src[i];
			}
		}
	}
}

const cssFiles = fs
	.readdirSync(path.join(__dirname, directories.src.scss))
	.filter(file => path.extname(file).toLowerCase() === '.scss');

const jsFiles = fs
	.readdirSync(path.join(__dirname, directories.src.js))
	.filter(file => path.extname(file).toLowerCase() === '.js');

const pages_config = [];


cssFiles.forEach(file => {
	console.log(file);
	const filename = file.split('.').slice(0, -1).join('.')
	if (!jsFiles.includes(`${filename}.js`)) {
		const jsName = path.join(__dirname, directories.src.js, `${filename}.js`);
		const content = `import "../../${directories.src.scss}/'${filename}'.scss";`;
		fs.writeFile(jsName, content, err => console.log(err));
	}
});


jsFiles.forEach((file, i) => {
	const filename = file.split('.').slice(0, -1).join('.')
	pages_config[i] = {
		input: `${directories.src.js}/${filename}.js`,
		output: {
			file: production ? `${directories.dist.js}/min-${filename}.js` : `${directories.dist.js}/${filename}.js`,
			format: 'es',
			sourcemap: true
		},
		plugins: [
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
				output: production ? `${directories.dist.css}/min-${filename}.css` : `${directories.dist.css}/${filename}.css`,
				sourceMap: true,
				watch: [`${directories.src.scss}/lib`],
				...(production) && { outputStyle: 'compressed' },
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
	};
});


/**
 * @type {import('rollup').RollupOptions}
 */
export default pages_config;