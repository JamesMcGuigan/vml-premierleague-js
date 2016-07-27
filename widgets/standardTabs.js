// TODO: this class should subclass tabs, rather than be a wrapper - James
$.ui.basewidget.subclass('ui.standardtabs', {
    klass: '$.ui.standardtabs',
    options: {
        hash:          null        // {Hash}         define objects and arrays within the constructor, else it will create a class variable
    },

    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
    },

    // Called from constructor after _create() – automatically calls this._super() before function
    _init: function() {
        this.addTabs(); 
    },
    addTabs: function() {
        //no options required at this point. Extend if required.
        $(this.element).tabs();
    }
    
});
