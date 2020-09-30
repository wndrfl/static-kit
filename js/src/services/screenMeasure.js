module.exports = {
    
    _measure : function() {
        app.global.vars.window.w = $(window).width();
        app.global.vars.window.h = $(window).height();
        $(window).trigger('window.measured');       
    },

    init : function() {
        var self = this;
        $(window).on('resize',function(e) {
            self._measure();
        });
        self._measure();

        $(window).on('window.request-measure',self._measure);        
    }
};