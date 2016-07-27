
$.ui.widget.subclass('ui.expandlink', {
    klass: '$.ui.expandlink',
    options: {
        hash:         null     // {Hash}         define objects and arrays within the constructor, else it will create a class variable
    },

    create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
    },

    _init: function() {
        this.addHover();
        this.addClick();
    },

    
    addClick: function () {
    	$(this.element).bind('click',function(){
    		var dest = $(this).find('a:first').attr('href');
    		window.location.href = dest;
    		return false;
    	});
    },
    
    addHover: function(){
    	$(this.element).bind("mouseenter mouseout",function(event){
    		if (event.type == "mouseenter") {
    			$(this).addClass("hover");
    		} else {
    			$(this).removeClass("hover");
    		}
    	});
    }
});
