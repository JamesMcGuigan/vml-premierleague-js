$.ui.svgWidget.subclass('ui.svgCircleLabel', {
    klass: "$.ui.svgCircleLabel",
    options: {
		radius:			   40,
        color:             "",
        stroke:             "",
        rowName:         null,
        svgwidth:         140,
        labelOffset:       30,
        sliceLabelSize:    16,
        sliceLabelWeight: 700,
        sliceLabelColor:  "#ffffff"
    },
    _create: function() {
    },

    _init: function() {
        // We only want one row for this widget
        this.draw();
    },

    getInitHeight: function() {
        return Math.ceil( this.options.svgwidth + this.xy.origin.y*2 + this.options.labelOffset*1.5 );
    },
    getInitWidth: function() {
        return Math.ceil( this.options.svgwidth );
    },


    /**
     *  @return {Hash}  this.data
     */
    parseHtmlTable: function() {
        this.data = this._super();

        if( !this.options.rowName ) {
            this.options.rowName = this.element.attr("name") || this.element.find("th").text(); // Same as in _super()
        }
        return this.data;
    },
    parseOptions: function() {
        this._super();
        this.options.radius 		 = this.options.radius || this.options.svgwidth/2 - 4;
        this.options.sliceLabelColor = (this.options.color === this.options.sliceLabelColor) ? "#000000" : this.options.sliceLabelColor;
        return this.options;
    },
    calculateXY: function() {
        var o = this.options;
        var xy = this.xy = this.xy || {};

        xy.origin = { x: 0, y: 0 }; // Avoid cropping
        xy.circle = {
                x: this.getInitWidth()/2,
                y: this.getInitHeight()/2
            };
        xy.label = {
            x: this.getInitWidth()/2,
            y: this.getInitHeight() - this.getFontSize()*1.5
        };
        
        return xy;
    },

    draw: function() {
        this.drawCircle();
        this.drawLabel();
        this.table.hide();
    },
    drawCircle: function( ) {
    	var c = c || {};
    	c.radius     = c.radius     || this.options.radius; // Avoid cropping
        c.color		 = c.color		|| this.options.color;
        c.stroke	 = c.stroke     || this.options.stroke;
    	this.canvas.circle(
    		this.xy.circle.x,
    		this.xy.circle.y,
    		c.radius
    	).attr({
    		"stroke-width": 1, // Avoids sharp edges
            "stroke": c.stroke,
            "fill":   c.color
    	});
    	
    	var rowValue = Number( this.data.values[this.options.rowName][this.data.colNames[0]] );
        var label      = rowValue + "%";

        var sprite = this.canvas.text( this.xy.circle.x, this.xy.circle.y, label.toUpperCase() );
        sprite.attr( "fill",        this.options.sliceLabelColor );
        sprite.attr( "font-size",   this.options.sliceLabelSize );
        sprite.attr( "font-weight", this.options.sliceLabelWeight );

        this.sprite.sliceLabels = this.sprite.sliceLabels || [];
        this.sprite.sliceLabels.push( sprite );
        return sprite;
    }
});
