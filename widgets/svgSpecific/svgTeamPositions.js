$.ui.svgWidget.subclass('ui.svgTeamPositions', {
    klass: "$.ui.svgTeamPositions",
    options: {
		team:				   '',			// {String} 'home' or 'away' 
		formation:			   null,		// {[[Array]]} Array formatted Str
		colorGoal:             "#cccccc",   // {#Hex}
        colorLabel:            "#ffffff",	// {#Hex}
        colorPenaltyLine:      "#ffffff",	// {#Hex}
        colorStripeDark:       "#139124",	// {#Hex}
        colorStripeLight:      "#35a63f",	// {#Hex}
        colorUnderGround:      "#035c0f",	// {#Hex}
        stripeCount:           8,
        pitchAngle:           60,
        pitchWidthBase:      340,
        pitchHeight:         160,
        pitchDepth:           11,
        goalWidthRatio:        0.25,   // GoalWidth/PitchTopWidth
        goalHeightRatio:       0.333,  // GoalHeight/GoalWidth - 8 feet by 8 yards
        goalThickness:         3,      // px
        sidelineInset:		   4,
        sidelineThickness:     2,
        sidelineOpacity:       0.9,
        labelSize:			   15,
        svgbackground:		   "#f3f8fb"	// {#Hex}
    },
    required: {
    	formation: 	String
    },
    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    parseOptions: function( o ) {
        o = o || this.options;
        o.pitchIndent     = o.pitchIndent     || Math.ceil( o.pitchHeight * Math.tan(o.pitchAngle) );
        o.pitchWidthTop   = o.pitchWidthTop   || Math.ceil( o.pitchWidthBase - (o.pitchIndent * 2) );
        
        o.goalWidth       = o.goalWidth       || Math.ceil( o.pitchWidthTop  * o.goalWidthRatio );
        o.goalHeight      = o.goalHeight      || Math.ceil( o.goalWidth      * o.goalHeightRatio );

        o.formation = this.formation 	  = eval("["+this.options.formation.toString()+"]");
     
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

        // Player Row locations y (stagger back by small sidelineInsets)
        xy.playerRow = [];
        
        for( var i=0; i<o.formation.length; i++ ) {
        	switch (i)
        	{
        	case 0: var tmpPos = Math.round( (xy.goal.base + xy.sixYd.base) / 2 );
        			var tmpIn = Math.ceil( (o.pitchHeight - tmpPos ) * Math.tan(o.pitchAngle) );
        			xy.playerRow[i] = {			    	// Goalkeeper: Halfway in 6yrd box
        	    		ypos: 	 tmpPos,
        	    		indent:  tmpIn,
        	    		spacing: Math.ceil( (o.pitchWidthBase - 2*tmpIn) / (o.formation[i].length + 1) )
    	    		};
        			break;
        	case 1: var tmpPos = xy.eighteenYd.base;
        			var tmpIn = Math.ceil( (o.pitchHeight - tmpPos) * Math.tan(o.pitchAngle) );
        			xy.playerRow[i] = {					// Defenders:  On edge of 18yrd box
			            ypos: 	 tmpPos,
			            indent:  tmpIn,
    	    			spacing: Math.ceil( (o.pitchWidthBase - 2*tmpIn) / (o.formation[i].length + 1) )
			        }
        			break;
        	default:var tmpPos = Math.round( xy.playerRow[i-1].ypos + 
        					(xy.sideline.base - xy.eighteenYd.base - 2 * o.sidelineInset)
        					/ (o.formation.length - 2) );
        			var tmpIn = Math.ceil( (o.pitchHeight - tmpPos) * Math.tan(o.pitchAngle) );
        			xy.playerRow[i] = {				// Mids + Att: Equally positioned to halfway
		            	ypos: tmpPos,
					    indent: tmpIn,
						spacing: Math.ceil( (o.pitchWidthBase - 2*tmpIn) / (o.formation[i].length + 1) )
	        		}
        			break;
        	}// switch
        	//console.log("playerRow",i,this.xy.playerRow,o.formation[i]);

        }// for each formation row
    },
    getInitHeight: function() {
        return 206;
    },
    getInitWidth: function() {
        return 345;
    },
    // Custom wrapper because two pitches are drawn
    createWrapper: function() {
        this.wrapper = $("<div class='svg-wrapper "+ this.options.team +"'></div>").insertAfter( this.table[0] || this.element[0] ); // Create a new one
        this.createWrapperInit();
        return this.wrapper;
    },
    
    draw: function() {
    	this.drawPitch();
    	this.drawGoal();
        this.drawSixYdBox();
        this.drawEighteenYdBox();
        this.drawSidelines();
        this.drawUnderground();
        this.drawPlayerLabels();
        this.addTooltips( this.options.team );
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
    drawPlayerLabels: function() {
    	var playerId;		// PlayerId for lookup in table data
    	var playerCount = 0;
   	
    	// Get spacing for each team formation row (eg 4, GK, DF, MF, AT)
    	for ( var i=0, n=this.formation.length; i<n; i++ ) {

    		//console.log('Formation ',i,this.formation[i]);
    		
    		// For each player in formation row
    		for ( var j=0; j<this.formation[i].length; j++ ) {
    			// Get data for playerId
    			playerId = this.formation[i][j];
    			
    			var player = this.player = this.player || {};
    			
    			player.img   = this.data.strings[playerId].img		|| '';
    	    	player.name  = this.data.strings[playerId].players	|| '-'; 
	    		player.eappi = this.data.values[playerId].eappi		|| '-';
	    		player.fpl   = this.data.values[playerId].fpl		|| '-';
	    		player.bfr   = this.data.values[playerId].bfr		|| '-';
    			
    			// Draw label relative to origin point
    	    	/********************************************
    	    	this.sprite.label = this.canvas.path([
    	    	    "M","[x]","playerRow[i].ypos",
    	    	    "h", labelSq,
    	    	    "v", labelSq,
    	    	    "l", -labelTri, labelTri,
    	    	    "l", -labelTri, -labelTri,
    	    	    "Z"
    	    	]).attr({
    	    		"fill": this.data.rows[this.data.rowNames[0]].color,
    	    		"stroke-width": 0.001
    	    	});
    	    	*********************************************/
    	    	// Label height = 2/3 square and 1/3 triangle tip
    	    	var labelSq  = this.options.labelSize * 2 / 3;
    	    	var labelTri = this.options.labelSize / 3;
    	    	var labelMargin   = {
    	    		x: this.xy.playerRow[i].indent + (j+1) * this.xy.playerRow[i].spacing - labelSq/2,
    	    		y: this.xy.playerRow[i].ypos-this.options.labelSize
    	    	}
	    	    
    	    	this.sprite.label = this.canvas.path([
	    	  	    "M", labelMargin.x, labelMargin.y,
	    	  	    "h", labelSq,
	    	  	    "v", labelSq,
	    	  	    "l", -labelTri,  labelTri,
	    	  	    "l", -labelTri, -labelTri,
	    	  	    "Z"
	    	  	]).attr({
	    	  		"fill": this.data.rows[this.data.rowNames[0]].color,
	    	  		"stroke-width": 0.001,
	    	  		"href":"#pLabel" + playerCount
	    	  	});
	    	    
    			// addTooltip()
	    	    /********************************************
    	    	layout:
    	    	<div class="tooltip player">
    	    		<img src="--" alt="XXX XXX" />
    	    		<span class="name">
    	    			#. <a href="<%= playerTabUrl...(${playerId}) %>">
	    	    			XXXXX XXXXXX
	    	    		</a>
	    	    		<span class="goal"></span>
	    	    		<span class="Y">Y</span>
	    	    		<span class="R">R</span>
	    	    		<span class="sub">(##)</span>
	    	    	</span>
	    	    	<table>
	    	    		<tr><td class="ea-ppi">EA PPI</td><td>${EAPPI}</td></tr>
	    	    		<tr><td class="fpl">FPL</td><td>${FPL}</td></tr>
	    	    		<tr><td class="bfr">BFR</td><td>${BFR}</td></tr>
	    	    	</table>
    	    	</div>
    	    	*********************************************/
	    	    var tooltipHTML = "<div class=\"tooltip player\" id=\"playerTip"
	    	    	+ playerCount + this.options.team + "\">"
	    	    	+ this.player.img
	    	    	+ "<span class='name'>" 		  + this.player.name + "</span>"
	    	    	+ "<table>"
	    	    	+ "<tr><td>EA PPI</td><td class='ea-ppi'>" + this.player.eappi + "</td></tr>"
	    	    	+ "<tr><td>FPL</td>   <td class='fpl   '>" + this.player.fpl   + "</td></tr>"
	    	    	+ "<tr><td>BFR</td>   <td class='bfr   '>" + this.player.bfr   + "</td></tr>"
    	    		+ "</table>"
    	    		+ "</div>";
	    	    
	    	    $('body').append(tooltipHTML);
	    	    playerCount++;
    		} // for each player
    	} // for each formation row
    },
    addTooltips: function( team ) {
    	
    	this.wrapper.hover(function(){
	    	// Select all linked paths in the team's wrapper
	    	$('a','.svg-wrapper.' + team).each(function(){
	    		var $t = $(this);
	    		var labelAttr = $t.attr("href");
	    		var myidx = labelAttr.replace("#pLabel","");
	
	    		var baseOffset = $t.offset();
	    		var lStr = (baseOffset.left - 90)+"px",
	    		    tStr = (baseOffset.top  - 110)+"px";
	
	    		// Add to CSS for each tooltip
	    		var $target = $('div#playerTip' + myidx + team);
	    		$target.css({
	    			"position":"absolute",
	    			"z-index":"900000",
	    			"top":tStr,
	    			"left":lStr,
	    		    "display":"none"
	    		});
	
	    		// Add toggle event for mouseover
        		$t.click(function() {
        		    $target.fadeIn();
        		});
        		$t.mouseout(function() {
        		    $target.delay(2000).fadeOut();
        		});
	    	});
    	},
    	{
    		//do nothing
    	});
    },
    /**
     *  Parses a HTML table
     *  @param  {jQuery} table  table to parse
     *  @return {Hash} data
     *                 data.values   // {Hash<Row|Col><Col|Row>} = {Number}
     *                 data.rows     // {Hash<Col>} = {Hash<attribute>}
     *                 data.cols     // {Hash<Row>} = {Hash<attribute>}
     *                 data.totals   // {Hash<Row|Col>} = {Number}
     *                 data.colNames // {Array} = Col
     *                 data.rowNames // {Array} = Row
     *                 data.label    // {String}
     */
    parseHtmlTable: function( table ) {
        if( !this.table ) { this.getTableNode(); }

        var data = {};
        data.values  = {};  // {Hash<Row|Col><Col|Row>} = {Number}
        data.strings = {};  // {Hash<Row|Col><Col|Row>} = {String}
        data.rows = {};     // {Hash<Col>} = {Hash<attribute>}
        data.cols = {};     // {Hash<Row>} = {Hash<attribute>}
        data.colNames = []; // {Array} = Col
        data.rowNames = []; // {Array} = Row

        data.label = this.element.find(".label").text()
                  || this.table.find("thead .label").text()
                  || this.element.children().first().text();

        var cols = this.table.find("thead th").not(":first-child, .ignore");
        var rows = this.table.find("tbody tr").not(".ignore");

        for( var i=0, n=cols.length; i<n; i++ ) {
            var text    = $.trim( $(cols[i]).text() );
            var colData = $.getAttributeHash( cols[i], { name: text, index: i } );
            var colName = colData["class"]; // Allow HTML override
            data.cols[colName] = colData;
            data.colNames.push( colName );
        }

        for( var i=0, n=rows.length; i<n; i++ ) {
            var rowHead = $(rows[i]).find("th");
            var text    = $.trim( rowHead.text() );
            var rowData = $.getAttributeHash( rows[i], { name: text, index: i } );
            var rowName = rowData["name"];
            data.rows[rowName] = rowData;

            if( this.element.attr("nodeName") === "TR" && this.element[0] !== rows[i] ) {
                // Don't add to data.rowNames
                $.noop();
            } else {
                data.rowNames.push( rowName );
            }

            var cells = $(rows[i]).find("td");
            for( var j=0, m=cells.length; j<m; j++ ) {
                var string = $.trim( $(cells[j]).html() ); // Get inner HTML
                var value  = Number( string.replace(/[^\d\.+-]/g, '') );
                var colName = data.colNames[j];

                data.values[rowName] = data.values[rowName] || {};
                data.values[colName] = data.values[colName] || {};
                data.values[rowName][colName] = value;
                data.values[colName][rowName] = value;

                data.strings[rowName] = data.strings[rowName] || {};
                data.strings[colName] = data.strings[colName] || {};
                data.strings[rowName][colName] = string;
                data.strings[colName][rowName] = string;
            }
        }
        return data;
    }

});
