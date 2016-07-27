$.ui.svgPieChart.subclass('ui.svgPieDoughnut', {
    klass: "$.ui.svgPieDoughnut",
    options: {
        rowName:     null,
        svgwidth:     200,
        radius:         0,
        insideRadius:   0,
        labelOffset:    0,
        labelSize:      10,
        sliceLabelSize: 14,
        anticlockwise:  true
    },
    parseOptions: function() {
        this._super();
        this.options.insideRadius = this.options.insideRadius || this.options.radius/2;
        return this.options;
    },
    calculateXY: function() {
        var o = this.options;
        var xy = this._super();

        xy.origin = { x: 0, y: 0 }; // Avoid cropping
        xy.label = {
            x: this.getInitWidth()/2,
            y: this.getInitHeight()/2
        };

        return xy;
    },
    getLabelText: function() {
        var text = this.data.label.replace(/\s+/, "\n").toUpperCase();
        return text;
    }
});
