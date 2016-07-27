/**
 *  Quick guide to extending jQuery templates
 *
 *  In HTML: {{tag( options, mappings ) json }}
 *  _tmpltags_tag = function( json, options, mappings ) { return html; }
 *  $.extend(jQuery.tmpl.tag, { tag: { _default: { $1: "{}", $2: "{}" }, open: '__=__.concat(_tmpltags_tag($1,$2));' }}) // even if more than 2 args
 *
 *  Rules:
 *  - jQuery.tmpl reads your tag as a string, then parses it into a function call
 *  - We have jQuery.tmpl unit tests in /cq/jcr_root/etc/designs/premierleague/test/exlibs/jquery-tmpl/tests/core.js
 *  - _tmpltags_tag($1)    must be called as {{tag arg1 }}
 *  - _tmpltags_tag($1,$2) must be called as {{tag(arg2,arg3) arg1 }}
 *
 *  - arguments cannot contain inline function defintions
 *  - arguments cannot contain array defintions
 *  - arguments cannot contain nested hashes
 *  - the last arg1 must have spaces both sides if it is a hash {{tag("arg2") {arg1:"value"} }} - (a triple }}} will break the regexp)
 *  - nested hashes must have spaces after each closing tag, a double }} will be interpereted as a close for the tmpl tag
 *  - according to unit tests, the following will be validly parsed:
 *    {{joinHash( {a:{b:{c:[3,{d:4}]} } } ) {x:{y:{z:[9,{w:0}]} } } }}
 *
 *  jQuery templates should be defined within <script type="text/x-jquery-tmpl" class=""></script> tags.
 *  Sometimes you can get away with defining them as inline HTML, but they may be potentually buggy with json dot notation
 */
