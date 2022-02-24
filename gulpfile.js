/*****************************************
* DEPENDENCIES
*****************************************/

// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
import gulp from 'gulp';
const { src, dest, watch, series, task, parallel } = gulp;

// Importing all the Gulp-related packages we want to use
import babelify from 'babelify';
import browserify from 'browserify';
import changed from 'gulp-changed';
import colors from 'colors';
import imagemin from 'gulp-imagemin';
import sourcemaps from 'gulp-sourcemaps';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import uglify from 'gulp-uglify';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';


/*****************************************
* CONFIGURATION
*****************************************/

// Import our per-project configurations
let config;
try {
	config = require('./statickit.json');
} catch(err) {}

// A dictionary of various directories
const directories = {
	dist : {
		css : './css/',
		images : './images/',
		js : './js/',
	},
	src : {
		images : 'images/src/',
		js : 'js/src/',
		scss : 'css/src/'
	}
};

// Allow for overwrites
if(config && config.paths) {
	if(config.paths.dist) {
		for(var i in config.paths.dist) {
			if(directories.dist[i]) {
				directories.dist[i] = config.paths.dist[i];
			}
		}
	}
	if(config.paths.src) {
		for(var i in config.paths.src) {
			if(directories.src[i]) {
				directories.src[i] = config.paths.src[i];
			}
		}
	}
}


/*****************************************
* NOTIFICATIONS / LOGGING
*****************************************/

// We don't need to see the gulp-notify in the logs
notify.logLevel(0);

// Colorize errors
colors.setTheme({
	error: ['bold','red']
});

// Log errors to console
function _error(msg) {
	console.log('☠️  ' + msg.error);
}

// An icon for gulp-notify notifications (just for a nice touch)
const icon = 'data:image/png;base64,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';

function showErrorNotification(err) {
	_error(err.formatted);
    notify.onError({
        title: '🚨 Oh no!',
        message:  'Bad things happened. Check your command line for details.',
    	icon: icon    
    })(err);
}



/*****************************************
* GULP TASKS
*****************************************/

const cssFiles = {
	'home' : directories.src.scss + 'home.scss',
};

for (const [name, file] of Object.entries(cssFiles)) {

	const buildTaskName = 'build:css:' + name;

	task(buildTaskName, () => {

	    return src(file)
	        .pipe(plumber({ errorHandler: showErrorNotification}))
	        .pipe(sourcemaps.init()) // initialize sourcemaps first
	        .pipe(sass({
				includePaths: ['node_modules']
			})) // compile SCSS to CSS
	        .pipe(postcss([ autoprefixer(), cssnano({
	            preset: ['default', { minifyFontValues: false }],
	        }) ])) // PostCSS plugins
	        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
	        .pipe(dest(directories.dist.css)) // put final CSS in dist folder
		    .pipe(notify({
		        title: '👍 Order up!',
		        message:  buildTaskName + ' successfully compiled',
		    	icon: icon,
		    	onLast: true    
		    }));
	});
};




const jsFiles = {
	'home' : directories.src.js + 'home.js',
};

for (const [name, file] of Object.entries(jsFiles)) {

	const buildTaskName = 'build:js:' + name;

	task(buildTaskName, () => {

		let bundler = browserify({
			entries: [file]
		}).transform('babelify', {presets: ['@babel/preset-env']});

		return bundler.bundle()
			.pipe(plumber({ errorHandler: showErrorNotification}))
			.pipe(source(name + '.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(sourcemaps.write('./'))
			.pipe(dest(directories.dist.js))
			.pipe(notify({
				title: '👍 Order up!',
				message:  buildTaskName + ' successfully compiled',
				icon: icon,
				onLast: true
			}));
	});
};

// Image minification task: optimizes images for web and saves as a separate file
function imageMinTask() {
	return src(directories.src.images + '*')
        .pipe(plumber({ errorHandler: showErrorNotification}))
		.pipe(changed(directories.dist.images))
		.pipe(imagemin())
		.pipe(dest(directories.dist.images))
	    .pipe(notify({
	        title: '👍 Order up!',
	        message:  'Images successfully optimized',
	    	icon: icon,
	    	onLast: true    
	    }));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {

	// Watch Javascript files
	watch([directories.src.js],
		{interval: 1000, usePolling: true}, // Makes docker work
		series(
			parallel(Object.keys(jsFiles).map((v) => { return 'build:js:' + v; }))
		)
	);

	// Watch Scss files
	watch([directories.src.scss],
		{interval: 1000, usePolling: true}, // Makes docker work
		series(
			parallel(Object.keys(cssFiles).map((v) => { return 'build:css:' + v; }))
		)
	);

	// Watch image files
	watch([directories.src.images],
		{interval: 1000, usePolling: true}, // Makes docker work
		series(imageMinTask)
	);
}

// Export the default Gulp task so it can be run
// Runs the images, scss and js tasks simultaneously
// then watch task
const _default = series(
	parallel(
		[imageMinTask]
		.concat(Object.keys(jsFiles).map((v) => { return 'build:js:' + v; }))
		.concat(Object.keys(jsFiles).map((v) => { return 'build:css:' + v; }))
	),
	watchTask
);
export { _default as default };
