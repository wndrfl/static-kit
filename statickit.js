const chokidar = require("chokidar");
const esbuild = require("esbuild");
const fg = require('fast-glob');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const sassPlugin = require("esbuild-plugin-sass");
// const browserSync = require("browser-sync").create();


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
    css : './css',
    images : './images',
    js : './js',
  },
  src : {
    images : 'images/src',
    js : 'js/src',
    scss : 'css/src'
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

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Build all Javascript fiels
const buildJs = async () => {

  console.log("Building JS...");
  
  try {

    const timerStart = Date.now();

    // Get the files
    const files = await fg([`${directories.src.js}/*.js`]);

    // Build code
    await esbuild.build({
      entryPoints: files,
      format: "esm",
      bundle: true,
      minify: true,
      outdir: `${directories.dist.js}/`,
      sourcemap: true,
    });

    const timerEnd = Date.now();
    console.log(`JS done! Built in ${timerEnd - timerStart}ms.`);

  } catch (error) {
    console.log(error);
  }

  return true;
};

// Build all SCSS files
const buildScss = async () => {

  console.log("Building SCSS...");

  try {

    const timerStart = Date.now();

    // Get the files
    const files = await fg([`${directories.src.scss}/*.scss`]);

    // Build code
    await esbuild.build({
      entryPoints: files,
      bundle: true,
      minify: true,
      outdir: `${directories.dist.css}/`,
      plugins: [sassPlugin()]
    });

    const timerEnd = Date.now();
    console.log(`SCSS done! Built in ${timerEnd - timerStart}ms.`);

  } catch (error) {
    console.log(error);
  }

  return true;
};

// Optimize all images
// https://github.com/imagemin/imagemin/issues/380#issuecomment-898220983
const optimizeImages = async () => {

  console.log('Optimizing images...');

  const imagemin = (await import('imagemin')).default;
  const files = await imagemin([`${directories.src.images}/**/*.{jpg,png}`], {
    destination: `${directories.dist.images}`,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });

  files.forEach((file) => {
    console.info(file.sourcePath + ' => ' + file.destinationPath);
  });

  return true;
}

const run = async () => {
  await buildScss();
  await buildJs();
  await optimizeImages();
  return true;
};

// Go!
run().then(async () => {

  // Live reload?
  // if (process.argv.includes("--reload")) {

  //   console.log("Setting up live reload...");

    // //browserSync will trigger livereload when build files are updated
    // browserSync.init({
    //   //TODO: make these values passed in by `npm run dev`
    //   port: 3334,
    //   proxy: "localhost:3333",
    //   files: ["assets/build/*"],
    // });
  // }
  
  // Watch files?
  if (process.argv.includes("--watch")) {

    console.log("Watching files...");

    // Listen for Image changes
    const imgWatcher = chokidar.watch([`${directories.src.images}/*.{jpg,png}`]);
    imgWatcher
      .on("change", (path, stats) => { 
        if (stats) console.log(`Image ${path} changed size to ${stats.size}`);
        optimizeImages();
      });

    // Listen for JS changes
    const jsWatcher = chokidar.watch([`${directories.src.js}/**/*.js`]);
    jsWatcher.on("change", () => {
      buildJs();
    });

    // Listen for SCSS changes
    const scssWatcher = chokidar.watch([`${directories.src.scss}/**/*.scss`]);
    scssWatcher.on("change", () => {
      buildScss();
    });

    // //browserSync will trigger livereload when build files are updated
    // browserSync.init({
    //   //TODO: make these values passed in by `npm run dev`
    //   port: 3334,
    //   proxy: "localhost:3333",
    //   files: ["assets/build/*"],
    // });
  }

});
