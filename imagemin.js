import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';


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


const optimize = async () => {

	if (!config) config = { paths: directories };

	const files = await imagemin([`${config.paths.src.images}/*.{jpg,png,ico}`], {
		destination: config.paths.dist.images,
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
}

optimize();
