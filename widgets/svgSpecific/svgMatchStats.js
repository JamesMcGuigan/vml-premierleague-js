/**
 * Shots list item currently commented out.
 */

$.ui.svgWidget.subclass('ui.svgMatchPitch', {
    klass: "$.ui.svgMatchPitch",
    options: {
        colorGoal:             "#cccccc",
        colorLabel:            "#ffffff",
        colorPenaltyLine:      "#ffffff",
        colorStripeDark:       "#139124",
        colorStripeLight:      "#35a63f",
        colorUnderGround:      "#035c0f",
        stripeCount:          16,
        pitchAngle:           45,
        pitchWidthBase:      710,
        pitchHeight:         160,
        pitchDepth:           11,
        goalWidthRatio:        0.15,   // GoalWidth/PitchHeight
        goalHeightRatio:       0.333,  // GoalHeight/GoalWidth - 8 feet by 8 yards
        goalThickness:         3,      // px
        sidelineInset:           4,
        sidelineThickness:     2,
        sidelineOpacity:       0.9,
        labelSize:               15
    },



    //***** Init *****//

    _init: function() {
        this.draw();
    },
    draw: function() {
        this.drawPitch();
        this.drawSixYdBoxes();
        this.drawEighteenYdBoxes();
        this.drawSidelines();
        this.drawUnderground();
        this.element.hide();
    },



    //***** Data *****//

    parseOptions: function( o ) {
        o = o || this.options;
        o.pitchIndent     = o.pitchIndent     || Math.ceil( o.pitchHeight * Math.tan(o.pitchAngle * Math.PI / 180) );
        o.pitchWidthTop   = o.pitchWidthTop   || Math.ceil( o.pitchWidthBase - (o.pitchIndent * 2) );

        o.goalWidth       = o.goalWidth       || Math.ceil( o.pitchHeight    * o.goalWidthRatio );
        o.goalHeight      = o.goalHeight      || Math.ceil( o.goalWidth      * o.goalHeightRatio );
        return o;
    },
    calculateXY: function() {
        var xy = this.xy = this._super();
        var o  = this.options;

        xy.perspectiveWeight = 10;
        xy.origin = { x: 0, y: 0 };

        xy.pitch = {
            top:     xy.origin.y,
            base:    xy.origin.y + o.pitchHeight,
            centerx: xy.origin.x + o.pitchWidthBase/2,
            centery: xy.origin.y + o.pitchHeight/2
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
            base: xy.pitch.base - o.sidelineInset,
            center: xy.pitch.centerx
        };
        xy.sidelineTop = {
            left:   xy.pitchTop.left  + ( o.sidelineInset * Math.tan(o.pitchAngle * Math.PI / 180) ),
            right:  xy.pitchTop.right - ( o.sidelineInset * Math.tan(o.pitchAngle * Math.PI / 180) )
        };
        xy.sidelineBase = {
            left:   xy.pitchBase.left  + o.sidelineInset + ( o.sidelineInset * Math.tan(o.pitchAngle * Math.PI / 180) ),
            right:  xy.pitchBase.right - o.sidelineInset - ( o.sidelineInset * Math.tan(o.pitchAngle * Math.PI / 180) )
        };

        xy.sixYd = { //common
            top:  Math.round( xy.pitch.centery + o.goalWidth - xy.perspectiveWeight ),
            base: Math.round( xy.pitch.centery - o.goalWidth - xy.perspectiveWeight )
        };
        xy.sixYdHBase = {
               left:  Math.round( (o.pitchHeight - xy.sixYd.base) * o.pitchIndent / o.pitchHeight + o.sidelineInset+3 ),
               right: Math.round( (o.pitchHeight - xy.sixYd.base) * o.pitchIndent / o.pitchHeight + o.sidelineInset+28 )
        };
        xy.sixYdHTop = {
            left:  Math.round( (o.pitchHeight - xy.sixYd.top) * o.pitchIndent / o.pitchHeight + o.sidelineInset+3 ),
               right: Math.round( (o.pitchHeight - xy.sixYd.top) * o.pitchIndent / o.pitchHeight + o.sidelineInset+32 )
        };
        xy.sixYdABase = {
            left:  Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.sixYd.base) * o.pitchIndent / o.pitchHeight )- o.sidelineInset-3 ),
               right: Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.sixYd.base) * o.pitchIndent / o.pitchHeight )- o.sidelineInset-28 )
        };
        xy.sixYdATop = {
            left:  Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.sixYd.top) * o.pitchIndent / o.pitchHeight ) - o.sidelineInset-3 ),
               right: Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.sixYd.top) * o.pitchIndent / o.pitchHeight ) - o.sidelineInset-32)
        };

        xy.eighteenYd = { //common
            top:  Math.round( xy.pitch.centery + o.goalWidth * 1.8 - xy.perspectiveWeight ),
            base: Math.round( xy.pitch.centery - o.goalWidth * 1.5 - xy.perspectiveWeight )
        };
        xy.eighteenYdHBase = {
               left:  Math.round( (o.pitchHeight - xy.eighteenYd.base) * o.pitchIndent / o.pitchHeight + o.sidelineInset+3 ),
               right: Math.round( (o.pitchHeight - xy.eighteenYd.base) * o.pitchIndent / o.pitchHeight + o.sidelineInset+84 )
        };
        xy.eighteenYdHTop = {
            left:  Math.round( (o.pitchHeight - xy.eighteenYd.top) * o.pitchIndent / o.pitchHeight + o.sidelineInset+3 ),
               right: Math.round( (o.pitchHeight - xy.eighteenYd.top) * o.pitchIndent / o.pitchHeight + o.sidelineInset+110 )
        };
        xy.eighteenYdABase = {
            left:  Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.eighteenYd.base) * o.pitchIndent / o.pitchHeight )- o.sidelineInset-3 ),
               right: Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.eighteenYd.base) * o.pitchIndent / o.pitchHeight )- o.sidelineInset-84 )
        };
        xy.eighteenYdATop = {
            left:  Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.eighteenYd.top) * o.pitchIndent / o.pitchHeight ) - o.sidelineInset-3 ),
               right: Math.round( o.pitchWidthBase - ((o.pitchHeight - xy.eighteenYd.top) * o.pitchIndent / o.pitchHeight ) - o.sidelineInset-110)
        };
        xy.eighteenYdHArc = {
            /*left:  170,
            right: 200,
            curveX: xy.pitch.centery,
            curveY: Math.round( xy.eighteenYd.base + (xy.eighteenYd.top + xy.eighteenYd.base) / 6 )*/
        };
        xy.eighteenYdAArc = {
            /*left:  Math.round( xy.eighteenYdABase.left  + 1.5*(xy.eighteenYdABase.left + xy.eighteenYdABase.right)/18 ),
            right: Math.round( xy.eighteenYdABase.right - 1.5*(xy.eighteenYdABase.left + xy.eighteenYdABase.right)/18 ),
            curveX: xy.pitch.centerx,
            curveY: Math.round( xy.eighteenYd.base + (xy.eighteenYd.top + xy.eighteenYd.base) / 6 )*/
        };

        return this.xy;
    },



    //***** Render Functions *****//

    drawPitch: function() {
        // Dark stripes
        var darkPath  = [];
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
    drawSixYdBoxes: function() {
        // Penalty has no base, so loops back on itself
        this.sprite.box6home = this.canvas.path([
            "M", this.xy.sixYdHTop.left,   this.xy.sixYd.top,
            "L", this.xy.sixYdHTop.right,  this.xy.sixYd.top,
            "L", this.xy.sixYdHBase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdHBase.left,  this.xy.sixYd.base,

            "L", this.xy.sixYdHBase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdHTop.right,  this.xy.sixYd.top,
            "Z"
        ]);
        this.sprite.box6home.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        this.sprite.box6away = this.canvas.path([
            "M", this.xy.sixYdATop.left,   this.xy.sixYd.top,
            "L", this.xy.sixYdATop.right,  this.xy.sixYd.top,
            "L", this.xy.sixYdABase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdABase.left,  this.xy.sixYd.base,

            "L", this.xy.sixYdABase.right, this.xy.sixYd.base,
            "L", this.xy.sixYdATop.right,  this.xy.sixYd.top,
            "Z"
        ]);
        this.sprite.box6away.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
    },
    drawEighteenYdBoxes: function() {
        // Penalty has no base, so loops back on itself
        this.sprite.box18home = this.canvas.path([
             "M", this.xy.eighteenYdHTop.left,   this.xy.eighteenYd.top,
             "L", this.xy.eighteenYdHTop.right,  this.xy.eighteenYd.top,
             "L", this.xy.eighteenYdHBase.right, this.xy.eighteenYd.base,
             "L", this.xy.eighteenYdHBase.left,  this.xy.eighteenYd.base,

             "L", this.xy.eighteenYdHBase.right, this.xy.eighteenYd.base,
             "L", this.xy.eighteenYdHTop.right,  this.xy.eighteenYd.top,
             "Z"
         ]);
         this.sprite.box18home.attr({
             "stroke":         this.options.colorPenaltyLine,
             "stroke-width":   this.options.sidelineThickness,
             "stroke-opacity": this.options.sidelineOpacity
         });
         this.sprite.box18away = this.canvas.path([
            "M", this.xy.eighteenYdATop.left,   this.xy.eighteenYd.top,
            "L", this.xy.eighteenYdATop.right,  this.xy.eighteenYd.top,
            "L", this.xy.eighteenYdABase.right, this.xy.eighteenYd.base,
            "L", this.xy.eighteenYdABase.left,  this.xy.eighteenYd.base,

            "L", this.xy.eighteenYdABase.right, this.xy.eighteenYd.base,
            "L", this.xy.eighteenYdATop.right,  this.xy.eighteenYd.top,
            "Z"
            ]);
         this.sprite.box18away.attr({
             "stroke":         this.options.colorPenaltyLine,
             "stroke-width":   this.options.sidelineThickness,
             "stroke-opacity": this.options.sidelineOpacity
         });
        // Penalty box arc
        var arc = "M207,46S220,80,170,99Z";
        this.sprite.arc18home = this.canvas.path( arc );
        this.sprite.arc18home.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        arc = "M504,46S490,80,540,99Z";
        this.sprite.arc18away = this.canvas.path( arc );
        this.sprite.arc18away.attr({
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
        // Halfway Line
        this.sprite.halfway = this.canvas.path([
            "M", this.xy.pitch.centerx, this.xy.sideline.top,
            "L", this.xy.pitch.centerx, this.xy.sideline.base,
            "Z"
        ]);
        this.sprite.halfway.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        // Center Circle
        this.sprite.circle = this.canvas.ellipse(
           this.xy.pitch.centerx, this.xy.pitch.centery - this.xy.perspectiveWeight,
           this.options.pitchWidthBase/12, this.options.pitchHeight/6
        );
        this.sprite.circle.attr({
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity
        });
        this.sprite.circle = this.canvas.ellipse(
           this.xy.pitch.centerx, this.xy.pitch.centery - this.xy.perspectiveWeight,
           this.options.pitchWidthBase/200, this.options.pitchHeight/100
        );
        this.sprite.circle.attr({
            "fill":              this.options.colorPenaltyLine,
            "stroke":         this.options.colorPenaltyLine,
            "stroke-width":   this.options.sidelineThickness,
            "stroke-opacity": this.options.sidelineOpacity

        });
    }
});






$.ui.svgMatchPitch.subclass('ui.svgMatchStats', {
    klass: "$.ui.svgMatchPitch",
    options: {

    },
    _lastTooltipZIndex: 90000,  // {Number} keeps track of last tooltip z-index
    homeFormation: null, // {Array}
    awayFormation: null, // {Array}

    _create: function() {
        this.el.tooltips = $([]);
        this.el.labels   = $([]);
    },

    draw: function() {
        this._super();

        this.addNav();
        this.addNavEvents();

        this.drawPlayerLabels("Line-ups");
        this.element.hide();
    },



    //***** Getters / Setters *****//

    getTooltipForLabel: function( labelNode ) {
        var myidx   = $(labelNode).attr("href").replace("#pLabel","");
        var tooltip = this.el.tooltips.filter('div#playerTip' + myidx);
        return tooltip;
    },

    getColName: function( colNode ) {
        colNode = $(colNode);
        var colName = colNode.attr("class") || this._super(colNode);
        return colName;
    },

    getCellString: function( cellNode ) {
        var cellString = $(cellNode).html();
        return cellString;
    },



    //***** CalculateXY Functions ****//

    calculateFormations: function() {
        this.homeFormation = [];
        this.awayFormation = [];

        var pid, crow, prow = null;

        //11 players per team. Blatant hack. (Very) poor coding all round here.
        for( var i=0; i<11; i++ ) {
            pid  = this.data.rowNames[i];
            crow = this.data.values[pid].row;
            // If a new row, add a new 2nd-D array
            if(crow != prow) {
                this.homeFormation[crow] = new Array();
                this.homeFormation[crow].push(pid);
            } else {
                this.homeFormation[prow].push(pid);
            }
            prow = crow;
        }
        //Also predicting the data structure is not very good coding practise!
        //11 players per team. Blatant hack. (Very) poor coding all round here.
        for( var i=12; i<this.data.rowNames.length; i++ ) {
            pid  = this.data.rowNames[i];
            crow = this.data.values[pid].row;
            // If a new row, add a new 2nd-D array
            if(crow != prow) {
                this.awayFormation[crow] = new Array();
                this.awayFormation[crow].push(pid);
            } else {
                this.awayFormation[prow].push(pid);
            }
            prow = crow;
        }
    },


    calculateXY: function() {
        var xy = this.xy = this._super();
        var o  = this.options;

        this.calculateFormations();

        this.xy.playerRow = {};
        this.xy.playerRow.home = this.calculatePlayerRow( this.homeFormation, "home" );
        this.xy.playerRow.away = this.calculatePlayerRow( this.awayFormation, "away" );

        return this.xy;
    },

    calculatePlayerRow: function( teamFormation, homeAway ) {
        var xy = this.xy;
        var o  = this.options;
        var leftRight = (homeAway === "away") ? "right" : "left";
        var plusMinus = (homeAway === "away") ? -1 : 1;


        var playerRow = [];
        for( var i=0; i<teamFormation.length; i++ ) {
            switch (i) {
                // Goalkeeper: Halfway in 6yrd box
                case 0:
                    playerRow[i] = {
                        xtop:    Math.ceil( xy.pitchTop[leftRight]  + (plusMinus * o.pitchWidthTop/o.stripeCount  )),
                        xbottom: Math.ceil( xy.pitchBase[leftRight] + (plusMinus * o.pitchWidthBase/o.stripeCount )),
                        yspace:  xy.pitch.centery
                    };
                break;

                // Defenders:  On edge of 18yrd box
                case 1:
                    playerRow[i] = {
                        xtop:      Math.ceil( xy.pitchTop[leftRight]  + (plusMinus * 3*i * o.pitchWidthTop/o.stripeCount  )),
                        xbottom: Math.ceil( xy.pitchBase[leftRight] + (plusMinus * 3*i * o.pitchWidthBase/o.stripeCount )),
                        yspace:  Math.ceil( o.pitchHeight / (teamFormation[i].length+1) )
                    };
                break;

                // Mids + Att: Equally positioned to halfway
                default:
                    playerRow[i] = {
                        xtop:    Math.ceil( playerRow[i-1].xtop    + (xy.pitch.centerx + ( -plusMinus * o.pitchWidthTop/o.stripeCount)  - playerRow[1].xtop)    / (teamFormation.length - 2) ),
                        xbottom: Math.ceil( playerRow[i-1].xbottom + (xy.pitch.centerx + ( -plusMinus * o.pitchWidthBase/o.stripeCount) - playerRow[1].xbottom) / (teamFormation.length - 2) ),
                        yspace:  Math.ceil( o.pitchHeight / (teamFormation[i].length+1) )
                    };
                break;
            }
        }
        return playerRow;
    },




    //***** Render Functions *****//

    drawPlayerLabels: function( type ) {
        var playerId;        // PlayerId for lookup in table data
        var playerCount = 0;
        var shotLabels, goalLabels;

        this.el.labels.empty();

        // For each team formation row (eg 4, GK, DF, MF, AT)
        for ( var i=0, n=this.homeFormation.length; i<n; i++ ) {
            // For each player in formation row
            for ( var j=0; j<this.homeFormation[i].length; j++ ) {

                /***********************************
                 * Get data for playerId
                 **********************************/
                playerId = this.homeFormation[i][j];
                var player = this.player = this.player || {};
                    player.img   = this.data.strings[playerId].img;
                    player.name  = this.data.strings[playerId].player;
                    player.goals = this.data.values[playerId].goals        || '-';
                    player.shots = this.data.values[playerId].shots        || '-';

                if ( (type == "Shots" && player.shots > 0) ||
                     (type == "Goals" && player.goals > 0) ||
                     (type == "Line-ups") ) {

                    var labelSq  = this.options.labelSize * 2 / 3;
                    var labelTri = this.options.labelSize / 3;
                    var yHeight  = this.xy.pitch.top + (j+1) * this.xy.playerRow.home[i].yspace - 2*this.options.labelSize + (j+1)*2*this.xy.perspectiveWeight/3;
                    var xWidth   = this.xy.playerRow.home[i].xtop - this.xy.playerRow.home[i].xbottom;
                    var labelMargin   = {
                        x: Math.round( this.xy.playerRow.home[i].xtop - yHeight * xWidth / this.options.pitchHeight - labelSq/2 ),
                        y: Math.round( yHeight )
                    };

                    this.el.labels = this.el.labels.add( this.canvas.path([
                        "M", labelMargin.x, labelMargin.y,
                        "h", labelSq,
                        "v", labelSq,
                        "l", -labelTri,  labelTri,
                        "l", -labelTri, -labelTri,
                        "Z"
                    ]).attr({
                        "fill": this.data.rows[this.data.rowNames[playerCount]].color,
                        "stroke-width": 0.001,
                        "href":"#pLabel" + playerCount // this makes this label an <a> tag
                    }) );

                    // Tooltip HTML
                    var tooltipHTML = "<div class=\"tooltip player\" id=\"playerTip"
                        + playerCount +"\" style=\"display:none\">"
                        + this.player.img
                        + "<span class=\"name\">"           + this.player.name  + "</span>"
                        + "<table>"
                        + "<tr><td>Goals</td><td class='goals'>" + this.player.goals + "</td></tr>"
                        + "<tr><td>Shots</td><td class='shots'>" + this.player.shots + "</td></tr>"
                        + "</table>"
                        + "</div>";

                    this.el.tooltips = this.el.tooltips.add( $(tooltipHTML).appendTo(this.getWrapper()) );
                }

                playerCount++;

            } // for each player
        } // for each formation row

        playerCount++; // Increase to start next set of players

        // For each team formation row (eg 4, GK, DF, MF, AT)
        for ( var i=0, n=this.awayFormation.length; i<n; i++ ) {
            // For each player in formation row
            for ( var j=0; j<this.awayFormation[i].length; j++ ) {

                /***********************************
                 * Get data for playerId
                 **********************************/
                playerId     = this.awayFormation[i][j];
                player.img   = this.data.strings[playerId].img;
                player.name  = this.data.strings[playerId].player;
                player.goals = this.data.values[playerId].goals        || '-';
                player.shots = this.data.values[playerId].shots        || '-';

                if ( (type == "Shots" && player.shots > 0) ||
                        (type == "Goals" && player.goals > 0) ||
                        (type == "Line-ups") ) {

                    var yHeight = this.xy.pitch.top + (j+1) * this.xy.playerRow.away[i].yspace - 2*this.options.labelSize + (j+1)*2*this.xy.perspectiveWeight/3;
                    var xWidth  = this.xy.playerRow.away[i].xbottom - this.xy.playerRow.away[i].xtop;
                    var labelMargin = {
                        x: Math.round( this.xy.playerRow.away[i].xtop + yHeight * xWidth / this.options.pitchHeight - labelSq/2 ),
                        y: Math.round( yHeight )
                    };

                    this.el.labels = this.el.labels.add( this.canvas.path([
                        "M", labelMargin.x, labelMargin.y,
                        "h", labelSq,
                        "v", labelSq,
                        "l", -labelTri,  labelTri,
                        "l", -labelTri, -labelTri,
                        "Z"
                    ]).attr({
                        "fill": this.data.rows[this.data.rowNames[playerCount]].color,
                        "stroke-width": 0.001,
                        "href":"#pLabel" + playerCount // this makes this label an <a> tag
                    }) );

                    // Tooltip HTML
                    var tooltipHTML = "<div class=\"tooltip player\" id=\"playerTip"
                        + playerCount +"\" style=\"display:none\">"
                        + this.player.img
                        + "<span class=\"name\">"           + this.player.name  + "</span>"
                        + "<table>"
                        + "<tr><td>Goals</td><td class='goals'>" + this.player.goals + "</td></tr>"
                        + "<tr><td>Shots</td><td class='shots'>" + this.player.shots + "</td></tr>"
                        + "</table>"
                        + "</div>";

                    this.el.tooltips = this.el.tooltips.add( $(tooltipHTML).appendTo(this.getWrapper()) );

                }

                playerCount++;

            } // for each player
        } // for each formation row

        this.addTooltipEvents();
    },

    removePlayerLabels: function() {
        this.removeTooltipEvents();

        this.el.tooltips.emptyGC();
        this.el.tooltips = $([]);
        this.getWrapper().find("a").remove();
    },



    //***** Events *****//

    removeTooltipEvents: function() {
        var pitchLabels = this.getWrapper().find("a");
        pitchLabels.unbind("click mouseout mouseover");
    },

    addTooltipEvents: function() {
        var self = this;
        var wrapperOffset = this.getWrapper().offset();
        var pitchLabels   = this.getWrapper().find("a");

        pitchLabels.unbind("click mouseout mouseover");

        pitchLabels.each(function() {
            self.getTooltipForLabel(this).css({
                "position": "absolute",
                "z-index":  this._lastTooltipZIndex++,
                "top":      ($(this).offset().top  - wrapperOffset.top  - 110) + "px",
                "left":     ($(this).offset().left - wrapperOffset.left -  90) + "px",
                "display":  "none"
            });
        });

        pitchLabels.bind("click", function(event) {
            event.preventDefault();
        });

        pitchLabels.bind("mouseover click", function() {
            var tooltip = self.getTooltipForLabel(this);
            self.el.tooltips.not(tooltip).not(":hidden,:animated").fadeOut();
            tooltip.css("z-index", this._lastTooltipZIndex++);  // Ensure last referenced tooltip is always above
            tooltip.fadeIn();
        });

        pitchLabels.bind("mouseout", function() {
            var tooltip = self.getTooltipForLabel(this);
            setTimeout( function() {
                tooltip.not(":hidden,:animated").fadeOut("slow");
            }, 1500);
        });
    },



    //***** Nav *****//

    addNav: function() {
        this.el.nav = $(
            '<ul class="statstabs">' +
                '<li class="selected">Line-ups</li>' +
                // '<li>Shots</li>' + // No Shots for now
                '<li>Goals</li>' +
            '</ul>')
            .insertBefore(this.getWrapper());
    },
    addNavEvents: function() {
        var self = this;
        this.el.nav.children('li').bind("click",function(){
            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');

            self.removePlayerLabels();
            self.drawPlayerLabels( $(this).text() );
        });
    }
});
