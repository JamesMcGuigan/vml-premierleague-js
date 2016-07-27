/**
 *  Works for both tables and trs
 */
$.ui.svgWidget.subclass('ui.svgGoalTimes', {
    klass: "$.ui.svgGoalTimes",
    options: {
		yaxislabel:		'GOALS SCORED',
		xaxislabel:		'TIME SCORED',
		xaxiscount:		1,
		tipName:		'goalcount',
        tipText:        'goal',
        stripeCount:    8,
		barColor:		'#639ec8',
        barUnit:        4,
        barSpacing:     1,
        barWidth:       0,
        barFontSize:   20,
        barFontWeight:  'bold',
        bgStripes:		8,
        bgColor:		'#eff5f9',
        asPercentages:  true
    },
    tooltips: $([]), // empty jQuery - shared between all instances of this class

    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    parseOptions: function() {
        this.options.barCount     = this.options.barCount   || this.data.rowNames.length * this.data.colNames.length;
        this.options.barSpacing   = this.options.barSpacing || Math.round( this.getInitWidth()/this.options.barCount * 0.2 );
        this.options.barWidth     = this.options.barWidth   || Math.round( ( this.getInitWidth() - this.getFontSize()*3.5 )/this.options.barCount - this.options.barSpacing );
        this.options.barHeight    = this.options.barHeight  || Math.round( this.getInitHeight() - this.getFontSize()*3 - this.options.barFontSize*1.5 );

        if( this.data.stats.max === 0 ) {
            this.options.barUnit      = 1;
            this.options.stripeHeight = this.options.barHeight/this.options.stripeCount;
        } else {
            var units = [1,2,4,5,10,25,50,100,250,500,1000];
            for( var i=0, n=units.length; i<n; i++ ) {
                if( this.data.stats.max / units[i] < this.options.stripeCount ) {
                    this.options.barUnit      = units[i];
                    this.options.stripeHeight = units[i] * this.options.barHeight/this.data.stats.max;
                    break;
                }
            }
        }
    },
    draw: function() {
    	this.drawBackStripes();
        this.drawData();
        this.drawAxisLabels();
        this.table.hide();
    },
    calculateXY: function() {
        this.xy = {};
    },
    drawBackStripes: function() {
        var barBase = this.options.barHeight + this.options.barFontSize*1.5;

    	this.sprite.bgStripes = this.canvas.set();
    	for( var i=0, n=this.options.bgStripes; i<=n; i++) {
            var stripe = {};
            stripe.left   = 0;
            stripe.right  = this.getInitWidth();
            stripe.width  = stripe.right - stripe.left;
            stripe.top    = barBase - (i * this.options.stripeHeight);
            stripe.base   = stripe.top + this.options.stripeHeight;
            stripe.top    = Math.max( 0, stripe.top );
            stripe.height = stripe.base - stripe.top;

            if( i % 2 == 1 ) {// && stripe.top >= this.getFontSize()/2 ) {
                this.sprite.bgStripes.push(
                    this.canvas.rect( stripe.left, stripe.top, stripe.width, stripe.height )
                               .attr( "fill",   this.options.bgColor )
                               .attr( "stroke", this.options.bgColor )
                               .attr( "stroke-width", 0.001 )
                );
            }
        }

    	for( var i=0, n=this.options.bgStripes; i<=n; i++) {
            var labelX = this.getFontSize()*2.25;
            var labelY = barBase - (i * this.options.stripeHeight);
            var labelText = String(this.options.barUnit * i);
            if( this.options.asPercentages ) { labelText += "%"; }

            if( labelY >= this.getFontSize()/2 ) {
                this.canvas.text( labelX, labelY, labelText )
                           .attr( "fill",        this.options.labelColor )
                           .attr( "font-weight", this.options.labelWeight )
                           .attr( "style",       "text-align:center" )
                           .attr( "text-anchor", "middle" );
            }
    	}
    },
    drawData: function() {
        this.sprite.bars    = {};
        this.sprite.barText = this.canvas.set();
        this.sprite.labels  = this.canvas.set();

        this.data.rowNames = this.data.rowNames.sort(); // PL-1769 - Ensure that goal times display in order

        var barCount = 0;
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];

            this.sprite.bars    = this.canvas.set();
            this.sprite.barText = this.canvas.set();

            for( var j=0, m=this.data.colNames.length; j<m; j++, barCount++ ) {
                var colName   = this.data.colNames[j];
                var barHeight = Math.round( this.options.barHeight * (this.data.values[rowName][colName]/this.data.stats.max) ) || 2;
                var barLeft   = Math.round( (this.options.barWidth + this.options.barSpacing) * barCount + this.getFontSize()*3.5 );
                var barBase   = this.options.barHeight + this.options.barFontSize*1.5;
                var barTop    = barBase - barHeight;

                var barNode = this.canvas.rect( barLeft, barTop, this.options.barWidth, barHeight )
                	.attr( "fill",   this.options.barColor )
                	.attr( "stroke", this.options.barColor )
                	.attr( "stroke-width", 0.001 );

                this.sprite.bars.push( barNode );

                var tooltipHTML =
                	  "<div class='tooltip svgGoalTimesTooltip " + this.options.tipName + "'>"
	    	    	+ "<span class='time'>" + this.formatTooltipTime( this.data.rowNames[barCount] ) + "</span>"
	    	    	+ "<span class='num'>"  + this.data.values[rowName][colName]
                    + ((this.options.asPercentages) ? "%" : "")
                    + " "
                    + ((this.data.values[rowName][colName]==1)
                         ? this.options.tipText
                         : (this.options.tipText.replace(/s$/,"se")+"s") // 1 cross, 2 crosses
                      )
                    + "</span></div>";

                var tooltip = $(tooltipHTML).appendTo(this.getWrapper());
                var offset = {
            		top:  -tooltip.height()*1.25 + 4,
            		left: this.options.barWidth/2 - tooltip.width()/2 - 2
                };

                tooltip.css({
        			"position":"absolute",
        			"z-index":"900000",
        			"top":  (barTop  + offset.top)  + "px",
        			"left": (barLeft + offset.left) + "px",
        		    "display":"none"
        		});
                this.tooltips.push( tooltip[0] );

                barNode.hover(
                    $.proxy( this.onHover,      this, tooltip),
                    $.proxy( this.onBarUnhover, this, tooltip)
                );

                if ( barCount % this.options.xaxiscount === 0 ) {// Draw label every 3rd column
	                var labelX = barLeft + this.options.barWidth/2;
                	var labelY = barBase + this.options.labelSize*1.2;
	                var label  = this.formatLabel(rowName);
	                this.sprite.labels.push(
	                    this.canvas.text( labelX, labelY, label )
	                               .attr( "fill",        this.options.labelColor )
	                               .attr( "font-weight", this.options.labelWeight ) // Bold
	                               .attr( "style",       "text-align:center" )
	                               .attr( "text-anchor", "middle" )
	                );
                }
            }
        }

        $(this.getCanvas().canvas).hover(
           function() {}, // hover
           $.proxy( this.onUnhover, this, null )
        );
        $(document.body).bind("click.svgGoalTimes", $.proxy(this.onBodyClick, this));
    },

    _onHoverLastTooltip: null,
    _onHoverLastTimestamp: null,
    onHover: function( tooltip, event ) {
        this._onHoverLastTooltip = tooltip;
        this._onHoverLastTimestamp = (new Date()).getTime();

        this.tooltips.not(tooltip).fadeOut();
        tooltip.fadeIn();
    },
    onUnhover: function( tooltip, event ) {
        var self = this;
        var timestampdiff = (new Date().getTime()) - this._onHoverLastTimestamp;

        // Bugfix: Tooltip flashes when hovering on border pixel or 0-data
        // fadeOut when the mouse is over the tooltip, will trigger a new hover event
        // this causes the flashing, but we need a catch to ensure the tooltip never becomes perminantly stuck

        // Canvas unhover doesn't pass in a tooltip, but ensure its only unhover from background
        if( tooltip === null && event.target.nodeName !== "rect" ) {
            this.tooltips.fadeOut("slow");
        }
        // average flash delay on Firefox is 30ms
        else if( tooltip === this._onHoverLastTooltip && timestampdiff > 100 ) {
            this.tooltips.fadeOut("slow");
        }
    },
    onBodyClick: function(event) {
        // fadeout on body click - this is out catch to prevent the tooltip from getting stuck
        if( $(event.target).closest(this.element).length === 0 ) {
            this.tooltips.fadeOut("slow");
        }
    },

    /**
     *  @param  {String} label   text as defined in the HTML
     *  @return {String}
     */
    formatLabel: function( label ) {
        label = String(label).trim();
        label = label.toUpperCase().replace(/^(.*) (.*?)$/, "$1\n$2"); // Replace last space
        label = label.replace(/Extra\s*Time/i, "ET");                  // Add minute sign if not included in backing data
        label = label.replace(/^(\d+)\s*to\s*(\d+)$/i, "$2");          // 0 to 10 -> 10
        label = label.replace(/(\d+)/, "$1'");                       // Add minute sign if not included in backing data
        return label;
    },
    formatTooltipTime: function( label ) {
        label = String(label).trim();
        label = label.replace(/(\d+)/g, "$1'");                       // Add minute sign if not included in backing data
        return label;
    },
    drawAxisLabels: function() {
        // TODO: Draw X Axis Labels
    	var yAxisLabel = {
    		x: this.getFontSize()*3/4,
    		y: ( this.getInitHeight() - this.getFontSize()*3 ) / 2
    	};
    	var xAxisLabel = {
    		x: this.getFontSize()*3.5 + ( this.getInitWidth() - this.getFontSize()*3.5 ) / 2,
    		y: this.getInitHeight() - this.getFontSize()
    	};

        this.canvas.text( yAxisLabel.x, yAxisLabel.y, this.options.yaxislabel )
			.attr( "fill",        this.options.labelColor )
			.attr( "font-weight", this.options.labelWeight ) // Bold
			.attr( "text-anchor", "middle" )
			.rotate(270,yAxisLabel.x,yAxisLabel.y);

    	this.canvas.text( xAxisLabel.x, xAxisLabel.y, this.options.xaxislabel )
		    .attr( "fill",        this.options.labelColor )
		    .attr( "font-weight", this.options.labelWeight ) // Bold
		    .attr( "text-anchor", "middle" );
    }
});
