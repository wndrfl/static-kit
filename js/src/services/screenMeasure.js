module.exports = {
    
    _measure : function() {
        app.global.vars.window.w = $(window).width();
        app.global.vars.window.h = $(window).height();
        $(window).trigger('window.measured');       
    },

    init : function() {
        $(window).on('resize',function(e) {
            measure();
        });
        measure();

        $(window).on('window.request-measure',measure);        
    }
};