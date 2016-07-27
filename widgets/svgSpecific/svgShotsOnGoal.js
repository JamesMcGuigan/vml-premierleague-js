$.ui.svgWidget.subclass('ui.svgShotsOnGoal', {
    klass: "$.ui.svgShotsOnGoal",
    options: {
        colorGoal:             "#cccccc",
        colorLabel:            "#ffffff",
        colorPenaltyLine:      "#ffffff",
        colorStripeDark:       "#218221",
        colorStripeLight:      "#339933",
        colorUnderGround:      "#035b0f",
        stripeCount:           7,
        pitchAngle:            7*Math.PI/60,
        pitchWidthBase:      304,
        pitchHeight:          45,
        pitchDepth:           11,
        goalWidthRatio:        0.6,    // GoalWidth/PitchTopWidth
        goalHeightRatio:       0.333,  // GoalHeight/GoalWidth - 8 feet by 8 yards
        goalThickness:         5,      // px
        penaltySpotSize:       7,
        penaltyLineThickness:  2, 
        penaltyLineOpacity:    0.9,
        dataSquareSize:        23,
        labelOffset:           38
    },
    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    parseOptions: function( o ) {
        o = o || this.options;
        o.pitchIndent     = o.pitchIndent     || Math.ceil( o.pitchHeight * Math.tan(o.pitchAngle) * 2 );
        o.pitchWidthTop   = o.pitchWidthTop   || Math.ceil( o.pitchWidthBase - (o.pitchIndent * 2) );
        
        o.goalWidth       = o.goalWidth       || Math.ceil( o.pitchWidthTop  * o.goalWidthRatio );
        o.goalHeight      = o.goalHeight      || Math.ceil( o.goalWidth      * o.goalHeightRatio );
        return o;
    },
    calculateXY: function( o ) {
        o = this.options;
        var xy = this.xy = this.xy || {};
        xy.origin = { x: 5, y: 5 }; 
       
        
        xy.goal = {
            top:   xy.origin.y,
            base:  xy.origin.y + o.goalHeight,
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
        
        xy.label = {
            x: this.getInitWidth()/2,
            y: this.getInitHeight() - this.getFontSize()*1.5
        };

        xy.penalty = {
            top:  Math.round( xy.pitch.top ),
            base: Math.round( xy.pitch.top + o.pitchHeight/2 )
        };
        xy.penaltyTop = {
            left:  xy.goal.left,
            right: xy.goal.right
        };
        xy.penaltyBase = {
            left:  xy.goal.left  - o.pitchIndent/2 * o.goalWidthRatio,
            right: xy.goal.right + o.pitchIndent/2 * o.goalWidthRatio
        };
        xy.penaltySpot = {
            x: xy.pitch.center,
            y: xy.pitch.base - o.pitchHeight/4
        };


        xy.dataSquare = {
            top:        Math.round( xy.goal.top + o.goalHeight/2 - o.dataSquareSize/2 ),
            middle:     Math.round( xy.goal.top + o.goalHeight/2 ),
            base:       Math.round( xy.goal.top + o.goalHeight/2 + o.dataSquareSize/2 ),
            goalOffset: Math.round( o.goalHeight/2 + o.goalThickness/2 )  
        };
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];
            var postX   = ( i % 2 === 0 ) ? xy.goal.left : xy.goal.right;
            var inside  = ( i % 2 === 0 ) ?  1 : -1;
            var outside = ( i % 2 === 0 ) ? -1 :  1;
            var direction;

            xy.dataSquare[rowName] = {};
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                var colName = this.data.colNames[j];
 
                if(      colName.match( /on|scored/i) ) { direction = inside;  }
                else if( colName.match(/off|missed/i) ) { direction = outside; }
                else { console.error(this&&this.klass||'' ,':calculateXY(): invalid colName ', colName, this); }

                xy.dataSquare[rowName][colName] = {
                    top:    xy.dataSquare.top,
                    middle: xy.dataSquare.middle, 
                    base:   xy.dataSquare.base,
                    left:   postX + xy.dataSquare.goalOffset * direction - o.dataSquareSize/2,
                    center: postX + xy.dataSquare.goalOffset * direction,
                    right:  postX + xy.dataSquare.goalOffset * direction + o.dataSquareSize/2
                };
            }
        }

        return xy;
    },
    getInitHeight: function() {
        return Math.ceil( this.options.goalHeight + this.options.pitchHeight + this.options.pitchDepth 
                        + this.options.labelOffset*1.5 + this.xy.origin.y );
    },
    getInitWidth: function() {
        return this.options.pitchWidthBase + this.xy.origin.x*2;
    },
    draw: function() {
        this.drawGoal();
        this.drawUnderground();
        this.drawPitch();
        this.drawPenaltyBox();
        this.drawPenaltySpot();
        this.drawDataSquares();
        this.drawDataSquareLabels();
        this.drawLabel();
        this.element.hide();
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
    drawPenaltyBox: function() {
        // Penalty has no base, so loops back on itself
        this.sprite.goal = this.canvas.path([
            "M", this.xy.penaltyTop.left,   this.xy.penalty.top,
            "L", this.xy.penaltyBase.left,  this.xy.penalty.base,
            "L", this.xy.penaltyBase.right, this.xy.penalty.base,
            "L", this.xy.penaltyTop.right,  this.xy.penalty.top,

            "L", this.xy.penaltyBase.right, this.xy.penalty.base,
            "L", this.xy.penaltyBase.left,  this.xy.penalty.base,
            "Z"
        ]);
        this.sprite.goal.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.penaltyLineThickness,
            "stroke-opacity": this.options.penaltyLineOpacity
        });
    },
    drawPenaltySpot: function() {
        this.canvas.ellipse( 
            this.xy.penaltySpot.x,          this.xy.penaltySpot.y,
            this.options.penaltySpotSize/2, this.options.penaltySpotSize/2 * 0.6 // 0.6 = Isometric projection
        ).attr({
            "fill":           this.options.colorPenaltyLine,
            "stroke-width":   0,
            "stroke-opacity": this.options.penaltyLineOpacity
        });
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
    drawDataSquares: function() {
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                
            	var colName = this.data.colNames[j];
                var color   = this.data.rows[rowName].color;
                var stroke	= this.data.rows[rowName].stroke || color;  
                
                this.canvas.rect(
                    this.xy.dataSquare[rowName][colName].left,
                    this.xy.dataSquare[rowName][colName].top,
                    this.options.dataSquareSize,
                    this.options.dataSquareSize
                ).attr({
                    "fill": 		color,
                    "stroke": 		stroke,
                    "stroke-width": 1.5
                });
            }
        }
    },
    drawDataSquareLabels: function() {
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName = this.data.rowNames[i];
            for( var j=0, m=this.data.colNames.length; j<m; j++ ) {
                
            	var colName = this.data.colNames[j];
            	var color	= (this.options.colorLabel === this.data.rows[rowName].color) ? "#000000" : this.options.colorLabel;

                this.canvas.text(
                    this.xy.dataSquare[rowName][colName].center + ($.browser.msie ? -1 : 0),
                    this.xy.dataSquare[rowName][colName].middle + ($.browser.msie ?  2 : 0),
                    this.data.values[rowName][colName]
                ).attr({
                    "fill":        color,
                    "font-size":   12,
                    "font-weight": 700
                });
            }
        }
    }
});
