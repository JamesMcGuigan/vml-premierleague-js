$.ui.svgWidget.subclass('ui.svgBackgroundNumbers', {
    klass: "$.ui.svgBackgroundNumbers",
    options: {
        image:       "",
        labelColor:  "black",
        labelSize:    12,
        labelWeight: 700,
        svgheight:   100,
        svgwidth:    100,
        nulldefault: "0",
        renderLabelBackgrounds: false,  // {Boolean} if true render label backgrounds
        labelBackground:       '#fff',  // {String}  default color to render label backgrounds, override in this.options.xy
        xy:    {},
        data:  {},
        textOffset: {     // {Hash} hack, for some reason Match->Past Meetings->GoalsByPitchPosition has shifted text
            x: 0,     
            y: 0
        },
        errormsg: "Detailed statistics are currently not available"
    },
    _init: function() {
        this.draw();
    },
    getTableNode: function() {
        return this.element; // Required for putting .svg-wrapper in the right place
    },
    hasData: function() {
        for( var key in this.options.data ) {
            return true;
        }
        return false;
    },
    draw: function() {
        this.drawImage();
        if( this.hasData() ) {
            this.drawText();
        } else {
            this.drawNoData();
        }
        this.element.hide();
    },
    drawImage: function() {
        this.getCanvas().image( this.options.image, 0, 0, this.getInitWidth(), this.getInitHeight() );
    },
    drawText: function() {
        for( var key in this.options.xy ) {
            if( key in this.options.data ) {
                var label = this.getLabelText(key);
                if( this.options.renderLabelBackgrounds ) {
                    this.renderLabelBackground(key, label);
                }
                this.renderLabelText(key,label);
            }
        }
    },
    getFontSize: function(key) {
        return Math.round(Number( this.options.xy[key] && this.options.xy[key].labelSize || this.options.labelSize ));
    },
    getLabelTitle: function( key ) {
        var title = String(key).replace(/([A-Z]+|[0-9]+)/g, " $1").toLowerCase().capitalize();
        return title;
    },
    getLabelText: function( key ) {
        var self = this;
        var text = (this.options.data[key] === null) ? this.options.nulldefault : String(this.options.data[key]);
        var label = "";
        if( text ) {
            var prefix  = this.options.xy[key].prefix  || "";
            var postfix = this.options.xy[key].postfix || "";
            prefix  = prefix.replace( /key:([\w\.]+)/g, function(all, first) { return $.getKey(first, self.data, "0"); });
            postfix = postfix.replace(/key:([\w\.]+)/g, function(all, first) { return $.getKey(first, self.data, "0"); });

            label = String(prefix + String(text) + postfix).trim();
        }
        return label;
    },
    getLabelXY: function( key, label ) {
        var fontSize = this.getFontSize(key);

        this.options.xy[key]       = this.options.xy[key]       || {};
        this.options.xy[key].label = this.options.xy[key].label || {};

        var labelXY    = this.options.xy[key].label;
        labelXY.x      = this.options.xy[key].x;
        labelXY.y      = this.options.xy[key].y;
        labelXY.width  = fontSize * 0.5 * (label.length + 2.5);
        labelXY.height = fontSize * 1.5;
        labelXY.top    = labelXY.y - labelXY.height/2;
        labelXY.base   = labelXY.y + labelXY.height/2;
        labelXY.left   = labelXY.x - labelXY.width/2;
        labelXY.right  = labelXY.x + labelXY.width/2;
        labelXY.tip = {
            center: labelXY.x,
            top:    labelXY.base,
            base:   labelXY.base + fontSize/3,
            left:   labelXY.x    - fontSize/3,
            right:  labelXY.x    + fontSize/3
        };
        return labelXY;
    },
    renderLabelBackground: function( key, label ) {
        var labelXY = this.getLabelXY( key, label );
        this.getCanvas().path([
            "M", labelXY.left,       labelXY.base,
            "L", labelXY.left,       labelXY.top,
            "L", labelXY.right,      labelXY.top,
            "L", labelXY.right,      labelXY.base,
            "L", labelXY.tip.right,  labelXY.tip.top,
            "L", labelXY.tip.center, labelXY.tip.base,
            "L", labelXY.tip.left,   labelXY.tip.top,
            "Z"
        ]).attr({
            "fill":			this.options.xy[key].labelBackground || this.options.labelBackground,
            "stroke":       this.options.xy[key].labelBackground || this.options.labelBackground,
            "stroke-width":	"1px"
        });
    },
    renderLabelText: function( key, label ) {
        var fontSize = this.getFontSize(key);

        var node  = this.canvas.text( 
            this.options.xy[key].x + (this.options.textOffset.x||0),
            this.options.xy[key].y + (this.options.textOffset.y||0),
            label );
        node.attr({
            "title":       this.getLabelTitle(key),
            "font-size":   fontSize,
            "fill":        this.options.xy[key].labelColor  || this.options.labelColor,
            "font-weight": this.options.xy[key].labelWeight || this.options.labelWeight
        });
    },
    drawNoData: function() {
        this.getCanvas().rect( 0, 0, this.getInitWidth(), this.getInitHeight() ).attr({
            "fill":			"#ffffff",
            "stroke-width":	"1px",
            "stroke": 		"#ffffff",
            "opacity":  	0.7
        });

        var node = this.canvas.text( this.options.svgwidth / 2, this.options.svgheight / 2, this.options.errormsg );
        node.attr({
            "font-size":   Math.round( this.options.labelSize * 1.1 ),
            "fill":        this.options.labelColor,
            "font-weight": this.options.labelWeight
        });
    }
});
$.ui.svgBackgroundNumbers.subclass('ui.svgGoalsByPitchPosition', {
    klass: "$.ui.svgGoalsByPitchPosition",
    options: {
        image: "/etc/designs/premierleague/images/svg/goalsByPitchPositionBlank.png",
        svgheight: 194,
        svgwidth:  345,
        labelSize:  11,
        renderLabelBackgrounds: true,
        xy: {
            fromLeft6YardArea:       { x: 157, y:  28, postfix: "%", labelBackground: "#FF9900" },
            fromRight6YardArea:      { x: 187, y:  28, postfix: "%", labelBackground: "#FF9900" },
            fromLeftOfPenaltyArea:   { x: 125, y:  38, postfix: "%", labelBackground: "#FF9900" },
            fromRightOfPenaltyArea:  { x: 221, y:  38, postfix: "%", labelBackground: "#FF9900" },
            fromCentreOfPenaltyArea: { x: 172, y:  62, postfix: "% + key:fromPenaltySpot% pen", labelBackground: "#EE6E19" },
            fromLeftByline:          { x:  72, y:  45, postfix: "%", labelBackground: "#FFF" },
            fromRightByline:         { x: 275, y:  45, postfix: "%", labelBackground: "#FFF" },
            fromLeftWing:            { x:  58, y: 106, postfix: "%", labelBackground: "#FFF" },
            fromRightWing:           { x: 290, y: 106, postfix: "%", labelBackground: "#FFF" },
            fromLeftChannel:         { x: 132, y: 116, postfix: "%", labelBackground: "#FF9900" },
            fromRightChannel:        { x: 211, y: 116, postfix: "%", labelBackground: "#FF9900" },
            fromOwnHalf:             { x: 172, y: 165, postfix: "%", labelBackground: "#FFF" }
        }
    }
});
$.ui.svgBackgroundNumbers.subclass('ui.svgShotsScored', {
    klass: "$.ui.svgShotsScored",
    options: {
        image: "/etc/designs/premierleague/images/svg/shotsScored.png",
        svgheight: 194,
        svgwidth:  345,
        labelColor: '#666666',
        xy: {
            //total:                   { x: 169, y: 176, labelColor: '#609dca' },
            percentageHighLeftOfNet:   { x: 130, y:  55, postfix: "%" },
            percentageHighCentreOfNet: { x: 169, y:  55, postfix: "%" },
            percentageHighRightOfNet:  { x: 208, y:  55, postfix: "%" },
            percentageLowLeftOfNet:    { x: 130, y:  82, postfix: "%" },
            percentageLowCentreOfNet:  { x: 169, y:  82, postfix: "%" },
            percentageLowRightOfNet:   { x: 208, y:  82, postfix: "%" }
        }
    }
});
$.ui.svgBackgroundNumbers.subclass('ui.svgShotsMissed', {
    klass: "$.ui.svgShotsMissed",
    options: {
        image: "/etc/designs/premierleague/images/svg/shotsMissed.png",
        svgheight: 194,
        svgwidth:  345,
        labelColor: '#666666',
        xy: {
            //total:                   { x: 170, y: 176, labelColor: '#609dca' },
            percentageWideHighLeft:    { x:  82, y:  35, postfix: "%" },
            percentageWideHighRight:   { x: 260, y:  35, postfix: "%" },
            percentageWideLeft:        { x:  82, y:  82, postfix: "%" },
            percentageWideRight:       { x: 260, y:  82, postfix: "%" },
            percentageHitPostLeft:     { x: 109, y:  60, postfix: "%" },
            percentageHitPostRight:    { x: 232, y:  60, postfix: "%" },
            percentageHitCrossbar:     { x: 170, y:  38, postfix: "%" },
            percentageHitOverCrossbar: { x: 170, y:  12, postfix: "%" }
        }
    }
});
