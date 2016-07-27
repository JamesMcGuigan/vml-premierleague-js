$.ui.basewidget.subclass('ui.slideshow', {
    klass: "$.ui.slideshow",
    options: {
        fadeClick:    0,   // {Number} milliseconds for fade when clicked
        fadeCycle:  500,   // {Number} milliseconds for fade when cycling
        cycleTime: 5000,   // {Number} milliseconds between fades
        clickCycleMultiplier: 1.5 // {Number} extra delay after clicking, before next cycle
    },
    required: {
        fadeClick: Number,
        fadeCycle: Number
    },
    position:      0,  // {Number} position of the currently selected image
    _eventCounter: 0,  // {Number} event counter
    
    _create: function() {
        this.el = {};
        this.el.imageWrapper = this.element.find(".image-wrapper");
        this.el.images       = this.el.imageWrapper.find(".image");
        this.el.buttons      = this.element.find(".buttons li");
    },
    _init: function() {
        var self = this;
        this.el.buttons.bind("mouseover", function() {
            // @context this refers to the li DOM node we clicked on
            var position = Number(this.getAttribute("position"));
            self.selectImage( position, self.options.fadeClick, self.options.cycleTime*self.options.clickCycleMultiplier );
            return false;
        });
        
        this.cycleLoop();
        //$.loggedInState();
    },
    cycleLoop: function( nextCycleTime ) {
        var self = this;
        if( this._cycleLoopTimeoutId ) {
            clearTimeout( this._cycleLoopTimeoutId );   
        }
        this._cycleLoopTimeoutId = setTimeout( function() {
            // self.cycleLoop(); // Called from within selectImage()
            self.selectNextImage( self.options.fadeCycle );
        }, nextCycleTime || this.options.cycleTime );       
    },
    stopCycleLoop: function() {
        if( this._cycleLoopTimeoutId ) {
            clearTimeout( this._cycleLoopTimeoutId );   
        }       
    },
    
    selectNextImage: function( fadeTime ) {
        var nextPosition = (this.position+1) % this.el.images.length;
        this.selectImage( nextPosition, fadeTime ); 
    },    
    selectImage: function( position, fadeTime, cycleTime ) {
        if( this.position != position ) {
            this.position = position;
            
            var oldImage = this.el.images.filter(":visible");
            var newImage = this.el.images.filter("[position='"+position+"']");          
            var button   = this.el.buttons.filter("[position='"+position+"']");
                
            // Highlight button on click
            this.el.buttons.removeClass("selected");
            button.addClass("selected");
            
            var _eventCounter = ++this._eventCounter; // fadeOut Semaphore 
            oldImage.fadeOut( fadeTime, $.proxy(function() {
                if( _eventCounter != this._eventCounter ) { return; } // Only fade in the last click
                
                newImage.fadeIn(fadeTime, $.proxy(function() {
                    this.cycleLoop( cycleTime );
                     
                    //// Highlight button after fadeOut
                    //this.el.buttons.removeClass("selected");
                    //button.addClass("selected");                  
                },this));
            }, this));
        }
    }    
});