(function($) {

    var _formatKey = function( key, value ) {
        key = key.replace(/percentage/, '');
        key = key.replace(/plus/, '+');
        key = key.replace(/([A-Z]+)/g, " $1");
        key = key.replace(/([0-9+-]+)/g, " $1 ");
        key = key.replace(/\s\s+/g,    " ");
        key = key.replace(/^.*extra *time.*$/i, ""); // Hide Extra Time if data is zero, always the case for premier league matches
        key = key.replace(/(\d+) To (\d+)/i, "$1 to $2");
        key = key.trim();
        key = key.substring(0,1).toUpperCase() + key.substring(1).toLowerCase();
        return key;
    };

    var _formatValue = function( value, key ) {
        if( String(key).match(/^extraTime$/i) && value == 0 ) {
            value = ""; // Hide Extra Time if data is zero, always the case for premier league matches
        }
        if( String(key).match(/percentage/) ) {
            value = String(value) + " %";
        }
        return value;
    };

    var _parseMappings = function( json, mappings ) {
        mappings = $.extend({
            allFields: false,  // {Boolean} render all fields in json, not just those specified
            ignore:    {},     // {Array} fields to ignore
            fields:    {}      // {Hash} <key>: <Title|""> // Autogenerate <title> if ""
        }, mappings );

        mappings.ignore = (mappings.ignore instanceof Array) ? $.arrayToHash(mappings.ignore,true) : mappings.ignore;
        mappings.fields = (mappings.fields instanceof Array) ? $.arrayToHash(mappings.fields,"")   : mappings.fields;

        var noFieldsDefined = true;
        for( var key in mappings.fields ) { noFieldsDefined = false; break; }
        if( noFieldsDefined ) {
            mappings.allFields = true;
        }

        mappings.fieldCount = 0;
        for( var key in json ) {
            if( (mappings.allFields || key in mappings.fields) && typeof $.getKey(key,json) !== "object" ) {
                mappings.fieldCount++;
            }
        }

        return mappings;
    };

    /**
     *  @param json
     *  @param mappings
     *  @param callback  function( key, value, label, json, index ) 
     */
    var _rowHTML = function( json, mappings, callback ) {
        var html = "";
        var index = 0;
        for( var key in mappings.fields ) {
            if( key in mappings.ignore                 ) { continue; } // ignore
            if( typeof $.getKey(key,json) === "object" ) { continue; } // invalid
            
            var value = _formatValue(json[key], key);
            var label = mappings.fields[key] || _formatKey(key,value);
            html += callback(key, value, label, json, index++);
        }
        for( var key in json ) {
            if( !mappings.allFields                    ) { break; }    // skip
            if( key in mappings.fields                 ) { continue; } // already rendered
            if( key in mappings.ignore                 ) { continue; } // ignore
            if( typeof $.getKey(key,json) === "object" ) { continue; } // invalid
            
            var value = _formatValue(json[key], key);
            var label = _formatKey(key,value);

            if( value !== "" && label !== "" ) {
                html += callback(key, value, label, json, index++);
            }
        }
        return html;
    };


    /**
     *  {{widget("svgGoalsByPitchPosition", { data: goalsForDetails.goalsByPitchPosition})}}
     *  @param {String} templateSelector [unused]
     *  @param {String} widgetName
     *  @param {Hash}   options
     */
    _tmpltags_widget = function( templateSelector, widgetName, options ) {
        var html = "<div widget='"+widgetName+"' "+$.getOptionsHTML(options)+"></div>";
        return html;
    };

    /**
     *  {{matchinfo({}, { fields: { shotsPerMatch  }  }) goalsForDetails.goalsPercentagesByMatchTime }}
     *  @param {Hash}     json                 subsection of the json to render
     *  @param {Hash}     options              HTML options to be passed into the widget
     *  @param {Hash}     mappings             mappings for how the tmpl is rendered
     */
    _tmpltags_matchinfo = function( json, options, mappings ) {
        json = json || [];

        options = $.extend({
            className: ""
        }, options);

        mappings = $.extend({
            maxPerRow: 6       // {Number}  number of entries before starting a new line
        }, mappings);

        mappings = _parseMappings( json, mappings );
        
        var rows    = Math.ceil(mappings.fieldCount/mappings.maxPerRow);
        var rowSize = Math.ceil(mappings.fieldCount/rows);
        options.className += " size"+rowSize;

        var html = "";
        html += '<div '+$.getOptionsHTML(options)+'>';
        html += '<ul>';

        html += _rowHTML( json, mappings, function(key,value,label,json,index) {
            var html = "";
            label = label.replace(/ per /i, ' / ');
            label = label.replace(/^(saves|blocks) /i, "$1 made ");
            label = label.replace(/^(goals) scored /i, "$1 ");

            if( index !== 0 && index % (mappings.maxPerRow) === 0 ) {
                html += '</ul>';
                html += '</div>';
                html += '<div '+$.getOptionsHTML(options)+'>';
                html += '<ul>';
            }
            html += '<li>';
            html += '<p class="label">'+label+'</p>';
            html += '<span class="data">'+value+'</span>';
            html += '</li>';
            
            return html;
        });

        html += '</ul>';
        html += '</div>';

        return html;
    };

    /**
     *  {{keyvaluetable({ widget: "svgGoalTimes", className: "data-tables", svgwidth: 340, svgheight: 194 }, { keyTitle: "Goals Scored", valueTitle: "Time Scored", ignore: ['total'] }) goalsForDetails.goalsPercentagesByMatchTime }}
     *  @param {Hash}   json      subsection of the json to render
     *  @param {Hash}   options   HTML options to be passed into the widget
     *  @param {Hash}   mappings  mappings for how the tmpl is rendered
     */
    _tmpltags_keyvaluetable = function( json, options, mappings ) {
        json = json || [];

        options = $.extend({
            className: "",
            ignore: []         // {Array} of keys
        }, options);

        mappings = $.extend({
            keyTitle:   "",
            valueTitle: ""
        }, mappings );

        mappings = _parseMappings( json, mappings );

        var html = "";
        html += "<table "+$.getOptionsHTML(options)+">\n";

        if( mappings.keyTitle || mappings.valueTitle ) {
            html += "<thead>\n";
            html += "  <tr>\n";
            html += "    <th>" + mappings.keyTitle   + "</th>\n";
            html += "    <th>" + mappings.valueTitle + "</th>\n";
            html += "  </tr>\n";
            html += "</thead>\n";
        }

        html += "<tbody>\n";
        html += _rowHTML( json, mappings, function(key,value,label,json,index) {
            var html = "";
            html += "  <tr>\n";
            html += "    <th>" + label + "</th>\n";
            html += "    <td>" + value + "</td>\n";
            html += "  </tr>\n";
            return html;
        });
        html += "</tbody>\n";
        html += "</table>\n";
        return html;
    };
    /**
     *  {{keyvaluelist({ }, { title: "Goals Scored", ['total'] }) goalsForDetails.goalsPercentagesByMatchTime }}
     *  @param {Hash}   json      subsection of the json to render
     *  @param {Hash}   options   HTML options to be passed into the widget
     *  @param {Hash}   mappings  mappings for how the tmpl is rendered
     */
    _tmpltags_keyvaluelist = function( json, options, mappings ) {
        json = json || [];

        options = $.extend({
        }, options);

        mappings = $.extend({
            title:  ""
        }, mappings );

        mappings = _parseMappings( json, mappings );

        var html = "";
        html += "<ul "+$.getOptionsHTML(options)+">\n";

        if( mappings.title ) {
            html += "<li class='title'>" + mappings.title + "</li>\n";
        }

        html += _rowHTML( json, mappings, function(key,value,label,json,index) {
            var oddeven = (index % 2) ? "even" : "odd"; 

            var html = "";
            html += "<li class='"+oddeven+"'>";
            html += "    <span class='key'>"   + label + "</span>\n";
            html += "    <span class='value'>" + value + "</span>\n";
            html += "</li>";
            return html;
        });

        html += "</ul>\n";
        return html;
    };
    /**
     *  @example
     *  {{table({fields: { "opponent.name": "Opponent", "total": "Scored", "avgPerMatch": "Average / Match"  }, columns: 2, className: "data-tables" }) goalsForDetails.opponentsScored}}
     *
     *  @param {Array}  options.json      - json recieved from the server
     *  @param {Hash}   options.fields    - { <json_key>: { title:, fields:, columns:, className: }
     *  @param {Number} options.columns   - Number of cols to display
     *  @param {Number} options.className - CSS class name for the table element
     */
    _tmpltags_table = function( json, options, mappings ) {
        mappings = $.extend({
            fields:   {},
            columns:  1,
            className: ""
        }, mappings);

        for( var key in mappings.fields ) {
            mappings.fields[key] = $.extend({
                title:     "",
                prefix:    "",
                postfix:   "",
                className: ""
            }, mappings.fields[key]);
        }

        var cols = [];
        var rowsPerCol = Math.ceil( json.length / mappings.columns );
        for( var c = 0; c < mappings.columns; c++ ) {
            cols[c] = [];
            for( var i=c*rowsPerCol, n=i+rowsPerCol; i<n; i++ ) {
                cols[c].push( json[i] );
            }
        }

        // TODO: Make One Table
        var html = "";
        html += "<table "+$.getOptionsHTML(options)+">\n";
        html += "<tr>\n";
        for( var c=0, cn=cols.length; c<cn; c++ ) {
            for( var key in mappings.fields ) {
                var field = mappings.fields[key];
                html += "<th class='"+field.className+"'>"+field.title+"</th>\n";
            }
        }
        html += "</tr>\n";
        for( var i=0, n=rowsPerCol; i<n; i++ ) {
            html += "<tr>\n";
            for( var c=0, cn=cols.length; c<cn; c++ ) {
                var row = cols[c][i];
                for( var key in mappings.fields ) {
                    var field = mappings.fields[key];
                    var value = $.getKey( key, row, "" );
                    if( value ) { value = (field.prefix||"") + value + (field.postfix||""); }
                    html += "<td class='"+field.className+"'>"+value+"</td>\n";
                }
            }
            html += "</tr>\n";
        }
        html += "</table>\n";
        return html;
    };
    // http://blog.sterkwebwerk.nl/2010/12/15/custom-jquery-template-tags-1/
    _tmpltags_textarea = function(value, name) {
        var html_name;
        var html_id;
        if(name) {
            html_name = 'name="'+ name +'"';
            html_id = 'id="id_'+ name +'"';
        }

        var html = '<textarea '+ html_name +' '+ html_id +'>'+ value +'</textarea>';
        return html;
    };


    $.extend(jQuery.tmpl.tag, {
        table: {
            _default: { $1: "null", $2: "null" },
            open: '__=__.concat(_tmpltags_table($1,$2));'
        },
        widget: {
            _default: { $1: "''", $2: "null" },
            open: '__=__.concat(_tmpltags_widget($1,$2));'
        },
        keyvaluetable: {
            _default: { $1: "null", $2: "null" },
            open: '__=__.concat(_tmpltags_keyvaluetable($1,$2));'
        },
        keyvaluelist: {
            _default: { $1: "null", $2: "null" },
            open: '__=__.concat(_tmpltags_keyvaluelist($1,$2));'
        },
        matchinfo: {
            _default: { $1: "null", $2: "null" },
            open: '__=__.concat(_tmpltags_matchinfo($1,$2));'
        },
        matchinfo: {
            _default: { $1: "null", $2: "null" },
            open: '__=__.concat(_tmpltags_matchinfo($1,$2));'
        },
        textarea: {
            _default: { $1: "''", $2: "null" },
            open: '__=__.concat(_tmpltags_textarea($1, $2));'
        }
    });
})(jQuery);
