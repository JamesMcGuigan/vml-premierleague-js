$.ui.basewidget.subclass('ui.slidetoggle', {
    klass: '$.ui.slidetoggle',
    options: {
		controller:  null,		// {String} Clickable slide controller class
		target:		 null,		// {String} Target object to slide up/down
		toggleclass: null		// {String} Toggle controller class
    },
    required: {
    	controller: String
    },
    _create: function() { 
        this.options.hash = {};
        this.target = this.options.target || this.element;
    },
    _init: function() {
        this.doToast();
    },
    doToast: function() {
    	var self = this;
    	var toggleClass = self.options.toggleclass;
    	
    	// find Controller element in object widget applied to
    	this.element.find( this.options.controller ).click(function() {
    		$t = $(this);
    		// find Target element and add slideToggle
    		if ( self.target == self.element ) {
    			self.target.slideToggle();
    		} else {
    			self.element.find( self.target ).slideToggle();
    		}
    		// toggle 
    		if (toggleClass) {
    			if ( $t.hasClass( toggleClass ) ) {
    				$t.removeClass( toggleClass );
    			} else {
    				$t.addClass( toggleClass );
    			}
    		}
	    });
    }
});
