/**
 * Static Kit
 * 
 * This file configures Static Kit's different build tasks.
 * 
 * To customize various Static Kit options, please edit the
 * configuration file at .staticrc, which is located in the same
 * directory as this file.
 **/

const chokidar = require("chokidar");
const esbuild = require("esbuild");
const fg = require("fast-glob");
const fs = require("fs");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const sass = require('sass');
const explore = require('source-map-explorer').default;


/*****************************************
* CONFIGURATION
*****************************************/

// Import our per-project configurations
let config;
try {
  const data = fs.readFileSync("../.staticrc");
  config = JSON.parse(data);
} catch (err) { }

// A dictionary of various directories
const directories = {
  dist: {
    css: 'dist/css',
    images: 'dist/images',
    js: 'dist/js',
  },
  src: {
    images: 'src/images',
    js: 'src/js',
    scss: 'src/scss'
  },
  analysis: 'analysis'
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
  if (config.paths.analysis) {
    directories.analysis = config.paths.analysis;
  }
}

// Get all the main JS build files
const getJsBuildFiles = async () => {
  return await fg([`${directories.src.js}/*.js`]);
}

// Get all the main SCSS build files
const getScssBuildFiles = async () => {
  return await fg([`${directories.src.scss}/*.scss`]);
}


/**
 * Tasks
 **/

// Build all Javascript fiels
const buildJs = async (file) => {

  if (file) {
    console.log(`Building ${file}`);
  } else {
    console.log(`Building Javascript: ${directories.src.js}`);
  }

  try {

    const timerStart = Date.now();

    // Get the files
    const files = file ? [file] : await getJsBuildFiles();

    // Build code
    await esbuild.build({
      entryPoints: files,
      format: "esm",
      bundle: true,
      minify: true,
      outdir: `${directories.dist.js}/`,
      sourcemap: true,
      target: "es2020"
    });

    const timerEnd = Date.now();
    console.log(`JS done! Built in ${timerEnd - timerStart}ms.`);

  } catch (error) {
    console.log(error);
  }

  return true;
};

// Build all SCSS files
const buildScss = async (file) => {

  if (file) {
    console.log(`Building ${file}`);
  } else {
    console.log(`Building SCSS: ${directories.src.scss}`);
  }

  try {

    const timerStart = Date.now();

    // Get the files
    const files = file ? [file] : await getScssBuildFiles();

    // Build code
    for (var i in files) {
      const file = files[i];
      const result = await sass.compileAsync(file, {
        loadPaths: ["node_modules"],
        sourceMap: true,
        style: "compressed"
      });

      const filename = file.split(/[\\/]/).pop();
      const filenameParts = filename.split('.');
      filenameParts.pop();
      const cssFilename = `${filenameParts.join('.')}.css`;
      const cssFilePath = `${directories.dist.css}/${cssFilename}`;
      const cssSourceMapFilename = `${filenameParts.join('.')}.css.map`;
      const css = `${result.css}
/*# sourceMappingURL=${cssSourceMapFilename} */`;

      await fs.writeFile(`${cssFilePath}`, css, err => {
        if (err) {
          console.error(err);
          return;
        }
      });

      if (result.sourceMap) {
        const searchStr = `src/scss/`;
        const re = new RegExp(`/(.*(?=${directories.src.scss}))/g`, "g");
        result.sourceMap.sources.forEach((source, i) => {
          result.sourceMap.sources[i] = `../../${source.replace(/(.*(?=src\/scss))/g, '')}`;
        });
        const cssSourceMapFilePath = `${directories.dist.css}/${cssSourceMapFilename}`;
        await fs.writeFile(`${cssSourceMapFilePath}`, JSON.stringify(result.sourceMap), err => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
      console.info(`Compiled: ${file} => ${cssFilePath}`);
    }

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

  console.log("Optimizing images...");

  const imagemin = (await import("imagemin")).default;
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

const analyzeJs = async () => {
  console.log("Analyzing JS files...");

  try {
    const res = await explore(`${directories.dist.js}/*.js`, {
      output: {
        format: "html",
        filename: `${directories.analysis}/js.analysis.html`
      }
    })

    if (res.bundles) {
      res.bundles.forEach(bundle => {
        console.log(`Analyzed ${bundle.bundleName}`);
      })
    }
  } catch (err) {
    if (err.bundles.length === 0) {
      console.log("No JS bundles found");
    } else {
      console.log(err);
    }
  }
}

const analyzeCss = async () => {
  console.log("Analyzing CSS files...");

  try {
    const res = await explore(`${directories.dist.css}/*.css`, {
      output: {
        format: "html",
        filename: `${directories.analysis}/css.analysis.html`
      }
    })

    if (res.bundles) {
      res.bundles.forEach(bundle => {
        console.log(`Analyzed ${bundle.bundleName}`);
      })
    }
  } catch (err) {
    if (err.bundles.length === 0) {
      console.log("No CSS bundles found");
    } else {
      console.log(err);
    }
  }
}

const run = async () => {
  await optimizeImages();
  await buildScss();
  await buildJs();
  return true;
};

// Go!
run().then(async () => {

  // Watch files?
  if (process.argv.includes("--watch")) {

    console.log("Watching files...");

    // Listen for Image changes
    chokidar.watch([`${directories.src.images}/*.{jpg,png}`]).on("change", (path, stats) => {
      if (stats) console.log(`Image ${path} changed size to ${stats.size}`);
      optimizeImages();
    });

    // Listen for JS changes
    chokidar.watch([`${directories.src.js}/**/*.js`]).on("change", async (path, stats) => {
      const files = await getJsBuildFiles();
      if (files.includes(path)) {
        buildJs(path);
      } else {
        buildJs();
      }
    });

    // Listen for SCSS changes
    chokidar.watch([`${directories.src.scss}/**/*.scss`]).on("change", async (path, stats) => {
      const files = await getScssBuildFiles();
      if (files.includes(path)) {
        buildScss(path);
      } else {
        buildScss();
      }
    });
  }

  if (process.argv.includes("--analyze")) {
    analyzeJs().then(() => analyzeCss());
  }
});
