$.ui.svgWidget.subclass('ui.svgPieChart', {
    klass: "$.ui.svgPieChart",
    options: {
        radius:             0,
        insideRadius:       0,
        anticlockwise:  false,
        colors:            "",
        strokes:           "",
        rowName:         null,
        svgwidth:         140,
        labelOffset:       30,
        sliceLabelSize:    16,
        sliceLabelWeight: 700,
        sliceLabelColor:  "white",
        naTxt:			  "N/A",
        naColor:		  "#CCCCCC"
    },
    _create: function() {
    },

    _init: function() {
        // We only want one row for this widget
        this.drawPieChart();
        this.checkPieChart();
        this.drawLabel();
        this.table.hide();
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
        this.options.radius = this.options.radius || this.options.svgwidth/2 - 4;
        return this.options;
    },
    calculateXY: function() {
        var o = this.options;
        var xy = this.xy = this.xy || {};

        xy.origin = { x: 0, y: 0 }; // Avoid cropping
        xy.label = {
            x: this.getInitWidth()/2,
            y: this.getInitHeight() - this.getFontSize()*1.5
        };
        
        return xy;
    },
    drawPieChart: function( rowName ) {
        var sliceInfo = this.getSlices() 	|| {};
        var slices	  = sliceInfo.s 		|| {};
        var total	  = sliceInfo.total;
        
        if ( total > 0 ) {
	        for( var i=0, n=slices.length; i<n; i++ ) {
	            this.drawSlice( slices[i] );
	        }
	        // Ensure labels are always on top of slices
	        for( var i=0, n=slices.length; i<n; i++ ) {
	            this.drawSliceLabel( slices[i] );
	        }
        }
    },
    checkPieChart: function () {
    	// Just check if the total is 0 and draw circle as fallback
    	// Inefficient, but works
    	var runningTotal = 0;
        for( var i=0, n=this.data.colNames.length; i<n; i++ ) {
            var colName  = this.data.colNames[i];
            var rowValue = Number( this.data.values[this.options.rowName][colName] );
            runningTotal += rowValue;
        }
        if (runningTotal === 0) {
        	/**
        	 * drawCircle instead
        	 */
	    	var c = c || {};
	    	c.x			 = c.x			|| this.options.svgwidth/2 + this.xy.origin.x;
	    	c.y			 = c.y			|| this.options.svgwidth/2 + this.xy.origin.y;
	    	c.radius     = c.radius     || this.options.radius; // Avoid cropping
	        c.color		 = this.options.naColor;
	    	this.canvas.circle(
	    		c.x,
	    		c.y,
	    		c.radius
	    	).attr({
	    		"stroke-width": 1, // Avoids sharp edges
	            "stroke": c.color,
	            "fill":   c.color
	    	});
	    	
	        var label    = this.options.naTxt;
	        var sprite = this.canvas.text( c.x, c.y, label.toUpperCase() );
	        sprite.attr( "fill",        this.options.sliceLabelColor );
	        sprite.attr( "font-size",   this.options.sliceLabelSize );
	        sprite.attr( "font-weight", this.options.sliceLabelWeight );
	
	        this.sprite.sliceLabels = this.sprite.sliceLabels || [];
	        this.sprite.sliceLabels.push( sprite );
        }
    },
    getSlices: function() {
        var slices = [];
        var runningTotal = 0;
        for( var i=0, n=this.data.colNames.length; i<n; i++ ) {
            var colName  = this.data.colNames[i];
            var rowValue = Number( this.data.values[this.options.rowName][colName] );

            var label      = rowValue + "%";
            var startValue = runningTotal;
            var endValue   = runningTotal + rowValue;
            if( rowValue === 0 ) { startValue--; }
            if( rowValue === this.data.totals[ this.options.rowName ] ) { endValue--;   }

            var colors  = this.options.colors && this.options.colors.split(",");
            var color   = colors && colors[ i % colors.length ] || this.data.cols[colName].color;
            var strokes = this.options.strokes && this.options.strokes.split(",");
            var stroke  = strokes && strokes[ i % strokes.length ] || this.data.cols[colName].stroke;
            
            
            var sliceOptions = {
                startValue: startValue,
                endValue:   endValue, 
                label:      label,
                color:      color,
                stroke:		stroke,
                radius:     this.options.radius,
                inradius:   this.options.insideRadius,
                anticlock:  this.options.anticlockwise ? 1 : 0
            };
            slices.push( this.getSlice(sliceOptions) );
            runningTotal += rowValue;
        }
        return {s: slices, total: runningTotal};
    },

    /**
     *  @param {Hash}   s               Param hash, additional values will be returned
     *  @param {Number} s.startValue    [required] value slice should start from
     *  @param {Number} s.endValue      [required] value slice should end from
     *  @param {Number} s.radius        [override] radius of the slice
     *  @param {Number} s.inradius      [override] inside radius of the slice
     *  @param {Number} s.total         [override] what is considered 100%
     *  @param {Number} s.startAngle    [override] startAngle in radians
     *  @param {Number} s.endAngle      [override] endAngle in radians
     *  @param {Number} s.cx            [override] x center of the circle
     *  @param {Number} s.cy            [override] y center of the circle
     */
    getSlice: function( s ) {
        s = s || {};

        console.assert( typeof s.startValue === "number", this.klass+":getSlice(", s ,"): s.startValue is ", typeof s.startValue );
        console.assert( typeof s.endValue   === "number", this.klass+":getSlice(", s ,"): s.endValue is ",   typeof s.endValue );

        // Note all angles in radians. circle = 2 pi radians
        s.total      = s.total      || this.data.totals[ this.options.rowName ];
        s.radius     = s.radius     || this.options.svgwidth/2 - 4; // Avoid cropping
        s.inradius   = s.inradius   || 0;
        s.startAngle = s.startAngle || (s.startValue / s.total) * Math.PI*2;
	    s.endAngle   = s.endAngle   || (s.endValue   / s.total) * Math.PI*2;
        s.cx         = s.cx         || this.options.svgwidth/2 + this.xy.origin.x;
        s.cy         = s.cx         || this.options.svgwidth/2 + this.xy.origin.y;

        if( s.startAngle > Math.PI*2 ) {
            s.startAngle = s.startAngle % (Math.PI*2);
        }
        if( s.endAngle > Math.PI*2 ) {
            s.endAngle = s.endAngle % (Math.PI*2);
        }
        
        if( s.anticlock ) {
            s.startAngle = -s.startAngle;
            s.endAngle   = -s.endAngle;
        }

        s.angle       = s.endAngle - s.startAngle;
        s.midAngle    = s.startAngle + s.angle/2;
        s.isLargeArc  = Math.abs(s.angle) > Math.PI ? 1 : 0;
        s.sweep       = Number( !!s.anticlock );
        s.antisweep   = Number(  !s.anticlock );

        s.x1  = Math.round( s.cx - s.radius   * Math.sin(s.startAngle) );
        s.x2  = Math.round( s.cx - s.radius   * Math.sin(s.endAngle  ) );
        s.ix1 = Math.round( s.cx - s.inradius * Math.sin(s.startAngle) );
        s.ix2 = Math.round( s.cx - s.inradius * Math.sin(s.endAngle  ) );
        //s.xm  = Math.round( s.cx - s.radius/2 * Math.sin(s.midAngle  ) );
        s.xm = Math.round( s.cx - (s.inradius + (s.radius-s.inradius)/2) * Math.sin(s.midAngle) );

        s.y1  = Math.round( s.cy - s.radius   * Math.cos(s.startAngle) );
        s.y2  = Math.round( s.cy - s.radius   * Math.cos(s.endAngle  ) );
        s.iy1 = Math.round( s.cy - s.inradius * Math.cos(s.startAngle) );
        s.iy2 = Math.round( s.cy - s.inradius * Math.cos(s.endAngle  ) );
        //s.ym  = Math.round( s.cy - s.radius/2 * Math.cos(s.midAngle  ) );
        s.ym  = Math.round( s.cy - (s.inradius + (s.radius-s.inradius)/2) * Math.cos(s.midAngle) );


        // Presentation Hack - Vertical align labels if both sides between 44% and 56%
        if( this.data.colNames.length == 2 
         && Math.abs(s.angle) > Math.PI * 7/8
         && Math.abs(s.angle) < Math.PI * 9/8
        ) {
            s.ym = s.cy;
        }

        return s;
    },

    /**
     *  @see http://www.w3.org/TR/SVG/paths.html#PathData
     *  @see https://github.com/DmitryBaranovskiy/g.raphael/raw/master/g.pie.js
     *  @param  {Hash}    slice  this.getSlice( startValue, endValue )
     *  @return {Raphael}
     */
    drawSlice: function( slice ) {
        var s = slice;
        var path = [];
        if( s.inradius ) {
            path = [
                "M", s.x1,  s.y1,                                                         // Line to outside
                "A", s.radius,   s.radius,   0, s.isLargeArc, s.sweep,     s.x2, s.y2,    // Arc outside 
                "L", s.ix2, s.iy2,                                                        // Line to inside
                "A", s.inradius, s.inradius, 0, s.isLargeArc, s.antisweep, s.ix1, s.iy1,  // Arc inside
                "M", s.x1,  s.y1,                                                         // Line to outside
                "Z"                                                                       // Close
            ];
        } else {
            path = [
                "M", s.cx, s.cy,                                                          // Move
                "L", s.x1, s.y1,                                                          // Line
                "A", s.radius, s.radius,     0, s.isLargeArc, s.sweep,     s.x2, s.y2,    // Arc: (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
                "Z"                                                                       // Close
            ];
        }

        // Draw
        var sprite = this.canvas.path(path);
        sprite.attr({
            "stroke-width": 1, // Avoids sharp edges
            "stroke": s.stroke,
            "fill":   s.color
        });

        // Housekeep
        this.sprite.slices = this.sprite.slices || [];
        this.sprite.slices.push( sprite );

        return sprite;
    },
    drawSliceLabel: function( slice ) {
        var sprite = this.canvas.text( slice.xm, slice.ym, slice.label.toUpperCase() );
        var labelColor = (slice.color === "#FFFFFF" || slice.color === "#ffffff" || slice.color === "white") 
        	? "#000000" : this.options.sliceLabelColor;
        sprite.attr( "fill",        labelColor );
        sprite.attr( "font-size",   this.options.sliceLabelSize );
        sprite.attr( "font-weight", this.options.sliceLabelWeight );

        this.sprite.sliceLabels = this.sprite.sliceLabels || [];
        this.sprite.sliceLabels.push( sprite );
        return sprite;
    }
});
