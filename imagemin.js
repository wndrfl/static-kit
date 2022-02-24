import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

const optimize = async () => {
	const files = await imagemin(['images/src/*.{jpg,png}'], {
		destination: 'images',
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
