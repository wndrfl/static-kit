// Import our per-project configurations
let config;
try {
	config = require('./statickit.json');
} catch(err) {
	//
}

// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const babelify = require('babelify');
const browserify = require('browserify');
const changed = require('gulp-changed')
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');


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

// A dictionary of important files
const files = {
	src : {
		js : directories.src.js + 'scripts.js',
		scss : directories.src.scss + 'styles.scss'
	}
}

// Image minification task: optimizes images for web and saves as a separate file
function imageMinTask() {
	return src(directories.src.images + '*')
		.pipe(changed(directories.dist.images))
		.pipe(imagemin())
		.pipe(dest(directories.dist.images));
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
    return browserify(files.src.js)
	    .transform('babelify', {presets: ['@babel/preset-env']})
	    .bundle()
	    .pipe(source('scripts.js'))
	    .pipe(buffer())
	    .pipe(sourcemaps.init())
	    .pipe(uglify())
	    .pipe(sourcemaps.write('./'))
	    .pipe(dest(directories.dist.js));
}

// Sass task: compiles the styles.scss file into styles.css
function scssTask() {
    return src(files.src.scss)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass({
			includePaths: ['node_modules']
		})) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest(directories.dist.css)); // put final CSS in dist folder
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
    watch([
	    	directories.src.images + '**/*.*', 
	    	directories.src.scss + '**/*.scss', 
	    	directories.src.js + '**/*.js'
    	],
        {interval: 1000, usePolling: true}, //Makes docker work
        series(
            parallel(imageMinTask, scssTask, jsTask)
        )
    );    
}

// Export the default Gulp task so it can be run
// Runs the images, scss and js tasks simultaneously
// then watch task
exports.default = series(
    parallel(imageMinTask, scssTask, jsTask),
    watchTask
);
