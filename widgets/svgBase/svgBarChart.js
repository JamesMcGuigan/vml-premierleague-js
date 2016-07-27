/**
 *  Works for both tables and trs
 */
$.ui.svgWidget.subclass('ui.svgBarChart', {
    klass: "$.ui.svgBarChart",
    options: {
        barHeight:      0,
        barSpacing:    30,
        barWidth:       0,
        barFontSize:   20,
        barFontWeight: "bold"
    },
    _create: function() {
        // Automatically calls super::_create()
    },
    _init: function() {
        this.draw();
    },
    parseOptions: function() {
        this.options.barCount     = this.options.barCount     || this.data.rowNames.length * this.data.colNames.length;
        this.options.barSpacing   = this.options.barSpacing   || Math.round( this.getInitWidth()/this.options.barCount * 0.2 );
        this.options.barWidth     = this.options.barWidth     || Math.round( this.getInitWidth()/this.options.barCount - this.options.barSpacing );
        this.options.barHeight    = this.options.barHeight    || Math.round( this.getInitHeight() - this.getFontSize()*2.5 - this.options.barFontSize*1.5 );
    },
    draw: function() {
        this.drawData();
        this.table.hide();
    },
    drawData: function() {
        this.sprite.bars    = {};
        this.sprite.barText = this.canvas.set();
        this.sprite.labels  = this.canvas.set();

        var barCount = 0;
        for( var i=0, n=this.data.rowNames.length; i<n; i++ ) {
            var rowName         = this.data.rowNames[i];
            this.sprite.bars    = this.canvas.set();
            this.sprite.barText = this.canvas.set();

            for( var j=0, m=this.data.colNames.length; j<m; j++, barCount++ ) {
                var colName   = this.data.colNames[j];
                var barHeight = Math.round( this.options.barHeight * this.data.values[rowName][colName] / this.data.stats.max ) || 0;
                var barLeft   = Math.round( (this.options.barWidth + this.options.barSpacing) * barCount );
                var barBase   = this.options.barHeight + this.options.barFontSize*1.5;
                var barTop    = barBase - barHeight;
                var barColor  = this.data.cells[colName][rowName].color || this.data.rows[rowName].color;

                this.sprite.bars.push(
                    this.canvas.rect( barLeft, barTop, this.options.barWidth, barHeight )
                               .attr( "fill",   barColor )
                               .attr( "stroke", barColor )
                               .attr( "stroke-width", 0 )
                );

                var textY = barTop - this.options.barFontSize;
                if (this.options.showlabel) {
	                this.sprite.barText.push(
	                    this.canvas.text( barLeft, textY, this.data.strings[rowName][colName] )
	                               .attr( "fill",        this.options.labelColor )
	                               .attr( "font-size",   this.options.barFontSize )
	                               .attr( "font-weight", this.options.barFontWeight )
	                               .attr( "text-anchor", "start" )
	                );
                }

                var labelY = barBase + this.options.labelSize*1.5;
                var label  = colName.toUpperCase().replace(/^(.*) (.*?)$/, "$1\n$2"); // Replace last space
                if (this.options.showcollabel) {
	                this.sprite.labels.push(
	                    this.canvas.text( barLeft, labelY, label )
	                               .attr( "fill",        this.options.labelColor )
	                               .attr( "font-weight", this.options.labelWeight ) // Bold
	                               .attr( "style",       "text-align:left" )
	                               .attr( "text-anchor", "start" )
	                );
                }
            }
        }
    }
});
