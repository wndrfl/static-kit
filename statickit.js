const esbuild = require("esbuild");
const sassPlugin = require("esbuild-plugin-sass");
const chokidar = require("chokidar");
const fg = require('fast-glob');
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

const buildAll = () => {
  buildScss();
  buildJs();
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
};


buildAll();

//watch it?
if (process.argv.includes("--watch")) {

  console.log("Watching files... n");

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