$.ui.svgWidget.subclass('ui.svgLineChart', {
    klass: "ui.svgLineChart",
    options: {
        colorViewport: '#f3f8fb',
        colorGrid:     '#c7d0d7',
        colorSquare:   {},         // {Hash}   color for squares, { default:, WON:, DRAWN:, LOST: }, defaults to line color
        colorLine:     '#999',     // {String} color for line,    overridden by this.data.row[].color
        rangeXmin:  0,             // {Number} viewport min X: 0,  "auto-0.5"
        rangeXmax:  38,            // {Number} viewport max X: 38, "auto+0.5"
        rangeYmin:  0,             // {Number} viewport min Y
        rangeYmax:  20,            // {Number} viewport max Y
        gridUnitX:  1,             // {Number}
        gridUnitY:  0,             // {Number}
        labelUnitX: 5,             // {Number}
        labelUnitY: 0,             // {Number}
        lowestYValue:  null,       // {Number}  if set, autocalculate rangeYmin, rangeYmin, gridUnitY, labelUnitY
        highestYValue: null,       // {Number}  if set, autocalculate rangeYmin, rangeYmin, gridUnitY, labelUnitY
        labelX:     [],            // {Array}   Explicit entries to label
        labelY:     [],            // {Array}   Explicit entries to label
        invertX:    false,         // {Boolean} Invert the graph on X
        invertY:    true,          // {Boolean} Invert the graph on Y
        squareSize: 4,             // {Number}  pixels for each dot
        datapoint:  "midpoint"     // {String}  "line" or "midpoint"
    },
    required: {
        colorViewport: String,
        colorGrid:     String,
        rangeXmin:  /^(\d+|auto|(auto)?[+-]?\d*\.?\d+)$/,
        rangeXmax:  /^(\d+|auto|(auto)?[+-]?\d*\.?\d+)$/,
        rangeYmin:  /^(\d+|auto|(auto)?[+-]?\d*\.?\d+)$/,
        rangeYmax:  /^(\d+|auto|(auto)?[+-]?\d*\.?\d+)$/,
        gridUnitX:  Number,
        gridUnitY:  Number,
        labelUnitX: Number,
        labelUnitY: Number,
        labelX:     Array,
        labelY:     Array,
        invertX:    Boolean,
        invertY:    Boolean,
        squareSize: Number,
        datapoint: ["line", "midpoint"]
    },
    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    parseHtmlTable: function() {
        var data = this._super();
        data.rowLabel = data.label.toUpperCase().split(/\s*\/\s*/)[0];
        data.colLabel = data.label.toUpperCase().split(/\s*\/\s*/)[1];
        return data;
    },
    parseOptions: function() {
        // Parse "auto" within rangeYmin, rangeYmax, rangeXmin, rangeXmax
        if( String(this.options.rangeYmin).match(/^auto[-+\d.]*$/) ) {
            this.options.rangeYmin = eval( this.options.rangeYmin.replace(/auto/, this.data.stats.min) );
        }
        if( String(this.options.rangeYmax).match(/^auto[-+\d.]*$/) ) {
            this.options.rangeYmax = eval( this.options.rangeYmax.replace(/auto/, this.data.stats.max) );
        }
        if( String(this.options.rangeXmin).match(/^auto[-+\d.]*$/) ) {
            this.options.rangeXmin = eval( this.options.rangeXmin.replace(/auto/, Math.min.apply(null, this.data.colNames) ) );
        }
        if( String(this.options.rangeXmax).match(/^auto[-+\d.]*$/) ) {
            this.options.rangeXmax = eval( this.options.rangeXmax.replace(/auto/, Math.max.apply(null, this.data.colNames)) );
        }

        // Ensure that specified data range actually covers given data
        if( this.options.rangeYmin > this.data.stats.min ) { console.error(this.klass,":parseOptions() - this.options.rangeYmin: ", this.options.rangeYmin, " > this.data.stats.min: ", this.data.stats.min ); }
        if( this.options.rangeYmax < this.data.stats.max ) { console.error(this.klass,":parseOptions() - this.options.rangeYmax: ", this.options.rangeYmax, " < this.data.stats.max: ", this.data.stats.max ); }
        this.options.rangeYmin = Math.min( this.options.rangeYmin, this.data.stats.min );
        this.options.rangeYmax = Math.max( this.options.rangeYmax, this.data.stats.max );

        switch( this.options.datapoint ) {
            case "line":
                break;
            case "midpoint":
                this.options.rangeXmin -= 0.5;
                this.options.rangeXmax += 0.5;
                this.options.rangeYmin -= 0.5;
                this.options.rangeYmax += 0.5;
                break;
            default:
                break;
        }

        if( this.options.invertX ) {
            this.options.rangeXmin = this.options.rangeXmin * -1;
            this.options.rangeXmax = this.options.rangeXmax * -1;
        }
        if( this.options.invertY ) {
            this.options.rangeYmin = this.options.rangeYmin * -1;
            this.options.rangeYmax = this.options.rangeYmax * -1;
        }


        // Ensure min is less than max
        if( this.options.rangeXmin > this.options.rangeXmax ) {
            var rangeXmin = this.options.rangeXmin;
            var rangeXmax = this.options.rangeXmax;
            this.options.rangeXmin = rangeXmax;
            this.options.rangeXmax = rangeXmin;
        }
        if( this.options.rangeYmin > this.options.rangeYmax ) {
            var rangeYmin = this.options.rangeYmin;
            var rangeYmax = this.options.rangeYmax;
            this.options.rangeYmin = rangeYmax;
            this.options.rangeYmax = rangeYmin;
        }


        // Define rangeXY as diff between min and max
        this.options.rangeX = this.options.rangeXmax - this.options.rangeXmin;
        this.options.rangeY = this.options.rangeYmax - this.options.rangeYmin;

        // Ensure we are not trying to graph a range of 0 
        while( this.options.rangeX < 4 ) {
            this.options.rangeX = ++this.options.rangeXmax - this.options.rangeXmin;
        }
        while( this.options.rangeY < 4 ) {
            this.options.rangeY = ++this.options.rangeYmax - this.options.rangeYmin;
        }

        // Auto calculate our grid and label unit spacing
        // calculateXY() will double the labelUnit if its less that getFontSize()*1.25
        var gridSpacings = [100,50,20,10,5,2,1];
        if( this.options.gridUnitX === 0 ) {
            for( var i=0, n=gridSpacings.length; i<n; i++ ) {
                this.options.gridUnitX  = gridSpacings[i];
                this.options.labelUnitX = gridSpacings[i]; // Updated in calculateXY()
                if( this.options.rangeX / gridSpacings[i] > 60 ) { break; }
            }
        }
        if( this.options.gridUnitY === 0 ) {
            for( var i=0, n=gridSpacings.length; i<n; i++ ) {
                this.options.gridUnitY  = gridSpacings[i];
                this.options.labelUnitY = gridSpacings[i]; // Updated in calculateXY()
                if( this.options.rangeY / gridSpacings[i] > 20 ) { break; }
            }
        }
        this.options.gridUnitX  = this.options.gridUnitX  || 1;
        this.options.labelUnitX = this.options.labelUnitX || 1;
        this.options.gridUnitY  = this.options.gridUnitY  || 1;
        this.options.labelUnitY = this.options.labelUnitY || 1;
    },
    calculateXY: function() {
        this._super();
        this.xy = this.xy || {};
        this.xy.viewport = {
            top:    this.getFontSize(),
            left:   Math.round( this.getFontSize()*3.5 ), // Needs a bigger margin due to viewport resizing below
            base:   Math.round( this.getInitHeight() - this.getFontSize()*2.5 ),
            right:  Math.round( this.getInitWidth()  - 2 )
        };
        this.xy.viewport.width  = Math.round( this.xy.viewport.right - this.xy.viewport.left );
        this.xy.viewport.height = Math.round( this.xy.viewport.base  - this.xy.viewport.top  );

        this.xy.valueSpacing = {
            x: this.xy.viewport.width  / this.options.rangeX,
            y: this.xy.viewport.height / this.options.rangeY
        };
        this.xy.gridSpacing = {
            x: this.xy.valueSpacing.x * this.options.gridUnitX,
            y: this.xy.valueSpacing.y * this.options.gridUnitY
        };

        // This really should be part of this.parseOptions(), but we need access to this.xy.valueSpacing
        while( this.xy.valueSpacing.x * this.options.labelUnitX < this.getFontSize()*1.25 ) {
            this.options.labelUnitX = this.options.labelUnitX * 2;
        }
        while( this.xy.valueSpacing.y * this.options.labelUnitY < this.getFontSize()*1.25 ) {
            this.options.labelUnitY = this.options.labelUnitY * 2;
        }

        //// Resize off the viewport to exactly fit the grid
        //this.xy.viewport.left   = this.xy.viewport.right - (this.xy.valueSpacing.x * this.options.rangeX);
        //this.xy.viewport.base   = this.xy.viewport.top   + (this.xy.valueSpacing.y * this.options.rangeY);
        //this.xy.viewport.width  = Math.round( this.xy.viewport.right - this.xy.viewport.left );
        //this.xy.viewport.height = Math.round( this.xy.viewport.base  - this.xy.viewport.top  );

        // Define Labels
        this.xy.label = {};
        this.xy.label.rowNumber = { x: this.xy.viewport.left - this.getFontSize()   };
        this.xy.label.rowTitle  = { x: this.xy.viewport.left - this.getFontSize()*2 };
        this.xy.label.colNumber = { y: this.xy.viewport.base + this.getFontSize()   };
        this.xy.label.colTitle  = { y: this.xy.viewport.base + this.getFontSize()*2 };

        // Define the origin
        this.xy.valueOrigin = {};
        switch( this.options.invertX ) {
                 case true:  this.xy.valueOrigin.x = Math.round( this.xy.viewport.left - this.xy.valueSpacing.x * this.options.rangeXmin ); break;
        default: case false: this.xy.valueOrigin.x = Math.round( this.xy.viewport.left - this.xy.valueSpacing.x * this.options.rangeXmin ); break;
        }
        switch( this.options.invertY ) {
                 case true:  this.xy.valueOrigin.y = Math.round( this.xy.viewport.base + this.xy.valueSpacing.y * this.options.rangeYmin ); break;
        default: case false: this.xy.valueOrigin.y = Math.round( this.xy.viewport.base + this.xy.valueSpacing.y * this.options.rangeYmin ); break;
        }
        if( this.options.invertX ) { this.options.labelX = $.map( this.options.labelX, function(x) { return -x; } ); }
        if( this.options.invertY ) { this.options.labelY = $.map( this.options.labelY, function(y) { return -y; } ); }

        switch( this.options.datapoint ) {
            case "line":
                this.xy.gridOrigin  = this.xy.valueOrigin;
                break;
            case "midpoint":
                this.xy.gridOrigin = {};
                this.xy.gridOrigin.x = Math.round( this.xy.valueOrigin.x - this.xy.gridSpacing.x/2 );
                this.xy.gridOrigin.y = Math.round( this.xy.valueOrigin.y - this.xy.gridSpacing.y/2 );
                break;
            default:
                console.error(this.klass+":parseXY() - invalid this.options.datapoint: ", this.options.datapoint);
        }


        this.xy.points = {};
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];
            this.xy.points[rowName] = {};
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                var colName = this.data.colNames[j];

                var x = this.xy.valueOrigin.x + this.xy.valueSpacing.x * Number(colName)                    * (this.options.invertX ? -1 : 1);
                var y = this.xy.valueOrigin.y - this.xy.valueSpacing.y * this.data.values[rowName][colName] * (this.options.invertY ? -1 : 1);
                this.xy.points[rowName][colName] = { x: x, y: y };
            }
        }
        this.makePointsNonOverlapping();
        return this.xy;
    },

    /**
     *  Modifies this.xy.points inline, side shifts any overlapping points
     */
    makePointsNonOverlapping: function() {

        // Create mapping of overlapping points
        var pointHash = {};
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                var colName = this.data.colNames[j];

                var point = this.xy.points[rowName][colName];
                var hash  = point.x + ":" + point.y;
                if( !pointHash[hash] ) { pointHash[hash] = []; }
                pointHash[hash].push( point );
            }
        }
            
        // Adjust those that are overlapping
        var squareSize = this.options.squareSize;
        for( var hash in pointHash ) {
            switch( pointHash[hash].length ) {
                case 0:
                case 1:
                    // [0]
                    $.noop();
                    break; 
                case 2:
                    // [0][1]
                    pointHash[hash][0].x -= squareSize/2;
                    pointHash[hash][1].x += squareSize/2;
                    break;
                case 3: 
                    // [0][1][2]
                    pointHash[hash][0].x -= squareSize;
                    pointHash[hash][1].x += 0;
                    pointHash[hash][2].x += squareSize;
                    break;
                case 4:
                    // [2][3]
                    // [0][1]
                    pointHash[hash][0].x -= squareSize/2;
                    pointHash[hash][0].y -= squareSize/2;
                    pointHash[hash][1].x += squareSize/2;
                    pointHash[hash][1].y -= squareSize/2;
                    pointHash[hash][2].x -= squareSize/2;
                    pointHash[hash][2].y += squareSize/2;
                    pointHash[hash][3].x += squareSize/2;
                    pointHash[hash][3].y += squareSize/2;
                    break;
                case 5:
                    //    [4]
                    // [0][1][2]
                    //    [3]
                    pointHash[hash][0].x -= squareSize;
                    pointHash[hash][1].x += 0;
                    pointHash[hash][2].x += squareSize;
                    pointHash[hash][3].y -= squareSize;
                    pointHash[hash][4].y += squareSize;
                    break;
                default: 
                    console.warn(this.klass,":makePointsNonOverlapping(): too many points: pointHash[hash].length ", pointHash[hash].length );
                    // follow through
                case 6:
                    // [3][4][5]
                    // [0][1][2]
                    pointHash[hash][0].x -= squareSize;
                    pointHash[hash][0].y -= squareSize/2;
                    pointHash[hash][1].x += 0;
                    pointHash[hash][1].y -= squareSize/2;
                    pointHash[hash][2].x += squareSize;
                    pointHash[hash][2].y += squareSize/2;
                    
                    pointHash[hash][3].x -= squareSize;
                    pointHash[hash][3].y += squareSize/2;
                    pointHash[hash][4].x += 0;
                    pointHash[hash][4].y += squareSize/2;
                    pointHash[hash][5].x += squareSize;
                    pointHash[hash][5].y += squareSize/2;
                    break;
            }
        }
    },
    draw: function() {
        this.drawViewport();
        this.drawGrid();
        this.drawGridLabels();
        this.drawData();
        this.addEventHandlers();
        this.table.hide();
    },
    drawViewport: function() {
        this.canvas.rect( this.xy.viewport.left, this.xy.viewport.top, this.xy.viewport.width, this.xy.viewport.height )
            .attr({
                "fill":   this.options.colorViewport,
                "stroke": this.options.colorGrid,
                "stroke-width": 1
            });
    },
    drawGrid: function() {
        var gridPath = ["M", 0, 0];

        // We need to center on grid origin, and space by gridSpacing, but only rendering within the viewport
        // HACK: Do the loop twice, starting from the origin. In theory we should be able to do this a single loop
        for( var y = this.xy.gridOrigin.y; y > this.xy.viewport.top+2;  y = Number(y - this.xy.gridSpacing.y) ) {   // bottom to top
            if( y >= this.xy.viewport.base ) { continue; } // don't draw outside viewport
            gridPath.push([ "M", this.xy.viewport.left, Number(y), "L", this.xy.viewport.right, Number(y)  ]);
        }
        for( var y = this.xy.gridOrigin.y; y < this.xy.viewport.base-2; y = Number(y + this.xy.gridSpacing.y) ) {   // bottom to top
            if( y <= this.xy.viewport.top ) { continue; } // don't draw outside viewport
            gridPath.push([ "M", this.xy.viewport.left, Number(y), "L", this.xy.viewport.right, Number(y)  ]);
        }

        for( var x = this.xy.gridOrigin.x; x < this.xy.viewport.right-2; x = Number(x + this.xy.gridSpacing.x) ) { // left to right
            if( x <= this.xy.viewport.left ) { continue; } // don't draw outside viewport
            gridPath.push([ "M", Number(x), this.xy.viewport.top, "L", Number(x), this.xy.viewport.base  ]);
        }
        for( var x = this.xy.gridOrigin.x; x > this.xy.viewport.left-2;  x = Number(x - this.xy.gridSpacing.x) ) { // left to right
            if( x >= this.xy.viewport.right ) { continue; } // don't draw outside viewport
            gridPath.push([ "M", Number(x), this.xy.viewport.top, "L", Number(x), this.xy.viewport.base  ]);
        }
        this.canvas.path( gridPath ).attr({
            "stroke": this.options.colorGrid,
            "stroke-width": 0.5
        });
    },
    drawGridLabels: function() {
        var render = { x: [], y: [] };

        // Out range should center on 0
        var moduloXmin = this.options.rangeXmin - this.options.rangeXmin % this.options.labelUnitX;
        var moduloYmin = this.options.rangeYmin - this.options.rangeYmin % this.options.labelUnitY;

        // Calculate which labels we will display, this.options.labelXY + (rangeXYmin -> rangeXYmax)
        for( var i=0; i<this.options.labelX.length; i++                              ) { render.x.push( this.options.labelX[i] ); }
        for( var i=moduloXmin; i<=this.options.rangeXmax; i+=this.options.labelUnitX ) { render.x.push( i ); }
        for( var i=0; i<this.options.labelY.length; i++                              ) { render.y.push( this.options.labelY[i] ); }
        for( var i=moduloYmin; i<=this.options.rangeYmax; i+=this.options.labelUnitY ) { render.y.push( i ); }

        // Render Labels
        for( var i=0, n=render.x.length; i<n; i++ ) {
            var colValue  = Number( render.x[i] );
            var colText   = colValue * (this.options.invertX ? -1 : 1 );
            if( colValue < this.options.rangeXmin ) { continue; }
            var colOffset = this.xy.valueOrigin.x + this.xy.valueSpacing.x * colValue;
            this.canvas.text( colOffset, this.xy.label.colNumber.y, colText );
        }
        for( var i=0, n=render.y.length; i<n; i++ ) {
            var rowValue  = Number( render.y[i] );
            var rowText   = rowValue * (this.options.invertY ? -1 : 1 );
            if( rowValue < this.options.rangeYmin ) { continue; }
            var rowOffset = this.xy.valueOrigin.y - this.xy.valueSpacing.y * rowValue;
            this.canvas.text( this.xy.label.rowNumber.x, rowOffset, rowText );
        }

        // Render Titles
        this.canvas.text( this.xy.label.rowTitle.x, this.xy.viewport.top + this.xy.viewport.height/2, this.data.rowLabel ).attr("font-weight", 700).rotate(-90);
        this.canvas.text( this.xy.viewport.left + this.xy.viewport.width/2, this.xy.label.colTitle.y, this.data.colLabel ).attr("font-weight", 700);
    },
    drawData: function() {
        this.sprite.points = {};
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName    = this.data.rowNames[i];  
            var lineColor  = this.data.rows[rowName].color || this.options.colorLine;
            var squareSize = this.options.squareSize;
            
            var squares = [];
            var linePath = [];
            this.sprite.points[rowName] = {};

            var lastX = 0;
            var lastY = 0;
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                var colName     = this.data.colNames[j];
                var result      = this.data.cells[rowName][colName].result;
                var squareColor = this.options.colorSquare[result] || this.options.colorSquare['default'] || lineColor;
                
                var x = this.xy.points[rowName][colName].x;
                var y = this.xy.points[rowName][colName].y;
                var squareX = x - this.options.squareSize/2;
                var squareY = y - this.options.squareSize/2;

                if( linePath.length ) {
                    linePath.push([ "L", lastX, lastY, x, y ]);
                } else {
                    linePath.push([ "M", x, y ]);
                }

                // Backing Square
                if( $.browser.msie ) {
	                squares.push({ 
	                	x:      squareX-squareSize, 
	                	y:      squareY-squareSize, 
	                	width:  squareSize*3, 
	                	height: squareSize*3, 
	                	fill:   "none", 
	                	stroke: "none", 
	                	"stroke-width": 0,
	                	rowName: rowName,
	                	colName: colName
	                });
                }
                // Foreground Squares - rendered after line 
                squares.push({ 
                	x:      squareX, 
                	y:      squareY, 
                	width:  this.options.squareSize, 
                	height: this.options.squareSize, 
                	fill:   squareColor, 
                	stroke: squareColor, 
                	"stroke-width": 1,
                	rowName: rowName,
                	colName: colName
                });
                
                lastX = x;
                lastY = y;
            }
            
            // Render
            this.canvas.path(linePath).attr({
                "stroke": lineColor,
                "stroke-width": 1
            });
            
            for( var k=0, o=squares.length; k<o; k++) {
            	var square = squares[k];
            	var rect = this.canvas.rect( square.x, square.y, square.width, square.height );
            	rect.attr({
        			"fill":         square.fill,
                    "stroke":       square.stroke,
                    "stroke-width": square["stroke-width"]
                });
            	this.sprite.points[square.rowName][square.colName] = rect;
            }

        }
    },
    addEventHandlers: function() {
        for( var rowName in this.sprite.points ) {
            for( var colName in this.sprite.points[rowName] ) {
                this.sprite.points[rowName][colName].hover(
                    $.proxy( this.onHover, this, this.data.cells[rowName][colName] ),
                    $.proxy( this.unHover, this, this.data.cells[rowName][colName] )
                );
            }
        }
    },
    onHover: function( cell, event ) {
        //console.log('DEBUG: ', this&&this.klass||'' ,' onHover: function( event ) { ',  event);
    },
    unHover: function( cell, event ) {
        //console.log('DEBUG: ', this&&this.klass||'' ,' unHover: function( event ) { ',  event);
    }
});






