//----- js/widgets/jquery.svgWidget.js -----//

$.ui.basewidget.subclass('ui.svgWidget', {
    klass: "$.ui.svgWidget",
    options: {
        svgheight:     null,
        svgwidth:      null,
        showlabel:     true,
        showcollabel:  true,
        labelColor:    "#989898",
        labelSize:       10,
        labelWeight:    700
    },
                               // Note: Object literals declared here will shared between all instances
    data:    null,             // {Hash}
    xy:      null,             // {Hash}
    sprite:  null,             // {Hash<jQuery>} Namespace for all svg elements
    table:   null,             // {jQuery} Node representing the HTML table
    wrapper: null,             // {jQuery} Node representing the HTML wrapper div for the graphics
    canvas:  null,             // {Raphael}
    createdOwnWrapper: false,  // {Boolean}

    _create: function() {
        this.data   = {};
        this.xy     = {};
        this.sprite = {};

        this.getTableNode();
        this.data    = this.options.data || this.parseHtmlTable(); // parseHtmlTable() defined in basewidget.js
        this.options = $.getAttributeHash(this.element, this.options); // html overrides this.options
        this.parseOptions();
        this.calculateXY();
    },
    _init: function() {
        this.getCanvas();
    },
    draw: function() {
        $.noop();
    },

    /**
     *  Modifies this.options with various calculations
     */
    parseOptions: function() {
        var o = this.options;
        return o;
    },
    /**
     *  Creates this.xy for a coordinate mapping
     */
    calculateXY: function() {
        this.xy = this.xy || {};
        return this.xy;
    },



    //*** Init ***//

    /**
     *  The wrapper is the HTML div that defines positioning.
     *  It does not surround the HTML table but nesting can be achieved via an svgWrapper
     *  CSS: .svg-wrapper { positioning: relative  }
     *
     *  @return {jQuery}
     */
    getWrapper: function() {
        this.wrapper = this.wrapper || this.options.wrapper || this.getParentWrapper() || this.createWrapper();
        return this.wrapper;
    },
    getParentWrapper: function() {
        var closest = this.element.closest(".svg-wrapper");
        return closest.length ? closest : null;
    },
    createWrapper: function() {
        this.wrapper = $("<div class='svg-wrapper'></div>").insertBefore( this.getTableNode()[0] || this.element[0] ); // Create a new one
        this.createWrapperInit();
        return this.wrapper;
    },
    createWrapperInit: function() {
        //if( this.options.offset ) { // TODO: Do we need this line?
            this.wrapper.height( this.getInitHeight() ); // Canvas is position absolute so we need to explictly define wrapper size
            this.wrapper.width(  this.getInitWidth()  );
        //}
        this.wrapper.data("widget", this);
        this.createdOwnWrapper = true;
    },


    /**
     *  This is the Raphael canvas element, it sits inside the .svg-wrapper node
     *  It is offset from the parent svgWrapper through <node offset=""> via this.getWrapperOffsetX()
     *
     *  @return {Raphael}
     */
    getCanvas: function() {
        this.canvas = this.canvas || this.options.canvas || this.createCanvas() || null; // Don't use parent canvas
        return this.canvas;
    },
    getParentCanvas: function() {
        return this.getWrapper().data("canvas") || null;
    },
    createCanvas: function() {
        this.canvas = Raphael( this.getWrapper().get(0), this.getInitWidth(), this.getInitHeight() );
        this.canvas.realWidth  = this.getInitWidth();
        this.canvas.realHeight = this.getInitHeight();

        if( this.createdOwnWrapper ) {
            this.getWrapper().data("canvas", this.canvas);
        }
        if( this.options.offset ) {
            this.canvas.canvas.style.cssText = "position:absolute;"
                                             + "left:" + this.getWrapperOffsetX() + "px;"
                                             + "top:"  + this.getWrapperOffsetY() + "px;"
                                             + "z-index:" + $.ui.svgWidget.zIndex++;       // This fixes IE background rendering bug
        }

        this.drawBackground();
        this.drawBorder();
        return this.canvas;
    },



    //*** Getters ***//

    /**
     *  This gets the wrapper width/height which may be set by the parent svgWidget/svgWrapper
     *  This is used for calculating the offset when creating the canvas
     */
    getWrapperWidth: function() {
        return this.getWrapper().data("canvas").realWidth;
    },
    getWrapperHeight: function() {
        return this.getWrapper().data("canvas").realHeight;
    },

    /**
     *  This gets the width/height of the canvas drawing element
     *  @return {Number}
     */
    getCanvasWidth: function() {
        return this.getCanvas() && this.getCanvas().realWidth || null;
    },
    getCanvasHeight: function() {
        return this.getCanvas() && this.getCanvas().realHeight || null;
    },

    /**
     *  This calculates the width/height that a new canvas should be drawn at
     *  @return {Number}
     */
    getInitWidth: function() {
        if( !this.options.svgwidth ) {
            this.options.svgwidth = Number(this.options.svgwidth) || this.element.width();
        }
        return this.options.svgwidth;
    },
    getInitHeight: function() {
        if( !this.options.svgheight ) {
            this.options.svgheight = Number(this.options.svgheight) || this.element.height();
        }
        return this.options.svgheight;
    },

    /**
     *  This calcuates the offset from the parent canvas, based on from this.options.offset
     *  @return {Number}
     */
    getWrapperOffsetX: function( offsetString ) {
        offsetString = offsetString || this.options.offset || "";

        var offsetX = 0;
        var xmatch = offsetString.match(/(left|right|center)(:\s*(\d+))?/);
        if( xmatch ) {
            switch( xmatch[1] ) {
                default:       // follow through
                case "left":   offsetX += 0; break;
                case "center": offsetX += Math.floor(this.getWrapperWidth()/2 - this.getInitWidth()/2); break;
                case "right":  offsetX += Math.floor(this.getWrapperWidth()   - this.getInitWidth()  ); break;
            }
            if( typeof xmatch[3] !== "undefined" ) {
                switch( xmatch[1] ) {
                    default:       // follow through
                    case "left":   offsetX += Number(xmatch[3]); break;
                    case "center": offsetX += Number(xmatch[3]); break;
                    case "right":  offsetX -= Number(xmatch[3]); break;
                }
            }
        }
        return offsetX;
    },
    getWrapperOffsetY: function( offsetString ) {
        offsetString = offsetString || this.options.offset || "";

        var offsetY = 0;
        var ymatch = offsetString.match(/(top|bottom|middle)(:\s*([+-]?\d+))?/);
        if( ymatch ) {
            switch( ymatch[1] ) {
                default:       // follow through
                case "top":    offsetY += 0; break;
                case "middle": offsetY += Math.floor(this.getWrapperHeight()/2 - this.getInitHeight()/2); break;
                case "bottom": offsetY += Math.floor(this.getWrapperHeight()   - this.getInitHeight()  ); break;
            }
            if( typeof ymatch[3] !== "undefined" ) {
                switch( ymatch[1] ) {
                    default:       // follow through
                    case "top":    offsetY += Number(ymatch[3]); break;
                    case "middle": offsetY += Number(ymatch[3]); break;
                    case "bottom": offsetY -= Number(ymatch[3]); break;
                }
            }
        }
        return offsetY;
    },

    /**
     *  return {String}
     */
    getLabelText: function() {
        var text = this.data.label;
        if( this.options.showcollabel ) {
            text += "\n"
                 +  "( " + this.data.colNames.join(" / ") + " )";
        }
        text = text.toUpperCase();
        return text;
    },
    drawBackground: function() {
        if( this.options.svgbackground ) {
            this.canvas.rect( 0, 0, this.getCanvasWidth(), this.getCanvasHeight() )
                       .attr( "fill",   this.options.svgbackground )
                       .attr( "stroke", this.options.svgbackground )
                       .attr( "stroke-width", 0 )
                       .attr( "z-index", 0 );
        }
    },
    drawBorder: function() {
        if( this.options.svgborder ) {
            this.canvas.rect( 0, 0, this.getCanvasWidth(), this.getCanvasHeight() )
                       .attr( "stroke", this.options.svgborder )
                       .attr( "stroke-width", 1 )
                       .attr( "z-index", 0 );
        }
    },
    drawLabel: function() {
        if( this.options.showlabel ) {
            this.sprite.label = this.canvas.text( this.xy.label.x, this.xy.label.y, this.getLabelText() );
            this.sprite.label.attr({
                "font-size":   this.options.labelSize,
                "fill":        this.options.labelColor,
                "font-weight": this.options.labelWeight
            });
            return this.sprite.label;
        }
    }
});

$.ui.svgWidget.zIndex = 1;
