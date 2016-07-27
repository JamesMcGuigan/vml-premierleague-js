$.ui.svgWidget.subclass('ui.svgHorizontalBar', {
    klass: "$.ui.svgHorizontalBar",
    options: {
        rowHeight:     20,
        cardHeight:    12,
        rowSpacing:     2,
        rowWidth:    null,
        centerWidth:  128,
        rowBackground:    "#f0f0f0",
        centerBackground: "#ffffff"
    },
    _create: function() {
        // Automatically calls super::_create()
    },
    _init: function() {
        this.options.rowWidth     = this.options.rowWidth     || Math.round( (this.getInitWidth()   - this.options.centerWidth)/2 );
        this.options.barOffset    = this.options.barOffset    || Math.round( this.options.rowHeight + this.options.rowSpacing );
        this.options.leftOffset   = this.options.leftOffset   || Math.round( 0 );
        this.options.centerOffset = this.options.centerOffset || Math.round( this.options.leftOffset + this.options.rowWidth + this.options.centerWidth/2 );
        this.options.rightOffset  = this.options.rightOffset  || Math.round( this.getInitWidth()     - this.options.rowWidth );
        this.options.browserTextOffset = $.browser.msie ? 2 : 0; // Annoying rendering bug in MSIE
        this.options.textHeightOffset = this.options.textHeightOffset || Math.round( this.options.rowHeight/2 + this.options.browserTextOffset );

        this.draw();
    },
    getInitHeight: function() {
        var canvasHeight = this.data.colNames.length * (this.options.rowHeight + this.options.rowSpacing ) - this.options.rowSpacing;
        return canvasHeight;
    },
    draw: function() {
        this.drawBackground();
        this.drawBackgroundBars();
        this.drawForegroundBars();
        this.drawLabels();
        this.table.hide();
    },
    drawBackgroundBars: function() {
        this.sprite.backgroundBars = this.canvas.set();
        for( var i=0, n=this.data.colNames.length; i<n; i++ ) {
            var colName   = this.data.colNames[i];
            
            switch( this.data.cols[colName].display ) {
                case "card": break;
                case "number": // follow through
                default:
                    this.sprite.backgroundBars.push(
                        this.canvas.rect( this.options.leftOffset,  this.options.barOffset*i, this.options.rowWidth, this.options.rowHeight ),
                        this.canvas.rect( this.options.rightOffset, this.options.barOffset*i, this.options.rowWidth, this.options.rowHeight )
                    );
            }
        }
        this.sprite.backgroundBars.attr({ 
            "fill":   this.options.rowBackground, 
            "stroke": this.options.rowBackground, // Chrome needs this set explicitly
            "stroke-width": 0 
        });
    },
    drawForegroundBars: function() {
        if( this.sprite.bars    ) { this.sprite.bars.remove(); }
        if( this.sprite.barText ) { this.sprite.barText.remove(); }

        this.sprite.bars    = this.canvas.set();
        this.sprite.barText = this.canvas.set();

        for( var teamName in this.data.rows ) {
            for( var i=0, n=this.data.colNames.length; i<n; i++ ) {
                var colName   = this.data.colNames[i];
                var barColor  = this.data.cols[colName].color || this.data.rows[teamName].color || this.options.color;

                switch( this.data.cols[colName].display ) {
                    case "card":
                        var barHeight  = this.options.cardHeight;
                        var barWidth   = Math.round( barHeight / 1.6 );     // Golden Ratio
                        var barHOffset = Math.round( this.options.rowHeight - barHeight )/2;
                        break;
                    case "number":
                        var barHeight  = this.options.rowHeight;
                        var barWidth   = 0;
                        var barHOffset = 0;
                        break;
                    default:
                        var barHeight  = this.options.rowHeight;
                        var barWidth   = Math.round( 0.95 * this.options.rowWidth * this.data.values[teamName][colName] / this.data.stats.max ) || 0;
                        var barHOffset = 0;
                        break;
                }

                var text = String(this.data.values[teamName][colName]);//.replace( /(\d+\.\d\d\d)\d+$/, '$1'); // round to 3dp if required
                if ( this.data.cols[colName].display == "label" ) {
                    text = this.data.strings[teamName][colName];
                }
                var textWidth = text.length * this.getFontSize()/5; // Offset for large numbers
                switch( this.data.rows[teamName].index % 2 ) {
                    case 0:
                        var sideOffset = Math.round( this.options.leftOffset + this.options.rowWidth - barWidth );
                        if( barWidth > this.options.rowHeight ) {
                            var textOffset = Math.round( this.options.rowWidth - textWidth - this.options.rowHeight/4);
                            var textColor  = "white";  // Inside the bar
                            if (barColor == "#FFFFFF" || barColor == "#ffffff" || barColor == "white") {
                                textColor = "black";
                            }
                        } else {
                            if (barColor == "#FFFFFF" || barColor == "#ffffff" || barColor == "white") {
                                var textOffset = Math.round( this.options.rowWidth - textWidth - this.options.rowHeight/4);
                            }
                            else {
                                var textOffset = Math.round( sideOffset - this.options.rowHeight/4 - textWidth );
                            }
                            var textColor  = "black";  // Outside the bar
                        }   
                        break;
                    case 1:
                        var sideOffset = Math.round( this.options.rightOffset );
                        if( barWidth > this.options.rowHeight ) {
                            var textOffset = Math.round( sideOffset + this.options.rowHeight/4 + textWidth);
                            var textColor  = "white"; // Inside the bar
                            if (barColor == "#FFFFFF" || barColor == "#ffffff" || barColor == "white") {
                                textColor = "black";
                            }
                        } else {
                            if (barColor == "#FFFFFF" || barColor == "#ffffff" || barColor == "white") {
                                var textOffset = Math.round( sideOffset + this.options.rowHeight/4 + textWidth);
                            }
                            else {
                                var textOffset = Math.round( sideOffset + barWidth + this.options.rowHeight/4 + textWidth);
                            }
                            var textColor  = "black"; // Outside the bar
                        }
                        break;
                    default:
                        console.error(this.klass ,':drawData(): invalid this.data.rows[',teamName,'].side ', this.data.rows[teamName].side);
                        break;
                }
                
                if (barColor == "#FFFFFF" || barColor == "#ffffff" || barColor == "white") {
                   /* this.sprite.bars.push(
                        this.canvas.rect( sideOffset, this.options.barOffset*i+barHOffset, barWidth, barHeight )
                                   .attr( "fill",   barColor )
                                   .attr( "stroke", "#666666" )
                                   .attr( "stroke-width", 0.2 )
                    );*/
                } else {
                    this.sprite.bars.push(
                        this.canvas.rect( sideOffset, this.options.barOffset*i+barHOffset, barWidth, barHeight )
                                   .attr( "fill",   barColor )
                                   .attr( "stroke", barColor )
                                   .attr( "stroke-width", 0 )
                    );
                }

                this.sprite.barText.push(
                    this.canvas.text( textOffset, (this.options.barOffset*i+this.options.textHeightOffset), text )
                               .attr( "fill",        textColor )
                               .attr( "font-weight", this.options.labelWeight ) // Bold
                );
            }
        }
    },
    drawLabels: function() {
        this.sprite.labels = this.canvas.set();
        for( var i=0, n=this.data.colNames.length; i<n; i++ ) {
            this.sprite.labels.push(
                this.canvas.text(
                    this.options.centerOffset,
                    this.options.barOffset*i + this.options.textHeightOffset,
                    this.data.colNames[i].toUpperCase()
                )
            );
        }
        this.sprite.labels.attr( "fill",        this.options.labelColor )
                          .attr( "font-weight", this.options.labelWeight ); // Bold
    }
});
