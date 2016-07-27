// Import subclass function
$.ui.tabs.subclass = $.ui.widget.subclass;

/**
 *  
 *  @attr  <root><ul><li><a ajax="">       explicit url to load via ajax, overrides options.ajaxRewrite
 *  @param {Function} options.ajaxRewrite  a function to convert the href url into an ajax url, default function adds .tab before .html
 */
$.ui.tabs.subclass('ui.pagetabs', {
    klass: "$.ui.tabs",
    options: {
		selectedHref: '',   // {String} [optional] load tab with selectedHref on load  
        ajaxOptions: {
            dataType: "html"
        },
        ajaxRewrite: function(url) { 
            return url && url.replace(/(\.tab)*\.html/, '.tab.html'); 
        }
    },
    _tabify: function(init) {
        this._super(init);
        
    	// _create() and _init() don't get called within ui.tabs for some reason 
        this.options = $.getAttributeHash( this.element, this.options );
        this.element.data("widget", this);
		
        // Auto-append the anchor tag to the browser location bar
        this.anchors.bind( "click.tabs", function(event) {
            var hash = this.getAttribute("href");
            $.setDocumentHash(hash); // Prevents page from scrolling
		});
        
        // Load up selectedHref if defined 
        if( this.options.selectedHref ) {
        	var selectedTab = this.anchors.filter('[href='+this.options.selectedHref+']');
        	if( selectedTab.length ) {
        		selectedTab.click();
        	} else {
        		console.warn(this.klass+":_tabify(): invalid options.selectedHref: ", this.options.selectedHref, ' - this: ', this);
        	}
        }
    },
    load: function( index ) {
        var i = this._getIndex( index );
		var a = this.anchors.eq(i)[0];

        if( !$.data(a, "load.original") ) {
            $.data(a, "load.original", $.data(a, "load.tabs")); // save original, also acts as onetime flag
            $.data(a, "load.tabs", this.options.ajaxRewrite( $.data(a, "load.tabs") ));
        }

        // Read <a ajax=""> attribute, overrides this.options.ajaxRewrite
        if( a.getAttribute("ajax") ) {
            $.data(a, "load.tabs", a.getAttribute("ajax"));
        }

        this._super(index);
    }
});
