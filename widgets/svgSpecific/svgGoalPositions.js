$.ui.svgWidget.subclass('ui.svgGoalPositions', {
    klass: "$.ui.svgGoalPositions",
    options: {
        colorGoal:             "#cccccc",   // {#Hex}
        colorLabel:            "#ffffff",	// {#Hex}
        colorPenaltyLine:      "#ffffff",	// {#Hex}
        colorStripeDark:       "#139124",	// {#Hex}
        colorStripeLight:      "#35a63f",	// {#Hex}
        colorUnderGround:      "#035c0f",	// {#Hex}
        stripeCount:           8,
        pitchAngle:           70,
        pitchWidthBase:     null,
        pitchHeight:         160,
        pitchDepth:           11,
        goalWidthRatio:        0.25,   // GoalWidth/PitchTopWidth
        goalHeightRatio:       0.333,  // GoalHeight/GoalWidth - 8 feet by 8 yards
        goalThickness:         3,      // px
        sidelineInset:		   4,
        sidelineThickness:     2,
        sidelineOpacity:       0.9,
        labelSize:			   18,
        labelTextSize:		   11
    },
    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    parseOptions: function( o ) {
        o = o || this.options;
        o.pitchWidthBase  = o.pitchWidthBase  || this.getInitWidth();
        
        o.pitchIndent     = o.pitchIndent     || Math.ceil( o.pitchHeight / Math.tan(o.pitchAngle * Math.PI / 180) );
        o.pitchWidthTop   = o.pitchWidthTop   || Math.ceil( o.pitchWidthBase - (o.pitchIndent * 2) );
        
        o.goalWidth       = o.goalWidth       || Math.ceil( o.pitchWidthTop  * o.goalWidthRatio );
        o.goalHeight      = o.goalHeight      || Math.ceil( o.goalWidth      * o.goalHeightRatio );
        
        o.formation 	  = this.data  || {};
        return o;
    },
    calculateXY: function( o ) {
        o = this.options;
        var xy = this.xy = this.xy || {};
        xy.origin = { x: 0, y: 15 };
       
        xy.goal = {
            top:   xy.origin.y + o.sidelineInset,
            base:  xy.origin.y + o.sidelineInset + o.goalHeight,
            left:  xy.origin.x + o.pitchWidthBase/2 - o.goalWidth/2,
            right: xy.origin.x + o.pitchWidthBase/2 + o.goalWidth/2
        };
        
        xy.pitch = {
            top:    xy.origin.y + o.goalHeight,
            base:   xy.origin.y + o.goalHeight + o.pitchHeight,
            center: xy.origin.x + o.pitchWidthBase/2
        };
        xy.pitchTop = {
            left:   xy.origin.x + o.pitchIndent,
            right:  xy.origin.x + o.pitchWidthBase - o.pitchIndent
        };
        xy.pitchBase = {
            left:   xy.origin.x,
            right:  xy.origin.x + o.pitchWidthBase
        };

        xy.stripePointsTop  = [];
        xy.stripePointsBase = [];
        for( var i=0; i<=o.stripeCount; i++ ) {
            xy.stripePointsTop[i] = { 
                x: xy.pitchTop.left + Math.round( i * o.pitchWidthTop/o.stripeCount ),
                y: xy.pitch.top
            };
            xy.stripePointsBase[i] = { 
                x: xy.pitchBase.left + Math.round( i * o.pitchWidthBase/o.stripeCount ),
                y: xy.pitch.base
            };
        }
        
        xy.sideline = {
        	top: xy.pitch.top + o.sidelineInset,
        	base: xy.pitch.base - o.sidelineInset * 3,
        	center: xy.pitch.center
        };
        xy.sidelineTop = {
            left:   xy.origin.x + o.pitchIndent + o.sidelineInset,
            right:  xy.origin.x + o.pitchWidthBase - o.pitchIndent - o.sidelineInset
        };
        xy.sidelineBase = {
            left:   xy.pitchBase.left + o.sidelineInset * 2, // Maths ain't right
            right:  xy.pitchBase.right - o.sidelineInset * 2 // 
        };
        xy.sidelineOHBase = {
        	left:   xy.pitchBase.left + o.sidelineInset,
        	right:  xy.pitchBase.right - o.sidelineInset
        }

        xy.sixYd = {
            top:  Math.round( xy.pitch.top + o.sidelineInset ),
            base: Math.round( xy.pitch.top + o.sidelineInset + o.pitchHeight/10 )
        };
        xy.sixYdTop = {
            left:  xy.goal.left,
            right: xy.goal.right
        };
        xy.sixYdBase = {
            left:  xy.goal.left - o.pitchIndent/o.stripeCount * o.goalWidthRatio,
            right: xy.goal.right + o.pitchIndent/o.stripeCount * o.goalWidthRatio
        };
        
        xy.eighteenYd = {
            top:  Math.round( xy.pitch.top + o.sidelineInset ),
            base: Math.round( xy.pitch.top + o.sidelineInset + o.pitchHeight/4 )
        };
        xy.eighteenYdTop = {
            left:  xy.goal.left - o.goalWidth / 2,
            right: xy.goal.right + o.goalWidth / 2 //Stay with the nice stripes
        };
        xy.eighteenYdBase = {
            left:  xy.goal.left - o.goalWidth / 2  - o.pitchIndent/o.stripeCount,
            right: xy.goal.right + o.goalWidth / 2 + o.pitchIndent/o.stripeCount
        };
        xy.eighteenYdArc = {
        	left:  Math.round( xy.eighteenYdBase.left  + 1.5*(xy.eighteenYdBase.left + xy.eighteenYdBase.right)/18 ),
        	right: Math.round( xy.eighteenYdBase.right - 1.5*(xy.eighteenYdBase.left + xy.eighteenYdBase.right)/18 ),
        	curveX: xy.pitch.center,
        	curveY: Math.round( xy.eighteenYd.base + (xy.eighteenYd.top + xy.eighteenYd.base) / 6 )
        };

        // Box tip positions in {x,y} format
        xy.tipPositions = {};
        xy.tipPositions.ownhalf = {
        	x: xy.pitch.center,
        	y: xy.pitch.base - o.sidelineInset * 2 // Centre line is -*3 
        };
        xy.tipPositions.midfield = {
        	y: Math.round( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2 ),
        	xleft:  xy.pitch.center - 3/16*( o.pitchWidthBase - 2*( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2 ) / Math.tan(o.pitchAngle * Math.PI / 180) ),
        	xright: xy.pitch.center + 3/16*( o.pitchWidthBase - 2*( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2 ) / Math.tan(o.pitchAngle * Math.PI / 180) )
        };
        xy.tipPositions.wing = {
        	y: Math.round( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2.5 ),
        	xleft:  xy.pitch.center - 7/16*( o.pitchWidthBase - 2*( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2.5 ) / Math.tan(o.pitchAngle * Math.PI / 180) ),
        	xright: xy.pitch.center + 7/16*( o.pitchWidthBase - 2*( xy.eighteenYd.base + (xy.sideline.base - xy.eighteenYd.base) / 2.5 ) / Math.tan(o.pitchAngle * Math.PI / 180) )
        };
        xy.tipPositions.corner = {
        	y: Math.round( xy.eighteenYd.base - (xy.eighteenYd.base - xy.eighteenYd.top) * 0.5 ),
        	xleft:  xy.pitch.center - 3/10*( o.pitchWidthBase - 2*( xy.eighteenYd.base - (xy.eighteenYd.base - xy.eighteenYd.top) / 1.5 ) / Math.tan(o.pitchAngle * Math.PI / 180) ),
        	xright: xy.pitch.center + 3/10*( o.pitchWidthBase - 2*( xy.eighteenYd.base - (xy.eighteenYd.base - xy.eighteenYd.top) / 1.5 ) / Math.tan(o.pitchAngle * Math.PI / 180) )
        };
        xy.tipPositions.eighteenYd = {
        	y: xy.sixYd.base - o.sidelineInset,
        	xleft:  xy.pitch.center - 3/20*( o.pitchWidthBase - 2*xy.sixYd.base / Math.tan(o.pitchAngle * Math.PI / 180) ),
        	xright: xy.pitch.center + 3/20*( o.pitchWidthBase - 2*xy.sixYd.base / Math.tan(o.pitchAngle * Math.PI / 180) )
        };
        xy.tipPositions.sixYd = {
        	y: xy.sixYd.top + ( xy.sixYd.base - xy.sixYd.top ) / 2 - o.sidelineInset,
        	xleft:  xy.pitch.center - 1/20*( o.pitchWidthBase - ( xy.sixYd.top - xy.sixYd.base ) / Math.tan(o.pitchAngle * Math.PI / 180) ),
        	xright: xy.pitch.center + 1/20*( o.pitchWidthBase - ( xy.sixYd.top - xy.sixYd.base ) / Math.tan(o.pitchAngle * Math.PI / 180) )
        };

        xy.tipPositions.penalty = {
        	x: xy.pitch.center,
        	y: xy.eighteenYd.base - 2*o.sidelineInset
        }
    },
    draw: function() {    	
    	this.drawPitch();
    	this.drawGoal();
        this.drawSixYdBox();
        this.drawEighteenYdBox();
        this.drawSidelines();
        this.drawUnderground();
        this.drawTipLabels();
        this.element.hide();
    },
    drawPitch: function() {    	
        // Dark stripes
        var darkPath = [];
        var lightPath = [];
        for( var i=0; i<this.options.stripeCount; i=i+2 ) {
            darkPath.push(
                "M", this.xy.stripePointsTop[i].x,    this.xy.stripePointsTop[i].y,
                "L", this.xy.stripePointsBase[i].x,   this.xy.stripePointsBase[i].y,
                "L", this.xy.stripePointsBase[i+1].x, this.xy.stripePointsBase[i+1].y,
                "L", this.xy.stripePointsTop[i+1].x,  this.xy.stripePointsTop[i+1].y,
                "Z"
            );
        }
        for( var i=1; i<this.options.stripeCount; i=i+2 ) {
            lightPath.push(
                "M", this.xy.stripePointsTop[i].x,    this.xy.stripePointsTop[i].y,
                "L", this.xy.stripePointsBase[i].x,   this.xy.stripePointsBase[i].y,
                "L", this.xy.stripePointsBase[i+1].x, this.xy.stripePointsBase[i+1].y,
                "L", this.xy.stripePointsTop[i+1].x,  this.xy.stripePointsTop[i+1].y,
                "Z"
            );
        }

        this.canvas.path( darkPath  ).attr({
            "fill":         this.options.colorStripeDark,
            "stroke":       this.options.colorStripeDark,
            "stroke-width": 1
        });
        this.canvas.path( lightPath ).attr({
           "fill":         this.options.colorStripeLight,
           "stroke":       this.options.colorStripeLight,
           "stroke-width": 1
        });
        
    },
    drawUnderground: function() {
        this.canvas.rect( this.xy.pitchBase.left,      this.xy.pitch.base, 
                          this.options.pitchWidthBase, this.options.pitchDepth )
            .attr({ 
                "fill":         this.options.colorUnderGround,
                "stroke":       this.options.colorUnderGround,
                "stroke-width": 1
            });
    },
    drawGoal: function() {
        // Goal has no base, so loops back on itself
        this.sprite.goal = this.canvas.path([
            "M", this.xy.goal.left,  this.xy.goal.base, 
            "L", this.xy.goal.left,  this.xy.goal.top,  
            "L", this.xy.goal.right, this.xy.goal.top,
            "L", this.xy.goal.right, this.xy.goal.base,

            "L", this.xy.goal.right, this.xy.goal.top,  
            "L", this.xy.goal.left,  this.xy.goal.top,  
            "Z"
        ]);
        this.sprite.goal.attr({
            "stroke":       this.options.colorGoal,
            "stroke-width": this.options.goalThickness
        });
    },
    drawSixYdBox: function() {
        // Penalty has no base, so loops back on itself
        this.sprite.box6 = this.canvas.path([
            "M", this.xy.sixYdTop.left,   this.xy.sixYd.top,
            "L", this.xy.sixYdBase.left,  this.xy.sixYd.base,
            "L", this.xy.sixYdBase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdTop.right,  this.xy.sixYd.top,

            "L", this.xy.sixYdBase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdBase.left,  this.xy.sixYd.base,
            "Z"
        ]);
        this.sprite.box6.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
    },
    drawEighteenYdBox: function() {
        // Penalty has no base, so loops back on itself
        this.sprite.box18 = this.canvas.path([
            "M", this.xy.eighteenYdTop.left,   this.xy.eighteenYd.top,
            "L", this.xy.eighteenYdBase.left,  this.xy.eighteenYd.base,
            "L", this.xy.eighteenYdBase.right, this.xy.eighteenYd.base,
            "L", this.xy.eighteenYdTop.right,  this.xy.eighteenYd.top,

            "L", this.xy.eighteenYdBase.right, this.xy.eighteenYd.base,
            "L", this.xy.eighteenYdBase.left,  this.xy.eighteenYd.base,
            "Z"
        ]);
        this.sprite.box18.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        // Penalty box arc
        var arc = "M" + this.xy.eighteenYdArc.left + "," + this.xy.eighteenYd.base
        	+ "S" + this.xy.eighteenYdArc.curveX + "," + this.xy.eighteenYdArc.curveY
        	+ "," + this.xy.eighteenYdArc.right + "," + this.xy.eighteenYd.base
        	+ "Z";
        this.sprite.arc18 = this.canvas.path( arc );
        this.sprite.arc18.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
    },
    drawSidelines: function() {
        this.sprite.sidelines = this.canvas.path([
			"M", this.xy.sidelineTop.left,   this.xy.sideline.top,
			"L", this.xy.sidelineBase.left,  this.xy.sideline.base,
			"L", this.xy.sidelineBase.right, this.xy.sideline.base,
			"L", this.xy.sidelineTop.right,  this.xy.sideline.top,
			"Z"
        ]);
        this.sprite.sidelines.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        // Part of the other half, loops back too
        this.sprite.otherHalf = this.canvas.path([
			"M", this.xy.sidelineOHBase.left,  this.xy.pitch.base,
			"L", this.xy.sidelineBase.left,    this.xy.sideline.base,
			"L", this.xy.sidelineBase.right,   this.xy.sideline.base,
			"L", this.xy.sidelineOHBase.right, this.xy.pitch.base,
			
			"L", this.xy.sidelineBase.right,   this.xy.sideline.base,
			"L", this.xy.sidelineBase.left,    this.xy.sideline.base,
			"Z"
		 ]);
		 this.sprite.otherHalf.attr({
		     "stroke":         this.options.colorPenaltyLine,
		     "stroke-width":   this.options.sidelineThickness,
		     "stroke-opacity": this.options.sidelineOpacity
		 });
		 // Center Circle
		 this.sprite.circle = this.canvas.ellipse(
		    this.xy.pitch.center, this.xy.sideline.base,
		    this.options.pitchWidthBase/6, this.options.pitchHeight/5
		 );
		 this.sprite.circle.attr({
		     "stroke":         this.options.colorPenaltyLine,
		     "stroke-width":   this.options.sidelineThickness,
		     "stroke-opacity": this.options.sidelineOpacity
		 });
    },
    drawTipLabels: function() {
    	var xy   = this.xy;
    	var data = this.data;
    	// Own Half
    	this.drawTipLabel(
    		xy.tipPositions.ownhalf.x, 
    		xy.tipPositions.ownhalf.y,
    		data.values.ownhalf.goals
    	);
    	// Wings
    	this.drawTipLabel(
    		xy.tipPositions.wing.xleft, 
    		xy.tipPositions.wing.y,
    		data.values.lWing.goals
    	);
    	this.drawTipLabel(
    		xy.tipPositions.wing.xright, 
    		xy.tipPositions.wing.y,
    		data.values.rWing.goals
    	);
    	// Corners
    	this.drawTipLabel(
    		xy.tipPositions.corner.xleft, 
    		xy.tipPositions.corner.y,
    		data.values.lCorner.goals
    	);
    	this.drawTipLabel(
    		xy.tipPositions.corner.xright, 
    		xy.tipPositions.corner.y,
    		data.values.rCorner.goals
    	);
    	// Midfield
    	this.drawTipLabel(
    		xy.tipPositions.midfield.xleft, 
    		xy.tipPositions.midfield.y,
    		data.values.lMid.goals
    	);
    	this.drawTipLabel(
    		xy.tipPositions.midfield.xright, 
    		xy.tipPositions.midfield.y,
    		data.values.rMid.goals
    	);
    	// 18 Yard Box
    	this.drawTipLabel(
    		xy.tipPositions.eighteenYd.xleft, 
    		xy.tipPositions.eighteenYd.y,
    		data.values.l18Yd.goals
    	);
    	this.drawTipLabel(
    		xy.tipPositions.eighteenYd.xright, 
    		xy.tipPositions.eighteenYd.y,
    		data.values.r18Yd.goals
    	);
    	// 6 Yard Box
    	this.drawTipLabel(
    		xy.tipPositions.sixYd.xleft, 
    		xy.tipPositions.sixYd.y,
    		data.values.l6Yd.goals
    	);
    	this.drawTipLabel(
    		xy.tipPositions.sixYd.xright, 
    		xy.tipPositions.sixYd.y,
    		data.values.r6Yd.goals
    	);
    	// Penalty Area
    	this.drawTipLabel(
    		xy.tipPositions.penalty.x, 
    		xy.tipPositions.penalty.y,
    		data.strings.c18Yd.goals		// NB STRING
    	);
    	
    },
    drawTipLabel: function( x, y, val ) {
		// Draw label relative to origin point
		// Label height = Square and 1/3 triangle tip
		var labelSq  = this.options.labelSize;
		var labelTri = 5;
		var labelMargin;
		
		var output = val.toString();
		// If normal numeric
		if (!output.match(/(\d+\s)?\+\s\d+\spen/)) {
			labelMargin = {
				x: x - this.options.labelSize / 2,
				y: y - this.options.labelSize
			}
			var color = {};
				color.bg  = "#fff";
				color.txt = "#666";
			/* Get darker if more goals scored */
			if (val>0 && val<=3) {
				color.bg  = "#fc0";
				color.txt = "#333";
			}
			else if (val>3 && val<25) {
				color.bg  = "#f90";
				color.txt = "#fff";
			}
			else if (val>=25) {
				color.bg  = "#ee6e19";
				color.txt = "#fff";
			}
			this.sprite.tip = this.canvas.path([
		  	    "M", labelMargin.x, labelMargin.y,
		  	    "h", labelSq,
		  	    "v", labelSq,
		  	    "h", -4,
		  	    "l", -labelTri,  labelTri,
		  	    "l", -labelTri, -labelTri,
		  	    "h", -4,
		  	    "Z"
		  	]).attr({
		  		"fill": color.bg,
		  		"stroke-width": 0.001
		  	});
			this.sprite.label = this.canvas.text(
				labelMargin.x + labelSq/2,
				labelMargin.y + labelSq/2,
				val );
	        this.sprite.label.attr({
	        	"fill": 	   color.txt,
	            "font-size":   this.options.labelTextSize,
	            "font-weight": this.options.labelWeight,
	            "text-anchor": "middle"
	        });
		} else {
			// Must be the penalty square!
			labelMargin = {
				x: x - this.options.labelSize * 2,
				y: y - this.options.labelSize
			}
			var color = {};
				color.bg  = "#ee6e19";
				color.txt = "#fff";
			this.sprite.tip = this.canvas.path([
		  	    "M", labelMargin.x, labelMargin.y,
		  	    "h", 4*labelSq,
		  	    "v", labelSq,
		  	    "h", -31,
		  	    "l", -labelTri,  labelTri,
		  	    "l", -labelTri, -labelTri,
		  	    "h", -31,
		  	    "Z"
		  	]).attr({
		  		"fill": color.bg,
		  		"stroke-width": 0.001
		  	});
			this.sprite.label = this.canvas.text(
				labelMargin.x + labelSq*2,
				labelMargin.y + labelSq/2,
				val );
	        this.sprite.label.attr({
	        	"fill": 	   color.txt,
	            "font-size":   this.options.labelTextSize,
	            "font-weight": this.options.labelWeight,
	            "text-anchor": "middle"
	        });
		}
    }
});
