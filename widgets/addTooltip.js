/**
 *  tooltip widget wrapper class for
 *  js/libs/jquery.tooltip.min.js
 *  
 *  http://flowplayer.org/tools/demos/tooltip/
 */ 

$.ui.widget.subclass('ui.addTooltip', {
    klass: '$.ui.addTooltip',
    options: {
        hash:          		null,		// {Hash}         define objects and arrays within the constructor, else it will create a class variable
        predelay:         	   0,		// {Timestamp}    Hover delay in ms to tooltip is shown
        effect:		 	  'fade',		// {String}	  	  Fade duration
        position:	'top center',		// {String}		  px
        opacity:        	   0.9,		// {int}		  px
        type:		     	  '',		// {String}		  Apply class type
        classes:			  '',
        offsets:			  []
    },

    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
        this.options.classes += ' ' + this.element.attr('class');
    },

    // Called from constructor after _create() – automatically calls this._super() before function
    _init: function() {
        this.doSomething('tooltip init' );
        this.addTooltip();
    },

    // Not called from constructor – need to call this._super(arg) manually if required
    doSomething: function( arg ) {
        //console.log( arg, this.element.text(), this.options, this );
    },
    
    addTooltip: function() {
    	if(this.options.type == 'index') {
    		this.offsets = [12,0];
    	}
    	this.classes = 'tooltip ' + this.options.type + ' ' + this.options.classes;
    	
    	$(this.element).tooltip({
    		predelay: 	this.options.predelay,
    		effect:  	this.options.effect,
    		position:   this.options.position,
    		opacity: 	this.options.opacity,
    		offset:		this.offsets,
    		tipClass:   this.classes
    	});
    	
    }
    
});