$.ui.svgLineChart.subclass('ui.svgLineChartTooltip', {
    klass: "ui.svgLineChartTooltip",
    options: {
        ajaxUrlExample: "",
        tooltip: {
            width:   165,
            height:  60,
            tipSize: 10,
            border:     '#ccc',
            background: '#fff'
        }
    },
    tooltip: null,                 // {Raphael.set} set of sprites comprising the tooltip
    spinner: null,                 // {Raphael.set} nodes representing the spinner
    parentWidget: null,            // {Widget}      parent widget - contains logo url info
    


    //***** Init *****//

    _init: function() {
        this.parentWidget = this.element.parents("[widget]").first().data("widget");
        this.tooltip = this.getCanvas().set();
        this.spinner = this.getCanvas().set();
    },
    bindBodyClickEvent: function( tooltip ) {
        $(document.body).unbind("click.bodyClickEvent");
        $(document.body).bind("click.bodyClickEvent", $.proxy(this._onBodyClickEvent, this, tooltip) );
    },
    unbindBodyClickEvent: function() {
        $(document.body).unbind("click.bodyClickEvent");
    },


    //***** Event Handlers *****//

    onHover: function( cell, event ) {
        var self = this;
        var row = this.data.rows[cell.rowName];
        var matchId = cell.matchid; // lowercase within html

        var ajaxUrlExample = cell.ajaxurlexample || row.ajaxurlexample || this.options.ajaxUrlExample || "";
        var ajaxUrl        = ajaxUrlExample.replace(/MATCH_ID/, matchId).replace(/(\.json)?$/, '.json');

        if( ajaxUrl ) {
            var counter = ++$.ui.svgLineChartTooltip.counter; // Semaphore, only display the last onHover event
            self.drawTooltip( cell );
            self.drawSpinner( cell );
            $.ajax({
                type: "GET",
                url: ajaxUrl,
                success: function( json, xhr, status ) {
                    if( counter == $.ui.svgLineChartTooltip.counter ) {
                        self.fillTooltip( cell, json );
                    }
                }
            });
        }
    },
    unHover: function( cell, event ) {
        //undrawTooltip();
    },
    _onBodyClickEvent: function( tooltip, event ) {
        var canvasTop  = $(this.getCanvas().canvas).offset().top;
        var canvasLeft = $(this.getCanvas().canvas).offset().left;
        
        if( event.pageX > canvasLeft + tooltip.left
         && event.pageX < canvasLeft + tooltip.right
         && event.pageY > canvasTop  + tooltip.top 
         && event.pageY < canvasTop  + tooltip.base
        ) {
            // Click was inside tooltip
            $.noop();
        } else {
            // Click was outside tooltip - remove
            this.undrawTooltip();
            this.unbindBodyClickEvent();
        }
    },



    //***** Data Functions *****//

    getTooltipTextXY: function( cell ) {
        var tooltip = this.options.tooltip;
        var xy_point = this.xy.points[cell.rowName][cell.colName];

        tooltip.trueLeft   = Math.round( xy_point.x - tooltip.width/2 );
        tooltip.left       = Math.max( tooltip.trueLeft,  2 );
        tooltip.trueRight  = tooltip.left + tooltip.width;
        tooltip.right      = Math.min( tooltip.trueRight, this.getWrapper().width()-4 );
        tooltip.left       = Math.max( tooltip.right - tooltip.width, 2 ); // double check against right
        tooltip.width      = Math.min( tooltip.right - tooltip.left, tooltip.width );
        tooltip.center     = tooltip.trueLeft + tooltip.width/2;
        
        if( xy_point.y + this.options.squareSize*2 + tooltip.height <= this.getWrapper().height() ) {
            tooltip.top     = Math.round( xy_point.y + this.options.squareSize*2 );
            tooltip.base    = tooltip.top + tooltip.height;
            tooltip.bodyTop = tooltip.top + tooltip.tipSize;
            tooltip.invert  = false;
        } else { // Invert
            tooltip.base    = Math.round( xy_point.y - this.options.squareSize*2 );
            tooltip.top     = tooltip.base - tooltip.height;
            tooltip.bodyTop = tooltip.top;
            tooltip.invert  = true;
        }
        tooltip.middle     = tooltip.top    + tooltip.height/2;
        tooltip.bodyHeight = tooltip.height - tooltip.tipSize;
        tooltip.textIndent = tooltip.bodyHeight * 1.1;
                
        tooltip.text = {
            x: tooltip.left    + tooltip.textIndent,
            y: tooltip.bodyTop + (tooltip.bodyHeight - this.getFontSize()*2)/2
        };
        if( $.browser.msie ) { tooltip.text.y += 2; }

        return tooltip;
    },

    getResultDigest: function( json ) {
        var resultDigest = $.breadthFirstKeySearch( "resultDigest", json );
        resultDigest          = resultDigest          || { at:"-", result: "" };
        resultDigest.vs       = resultDigest.vs       || { name: "", id: "" };
        resultDigest.score    = resultDigest.score    || { home: "", away: ""};
        if( resultDigest.cmsAlias ) {
            resultDigest.matchUrl = "matches/" 
                                    + resultDigest.cmsAlias[0] + "/"
                                    + resultDigest.cmsAlias[1] + ".html/"
                                    + resultDigest.cmsAlias[2];
        } else {
            resultDigest.matchUrl = "";
        }
        return resultDigest;
    },

    /**
     *  @param  {Object}        resultDigest
     *  @return {Array<Object>} { text: "", attr: {} }
     */
    getTooltipTextData: function( tooltip, resultDigest, cell ) {
        var textData = [];
        textData.push({ 
            text: "v " + resultDigest.vs.name + " (" + String(resultDigest.at||'-').substr(0,1) + ")",
            attr: { "font-weight": 700 }
        });
        textData.push({
            text: resultDigest.result.capitalize() + " " + resultDigest.score.home + "-" + resultDigest.score.away,
            attr: {}
        });
        if( resultDigest.matchUrl ) {
            textData.push({
                text: "Match Report",
                attr: { "font-weight": 700, "href": resultDigest.matchUrl }
            });
        }
        return textData;
    },
    getTooltipImageData: function( tooltip, resultDigest, cell ) {
        var parentWidgetRow = this.parentWidget.data.rows[ resultDigest.vs.id ] || {};
        var tooltip = this.getTooltipTextXY(cell);

        var logoData = [];
        logoData.push({
            url:    parentWidgetRow.logourl,
            width:  parentWidgetRow.logowidth,
            height: parentWidgetRow.logoheight,
            x:      tooltip.left    + (tooltip.textIndent - parentWidgetRow.logowidth)/2,
            y:      tooltip.bodyTop + (tooltip.bodyHeight - parentWidgetRow.logoheight)/2
        });
        return logoData;
    },



    //***** Render Functions *****//
    
    drawSpinner: function( cell ) {
        this.undrawSpinner();
        this.spinner.push( this.canvas.text(this.options.tooltip.center, this.options.tooltip.middle, "...") );
        this.tooltip.push( this.spinner ); // Ensure it gets removed on undraw tooltip
    },
    undrawSpinner: function( cell ) {
        this.spinner.remove();
    },


    drawTooltip: function( cell ) {
        this.undrawTooltip();

        var tooltip = this.getTooltipTextXY( cell );
        if( tooltip.invert === false ) {
            var path = this.canvas.path([
                "M", tooltip.left,                      tooltip.top + tooltip.tipSize,
                "L", tooltip.center - tooltip.tipSize,  tooltip.top + tooltip.tipSize,
                "L", tooltip.center,                    tooltip.top,
                "L", tooltip.center + tooltip.tipSize,  tooltip.top + tooltip.tipSize,
                "L", tooltip.right,                     tooltip.top + tooltip.tipSize,
                "L", tooltip.right,                     tooltip.base,
                "L", tooltip.left,                      tooltip.base,
                "Z"
            ]);
        } else { // tooltip.invert === true
            var path = this.canvas.path([
                "M", tooltip.left,                      tooltip.base - tooltip.tipSize,
                "L", tooltip.center - tooltip.tipSize,  tooltip.base - tooltip.tipSize,
                "L", tooltip.center,                    tooltip.base,
                "L", tooltip.center + tooltip.tipSize,  tooltip.base - tooltip.tipSize,
                "L", tooltip.right,                     tooltip.base - tooltip.tipSize,
                "L", tooltip.right,                     tooltip.top,
                "L", tooltip.left,                      tooltip.top,
                "Z"
            ]);
        } 
        
        path.attr({
            "stroke":       tooltip.border,
            "stroke-width": 1,
            "fill":         tooltip.background
        });
        this.tooltip.push( path );
        this.bindBodyClickEvent(tooltip);
    },
    undrawTooltip: function() {
        this.tooltip.remove();
    },


    fillTooltip: function( cell, json ) {
        this.undrawSpinner();

        var tooltip = this.options.tooltip;
        var resultDigest = this.getResultDigest( json );

        if( resultDigest && this.tooltip && this.options.tooltip ) {
            try {
                var tooltipTextData  = this.getTooltipTextData(  tooltip, resultDigest, cell );
                var tooltipImageData = this.getTooltipImageData( tooltip, resultDigest, cell );

                // TODO: How can we ensure that the text is never bigger than the tooltip?
                
                // Render Text Strings
                for( var i=0, n=tooltipTextData.length; i<n; i++ ) {
                    var text = tooltipTextData[i];
                    var node = this.canvas.text( tooltip.text.x, tooltip.text.y + this.getFontSize()*i, text.text );
                    for( var key in text.attr ) {
                        node.attr( key, text.attr[key] );
                    }
                    node.attr({ "text-anchor": "start" });
                    this.tooltip.push(node);
                }
                    
                for( var i=0, n=tooltipImageData.length; i<n; i++ ) {
                    var logo = tooltipImageData[i];
                    var node = this.canvas.image( logo.url, logo.x, logo.y, logo.width, logo.height );
                    for( var key in logo.attr ) {
                        node.attr( key, logo.attr[key] );
                    }
                    this.tooltip.push(node);
                }
            } catch(e) {
                console.error('Exception: ', this&&this.klass||'', 'fillTooltip(',cell, json,')', e);
            }
        }
    }
});
$.ui.svgLineChartTooltip.counter = 0;
