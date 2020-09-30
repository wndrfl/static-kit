window.jQuery = window.$ = require('jquery');

window.app = {

	// Things that should only happen once, ever.
	boot: function() {

		// Lets us know that the app has booted.
    	console.info('✨Do you believe in magic?✨');

    	// Put anything that should be booted *once* on page load, below..

    	// Run the init() method for the app
		app.global.init();
	},

    global: {

    	// A place to stash variables that are referenced
    	// on a global level
        vars: {
            window : {
                w : 0,
                h : 0
            }
        },

        // Is guaranteed to be run on page load.
        // This can also be re-run periodically after page load
        init: function() {


            /*
            * PAGE-SPECIFIC SCRIPTS
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

    // Load all scripts that should only be initialized
    // on specific pages
    pages: {
        home: require('./pages/home'),
        // anotherPage: require('./pages/anotherPage'),
    },

    services: {
        initScreenMeasure: require('./services/screenMeasure'),
        // anotherService: require('./global/anotherService'),
    },

};

(function( root, $, undefined ) {
	"use strict";
	$(function () {
		// Boot the app
		window.app.boot();
	});
} ( this, jQuery ));
