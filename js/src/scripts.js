/*
* GLOBAL DEPENDENCIES
* ---------------------
* Set up any dependencies that will be required across
* the board. If there are dependencies that are only required
* on specific pages, you should instead include them in the
* script for that page (inside /pages/mypage.js)
*/
window.jQuery = window.$ = require('jquery');


/*
* APP OBJECT
* ---------------------
* We are going to store all app-specific logic
* inside window.app, so that we don't muddy the namespaces.
*/
window.app = {

	/*
    * GLOBAL BOOT
    * ---------------------
    * Things that should only happen once, ever.
	*/
	boot: function() {

		// Lets us know that the app has booted.
    	console.info('✨Do you believe in magic?✨');

    	// Put anything that should be booted *once* on page load, below..

    	// Run the init() method for the app
		app.global.init();
	},

    global: {

		/*
	    * GLOBAL VARIABLES
	    * ---------------------
	    * A place to stash variables that are referenced
	    * on a global level
		*/
        vars: {
            window : {
                w : 0,
                h : 0
            }
        },

		/*
	    * REUSABLE INITIALIZATION
	    * ---------------------
	    * Is guaranteed to be run on page load.
	    * This can also be safely re-run periodically after page load
		*/
        init: function() {


            /*
            * INITIALIZE ANY PAGE-SPECIFIC SCRIPTS
            * ---------------------
            * We are going to use the body id attribute to
            * attempt to load any scripts for this specific page
            *
            * Note: when coding your html templates, make sure to set
            * the ID of the body tag to something like <body id="home">
            */
            let id = $('body').attr('id');

            if(id) {
                id = id.replace(/-/g,'_');
                if(window.app.pages[id]) {
                    window.app.pages[id]();
                }
            }


            /*
            * INITIALIZE ALL GLOBAL SERVICES
            * ---------------------
            * Each service should be an object with an init() method.
            */
            for(var s in window.app.services) {
                if(window.app.services[s].init) {
                    window.app.services[s].init();
                }
            }

        },
        
    },


    /*
    * PAGE-SPECIFIC SCRIPTS
    * ---------------------
    * Load all scripts that should only be initialized
    * on specific pages
    */
    pages: {
        home: require('./pages/home'),
        // anotherPage: require('./pages/anotherPage'),
    },

    /*
    * GLOBAL SERVICES
    * ---------------------
    * Load any scripts / services that should be initialized
    * on every page. This is good for things like analytics, UI
    * elements that are present on every page, utilities, etc.
    */
    services: {
        initScreenMeasure: require('./services/screenMeasure'),
        // anotherService: require('./global/anotherService'),
    },

};

/*
* KICK EVERYTHING OFF
* ---------------------
* Wait for the document to load and then boot our app.
*/
(function( root, $, undefined ) {
	"use strict";
	$(function () {
		// Boot the app
		window.app.boot();
	});
} ( this, jQuery ));
