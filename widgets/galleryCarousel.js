/**
 * @example
 *  <div class="galleryCarousel" widget="galleryCarousel">
 *      <ul widget="listToCarousel" visible="1" id="gallerydir_<%=uuid+1%>"> </ul>
 *      <ul widget="listToCarousel" visible="6" scroll="6" wrap="circular" id="#gallerydir_<%=uuid+2%>" class="thumbs"> </ul>
 *  </div>
 *
 *  @see /jcr_root/etc/designs/premierleague/exlibs/js/jquery.jcarousel.js
 *  @see /jcr_root/etc/designs/premierleague/exlibs/js/jquery.jcarousel.extensions.js
 */
$.ui.basewidget.subclass('ui.galleryCarousel', {
    klass: '$.ui.galleryCarousel',
    options: {
        childWidgetSelector: "*[widget=listToCarousel]"
    },
    required: {
        childWidgetSelector: String
    },
    _create: function() {
        this.el.carousels     = this.element.find(this.options.childWidgetSelector);
        this.el.imageCarousel = this.el.carousels.eq(0);
        this.el.thumbCarousel = this.el.carousels.eq(1);

        if( this.el.carousels.length != 2 ) {
            console.warn(this.klass+":_create() - options.childWidgetSelector = ", this.options.childWidgetSelector, " needs to match exactly 2 nodes. this.el.carousels = ", this.el.carousels );
        }
    },
    _init: function() {
        // Wait for child widgets to initalize before continuing
        setTimeout($.proxy(this.__init, this), 0);
    },
    __init: function() {
        try {
            // Remember that we need .data("widget").jcarousel to access the jcarousel object
            this.imageWidget = this.el.imageCarousel.data("widget");
            this.thumbWidget = this.el.thumbCarousel.data("widget");
            this.imageCarousel = this.imageWidget.jcarousel;
            this.thumbCarousel = this.thumbWidget.jcarousel;
            
            this.addHighlightHandler();
            this.addThumbClickHandler();
            this.addViewScrollHandler();
            this.addCaptionSlideOnHover();
        } catch(e) {
            console.error(this.klass,":__init(): exception: ", e );
        }
    },

    /**
     * onClick for thumb LI should scroll the imageWidget 
     */
    addThumbClickHandler: function() {
        var self = this;
        this.thumbCarousel.getLIs().each(function(index, node) {
            $(this).bind("click", function() {
                var index = $.jcarousel.getIndexOfNode(this);
                self.imageCarousel.scroll(    index, true );
                self.thumbCarousel.highlight( index, true );
            });
        });
    },
    addHighlightHandler: function() {
        var self = this;
        var _imageCarouselScroll = this.imageCarousel.scroll;
        this.imageCarousel.scroll = function(index, animate) {
            _imageCarouselScroll.apply(this, arguments);
            self.thumbCarousel.highlight(index);
        };
        this.thumbCarousel.highlight(this.thumbCarousel.options.start);
    },
    addViewScrollHandler: function() {
        var self = this;
        var _imageCarouselScroll = this.imageCarousel.scroll;
        this.imageCarousel.scroll = function(index, animate) {
            _imageCarouselScroll.apply(this,arguments);

            if( index < self.thumbCarousel.first ) {
                if( index < self.thumbCarousel.first - self.thumbCarousel.options.scroll ) {
                    self.thumbCarousel.scroll(index);
                } else {
                    self.thumbCarousel.scroll(self.thumbCarousel.first - self.thumbCarousel.options.scroll);
                }
            } else if( index > self.thumbCarousel.last ) {
                self.thumbCarousel.scroll(index);
            }
        };
    },

    addCaptionSlideOnHover: function() {
        // Logic:
        // Mouseover LI or .overlay - slideUp if hidden or queue slideUp if slidingDown
        // Mouseout  LI or .overlay - slideDown if fully up, check mouseout:li isn't really a mouseover:.overlay

        var self = this;
        self._overlayMouseoutId    = null;
        self._overlayMouseoverId   = null;
        self._overlayAnimatingUp   = false;
        self._overlayAnimatingDown = false;
        this.imageCarousel.getLIs().bind("mouseover", function(event) {
            clearTimeout( self._overlayMouseoutId  );  // kill bubbling mouseout event
            clearTimeout( self._overlayMouseoverId );  // kill duplicate mouseover event

            var overlay = $(this).find(".overlay");
            self._overlayMouseoverId = setTimeout(function() { // create a new thread, for visual smoothness
                if( overlay.is(":hidden") && !self._overlayAnimatingUp ) {
                    self._overlayAnimatingUp = true;
                    overlay.effect("slide", {direction: "down", mode: "show"}, "normal", function() {
                        self._overlayAnimatingUp = false;
                    });
                }
            }, 100);
        });
        this.imageCarousel.getLIs().bind("mouseout", function(event) {
            var overlay = $(this).find(".overlay");
            self._overlayMouseoutId = setTimeout(function() { // check for non-bubbling mouseout event
                if( overlay.is(":visible") && !self._overlayAnimatingDown ) {
                    self._overlayAnimatingDown = true;
                    overlay.effect("slide", {direction: "down", mode: "hide"}, "slow", function() {
                        self._overlayAnimatingDown = false;
                    });
                }
            }, 100);
        });
    }
    
});

