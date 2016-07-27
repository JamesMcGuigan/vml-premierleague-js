// Use this as a javascript template
// /js/init.js - will automatically create the widget for you upon $(document).ready()
// @see /jcr_root/etc/designs/premierleague/clientlibs/js/libs/jquery.ui.subclass.js
// @see /jcr_root/etc/designs/premierleague/exlibs/js/jquery.jcarousel.js
// @see /jcr_root/etc/designs/premierleague/exlibs/js/jquery.jcarousel.extensions.js

$.ui.basewidget.subclass('ui.listToCarousel', {
    klass: '$.ui.listToCarousel',
    options: {
        visible:      5, 						// {Number}     number of visible <li> elements (clipping) defined by CSS
        scroll: 	  1,                        // {Number}     How many elements to scroll by when arrows are clicked
        wrap: 		  null,                     // {String}     Wrapping type (jcarousel option feed-in)
        nextinput:	  null,						// {String}		class of 'next' input control element in parent
        previnput:	  null,						// {String}	    class of 'prev' input control element in parent
        linked:       null                      // {String|jQuery} selectors for other jcarousel DOM nodes to also animate on scroll 
    },
    jcarousel: null, // {jCarousel} reference to the wrapped jCarousel object

    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options = $.getAttributeHash( this.element, this.options );
    },
    // Called from constructor after _create() – automatically calls this._super() before function
    _init: function() {
        this.initCarousel();
    },
    initCarousel: function (arg) {
    	// Set base options
    	var options = {};
		options.scroll 	= this.options.scroll;
		options.wrap	= null; // this.options.wrap;
		options.visible = this.options.visible;
        options.linked  = $(this.options.linked);
    	
    	if( this.options.nextinput != null && this.options.previnput != null) {
    		options.buttonNextHTML = null;
    		options.buttonPrevHTML = null;
    		options.initCallback   = $.proxy( this.addInputs, this );
    	}

    	if (typeof $.fn.jcarousel === "function") {
	    	this.jcarousel = $(this.element).jcarousel( options ).data("jcarousel");
    	} else {
    		// Throw an error, dependent plug-in not detected
    		console.error(this.klass, ":initCarousel(): $.fn.jcarousel is not a function - ", $.fn.jcarousel, " - options: ", options, "- - this", this);
    	}
    	
    },
    addInputs: function( jcarousel ) {
    	$(this.options.nextinput).bind('click', function() {
			jcarousel.next();
			return false;
	    });
   		$(this.options.previnput).bind('click', function(){
    		jcarousel.prev();
    		return false;
    	});
    }
});
