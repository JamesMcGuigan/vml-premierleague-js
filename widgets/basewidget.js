/**
 *  This is the base widget for common functionality between all widgets
 */
$.ui.widget.subclass('ui.basewidget', {
    klass: "$.ui.basewidget",
    options: {                   // {Hash} auto-extended - provides defaults for html expando properties
    },
    required: {                  // {Hash} Validation rules for options
    },
    requiredElements: {          // {Hash} Validation rules for this.el lookups, first line of _init()
    },
    el: null,                    // {Hash} namespace for all jQuery references
    data: null,                  // {Hash} storage for parseHtmlTable() - not called by default, except in svgWidget

    /**
     *  _create(), _init() and destroy() are automattically called before there subclass counterparts
     */
    _create: function() {
        this.el = {};
        this.data = {};
        this.options = $.getAttributeHash( this.element, this.options );
        this.validateOptions();

        this.element.data("widget", this);
    },
    _init: function() {
        this.validateRequiredElements();
    },

    _destroyed: false,
    destroy: function() {
        if( this._destroyed ) {
            return;
        } else {
            this._destroyed = true;
        }

        this.unregisterEventManager();

        for( var key in this.el ) {
            if( this.el[key] instanceof jQuery ) {
                this.el[key].prevObject = undefined;
                this.el[key] = $.ui.basewidget.emptyjQuery;
            } else if( this.el[key] instanceof Array ) {
                this.el[key] = [];
            } else {
                this.el[key] = {};
            }
        }
        this.element.data("widget", null);
        this.element.prevObject = undefined;
        this.element = $.ui.basewidget.emptyjQuery;
        this.options = {};
    },

    validateOptions: function() {
        // Validate widget
        for( var field in this.required ) {

            // Values
            if( typeof this.required[field] === "boolean" ) {
                if( this.required[field] === true ) {
                    if( !this.options[field] && this.options[field] !== 0 ) {
                        console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must be defined - this.options: ", this.options, " - this: ", this );
                    }
                }
            }
            // Class literals
            else if( this.required[field] === Array || this.required[field] === RegExp ) {
                if( !(this.options[field] instanceof this.required[field]) ) {
                    console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must be of type ", this.required[field], " - this.options: ", this.options, " - this: ", this );
                }
            }
            else if( this.required[field] === Number || this.required[field] === String || this.required[field] === Object || this.required[field] === Boolean ) {
                var type = "";
                switch( this.required[field] ) {
                    case Number:  type = "number";  break;
                    case String:  type = "string";  break;
                    case Object:  type = "object";  break;
                    case Boolean: type = "boolean"; break;
                    default:      type = "";        break;
                }
                if( typeof this.options[field] !== type ) {
                    console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must be of type ", this.required[field], " - this.options: ", this.options, " - this: ", this );
                }
            }

            // Explicit Options
            else if( this.required[field] instanceof Array ) {
                var isValid = false;
                for( var i=0, n=this.required[field].length; i<n; i++ ) {
                    if( this.options[field] === this.required[field][i] ) {
                        isValid = true;
                        break;
                    }
                }
                if( !isValid ) {
                    console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must be one of: ", this.required[field], " - this.options: ", this.options, " - this: ", this );
                }
            }

            // Functions
            else if( this.required[field] instanceof RegExp ) {
                if( String.match( String(this.options[field]), this.required[field]) === null ) { // This works on numbers too
                    console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must match ", this.required[field].toString(), " - this.options: ", this.options, " - this: ", this );
                }
            }
            else if( this.required[field] instanceof Function ) {
                if( !this.required[field]( this.options[field] ) ) {
                    console.error( this.klass, ":_init(): this.options.", field, ": ", this.options[field], " must match ", this.required[field].toString(), " - this.options: ", this.options, " - this: ", this );
                }
            }

            else {
                console.error( this.klass, ":_init(): this.required.", field, ": ", this.required[field], " is invalid - this: ", this );
            }
        }
    },
    validateRequiredElements: function() {
        if( this.requiredElements ) {
            for( var field in this.requiredElements ) {
                var node = this.el[field];
                var condition = this.requiredElements[field];

                if( !node ) {
                    console.error(this.klass+":validateRequiredElements() - this.el."+field+" was not defined: ", this.el[field], " - this: ", this);               
                }
                else if( !node.jquery ) {
                    console.error(this.klass+":validateRequiredElements() - this.el."+field+" is not of type jQuery: ", this.el[field], " - this: ", this);               
                }
                else if( condition === true ) {
                    if( node.length === 0 ) { 
                        console.error(this.klass+":validateRequiredElements() - this.el."+field+" matches no elements: ", this.el[field], " - this: ", this);               
                    }
                } 
                else if( typeof condition === "number" ) {
                    if( node.length === condition ) { 
                        console.error(this.klass+":validateRequiredElements() - this.el."+field+" must match exactly ", condition ," this: ", this.el[field], this);               
                    }
                }
            }
        }
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
        data.cells = {};    // {Hash<Row><Col>} = {Hash<attribute>}
        data.totals = {};   // {Hash<Row|Col>} = {Number}
        data.colNames = []; // {Array} = Col
        data.rowNames = []; // {Array} = Row
        data.stats = {
            max:   Number.MIN_VALUE, // Datasets will not always include zero in their range
            min:   Number.MAX_VALUE,
            count: 0,
            avg:   0,
            total: 0
        };

        data.label = this.element.find(".label").text()
                  || this.table.find("thead .label").text()
                  || this.element.children().first().text();

        var cols = this.table.find("thead th").not(":first-child, .ignore");
        var rows = this.table.find("tbody tr").not(".ignore");

        for( var i=0, n=cols.length; i<n; i++ ) {
            var colName = this.getColName( cols[i] ); // Allow HTML override
            var colData = $.getAttributeHash( cols[i], { name: colName, index: i, node: cols[i] } );
            data.cols[colName] = colData;
            data.colNames.push( colName );
        }

        for( var i=0, n=rows.length; i<n; i++ ) {
            var rowName = this.getRowName( rows[i] );
            var rowData = $.getAttributeHash( rows[i], { name: rowName, index: i, node: rows[i] } );
            data.rows[rowName] = rowData;

            if( this.element.attr("nodeName") === "TR" && this.element[0] !== rows[i] ) {
                // Don't add to data.rowNames
                $.noop();
            } else {
                data.rowNames.push( rowName );
            }

            var cells = $(rows[i]).find("td");
            for( var j=0, m=cells.length; j<m; j++ ) {
                var cellString = this.getCellString(cells[j]);
                var cellValue  = this.getCellValue(cells[j], cellString);
                var colName    = data.colNames[j];

                // TODO: Is doing [rowName][colName] then [colName][rowName] going to lead to subtle bugs with duplicate row/col names
                data.values[rowName] = data.values[rowName] || {};
                data.values[colName] = data.values[colName] || {};
                data.values[rowName][colName] = cellValue;
                data.values[colName][rowName] = cellValue;

                data.strings[rowName] = data.strings[rowName] || {};
                data.strings[colName] = data.strings[colName] || {};
                data.strings[rowName][colName] = cellString;
                data.strings[colName][rowName] = cellString;

                data.totals[rowName] = Number(data.totals[rowName] || 0) + cellValue; // Row/Team Totals
                data.totals[colName] = Number(data.totals[colName] || 0) + cellValue; // Column Totals

                data.stats.count++;
                data.stats.total += cellValue;
                data.stats.max = Math.max( cellValue, data.stats.max );
                data.stats.min = Math.min( cellValue, data.stats.min );
            }
        }
        data.stats.avg = data.stats.count === 0 ? 0 : data.stats.total / data.stats.count;

        for( var rowName in data.rows ) {
            var cells = $(data.rows[rowName].node).find("td").not(".ignore");
            for( var i=0, n=cells.length; i<n; i++ ) {
                var colName = data.colNames[i];

                data.cells[rowName] = data.cells[rowName] || {};
                data.cells[colName] = data.cells[colName] || {};
                data.cells[rowName][colName] = $.getAttributeHash( cells[i], { colName: colName, rowName: rowName, node: cells[i] } );
                data.cells[colName][rowName] = $.getAttributeHash( cells[i], { colName: colName, rowName: rowName, node: cells[i] } );
            }
        }

        // Check for row/column namespace collisions
        for( var i=0, n=data.rowNames.length; i<n; i++ ) {
            var rowName = data.rowNames[i];
            for( var j=0, m=data.colNames.length; j<m; j++ ) {
                var colName = data.colNames[j];
                if( rowName === colName ) {
                    console.error(this.klass+":parseHtmlTable(): row/column namespace collision - rowName: ", rowName, " colName: ", colName, " this.element: ", this.element, ", this: ", this );
                }
            }
        }
        
        // Final Validation
        if( data.stats.max === Number.MIN_VALUE ) { 
            data.stats.max = 0; 
            //console.error(this.klass+":parseHtmlTable() - invalid data set, data.stats.max === Number.MIN_VALUE", this); 
        }
        if( data.stats.min === Number.MAX_VALUE ) { 
            data.stats.min = 0; 
            //console.error(this.klass+":parseHtmlTable() - invalid data set, data.stats.min === Number.MAX_VALUE", this); 
        }
        
        return data;
    },
    getColName: function( colNode ) {
        colNode = $(colNode);
        var colName = $.trim( colNode.attr("name") || colNode.text() || colNode.getUuid() );
        return colName;
    },
    getRowName: function( rowNode ) {
        rowNode = $(rowNode);
        var rowName = $.trim( rowNode.attr("name") || rowNode.find("th").text() || rowNode.getUuid() );
        return rowName;
    },
    getCellString: function( cellNode ) {
        var cellString = $.trim( $(cellNode).text() ) || "";
        return cellString;
    },
    getCellValue: function( cellNode, cellString ) {
        cellString = cellString || this.getCellString(cellNode) || ""; // Optimization, avoid second DOM query
        var cellValue = Number( cellString.replace(/[^\d\.+-]/g, '') );
        return cellValue;
    },


    /**
     *  Finds the relevant table node for the widget
     *  First searches this.element, then up the tree, then down the tree
     *  @return {jQuery}
     */
    getTableNode: function() {
        if( !this.table ) {
            this.table = this.element;
        }
        if( this.table.attr("nodeName") !== "table" ) {
            this.table = this.element.find("table").first();
        }
        if( this.table.attr("nodeName") !== "table" ) {
            this.table = this.element.closest("table").first();
        }
        return this.table;
    },
    /**
     * @return {Number}
     */
    getFontSize: function() {
        if(! this.options.fontSize ) {
            this.options.fontSize = this.options.fontSize || Number( $(this.element).css("font-size").replace(/[^\d\.]+/g,'') );
        }
        return this.options.fontSize;
    },



    //*** Event Manager Interface ***//

    registerEventManager: function() {
        // Override in subclasses
        $.noop();
    },
    unregisterEventManager: function() {
        EventManager.unregister(this);
    }

});
$.ui.basewidget.emptyjQuery = $([]);
