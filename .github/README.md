# Static Kit

Static Kit is a simple, standardized toolkit to aid in the creation and compilation of various static assets (Javascript, CSS, or images) for traditional frontends of all kinds.

This library is simply an organizational wrapper to minimize and noramlize the process of setting up common development tools. Under the hood, Static Kit leans heavily on [esbuild](https://esbuild.github.io/) for the various compilation and optimization tasks.

## Installation

### Download the library

Currently, the best way to install Static Kit is to download directly from Github.
https://github.com/wndrfl/static-kit

From there, you should put the contents of Static Kit in the appropriate directory of your project.

### Install the dependencies

Navigate to Static Kit directory and run `npm install`.

### Configure Static Kit via `.static` (optional)

By default, Static Kit has reasonable defaults. There are directories that come with the library to house your source Javascript files, SCSS files, and images. In addition, Static Kit will compile all assets to directories inside the Static Kit root directory, as well.

That said, it is possible to easily configure the paths for both the source and destination directories by editing the `.static` file in the root of the Static Kit library. This is helpful, for instance, if your project requires these files to live outside of Static Kit.

## Using Static Kit in Development

Static Kit is preset for easy Javascript and CSS (SCSS) development. By default, all coding should be done in the `./src/js` or `./src/scss` directories, respectively. In addition, Static Kit will automatically optimize images that are placed in the `./src/images` directory.

To begin development, simply run `npm run dev` from your Static Kit directory. This will compile all files, and watch for changes.

To only complile, run `npm run build`.

Static Kit is preconfigured to watch your files and compile any static assets to the directories that are set in your `.static` file.
