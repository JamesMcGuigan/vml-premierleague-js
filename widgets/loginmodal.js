/**
 * $.ui.loginmodal
 * 
 * 		Login modal
 *   
 */

$.ui.basewidget.subclass('ui.loginmodal', {
    klass: '$.ui.loginmodal',
    options: {
		action: 	null			// {String} Ajax url for submission
    },
    required: {
    	action:	String
    },
   _create: function() {
        this.options.hash  = {};
        this.options       = $.getAttributeHash( this.element, this.options );
        
        // Inputs
        this.el.submit	   = this.element.find( 'input[type=submit]'   );
        this.el.email	   = this.element.find( 'input[name=email]'    );
        this.el.password   = this.element.find( 'input[name=password]' );
        
        // Error elements
        this.el.error	   = this.element.find( '.errormsg' );
        this.el.errorEmail = this.element.find( 'span'   );
        
        this.el.targets = $([]); // this.element.find('a');
    },
   _init: function() {
    	this.el.submit.bind("click", $.proxy(this.submit, this));
    	this.el.error.hide();
    },
    submit: function(e) {
    	e.preventDefault();
    	
    	var spinner = '<div class="spinner"/>';

		//cache jquery objects
		this.el.submit.attr( 'disabled', 'disabled' ).addClass( 'disabled' );
		this.element.append( spinner );
		
		//validate form for empty values
		if ( typeof this.el.email.val() === 'undefined' 
				|| this.el.email.val() === '' ) {
			this.el.email.parent().addClass( 'error' );
		} else {
			this.el.email.parent().removeClass( 'error' );
		}
		if ( typeof this.el.password.val() === 'undefined' 
				|| this.el.password.val() === '' ) {
			this.el.password.parent().addClass( 'error' );
		} else {
			this.el.password.parent().removeClass( 'error' );
		}
		
		//clear overlay and remove disabled state if any errors exsits
		if ( this.element.find('.error').length > 0 ) {
			this.el.submit.removeAttr( 'disabled' ).removeClass( 'disabled' );
		    this.element.find( '.spinner' ).remove();
		    return;
		}
		
		var ajax = this.options.action 
			+ '?email=' 	+ this.el.email.val() 
			+ '&password=' 	+ this.el.password.val();
		
		//ajax post to jsonp REST url
		$.ajax({
            url:  	  ajax,
            type:	  "GET",
            dataType: "jsonp",
            timeout:  10000,
            beforeSend: function( xhr ) {
            },
            success: $.proxy(function( json, xhr, status ) {
            	// A bit messy here. Needs to be refactored somewhat with mediamodal.js
            	var mediamodal = $('#DOMWindow').data('mediamodal');
    		    var successRedirect = ( mediamodal.onAuthSuccess != '' ) 
    		    	? mediamodal.onAuthSuccess : "http://fantasy.premierleague.com/my-team/";
    		    if ( $('#DOMWindow').length && $('#DOMWindow').is( ':visible' ) ) {
    		    	window.location = successRedirect;
    		    }
            }, this),
            error: $.proxy(function( xhr, status ) {
            	// Set error text to email entered
            	this.el.errorEmail.html( this.el.email.val() );
            	// Remove disabled attribute and spinner
            	this.el.submit.removeAttr( 'disabled' ).removeClass( 'disabled' );
            	this.element.find( '.spinner' ).remove();
            	// Show error
            	this.el.error.show();
            }, this)
        });
		
		return false;
	}
});