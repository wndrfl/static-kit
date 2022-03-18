class Logger {

  // Vars
  // ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

	static NAME = 'Logger';

	static styleBold = [
		'color: white',
		'font-weight: bold',
	].join(';');

	static styleError = [
		'color: red',
		'text-align: left',
	].join(';');

	static styleSubdued = [
		'color: gray',
		'font-weight: normal'
	].join(';');

  // Logic
  // ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

  static error(message, ...args) {
  	console.trace("%c" + message, this.styleError, ...args)
  }

  static info(message, ...args) {
  	console.info("%c" + message, this.styleSubdued, ...args)
  }

	static log(message, ...args) {
		console.log("%c" + message, this.styleBold, ...args);
	}

	/**
	 * Class static initialization block
	 */
	static {
		Logger.info(`${this.NAME} > init`);
	}
}
export default Logger;
