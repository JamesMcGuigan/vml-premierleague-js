//just a factory for elements
$.el = function(type){
    return $(document.createElement(type));
};
/**
 * Dormant : visible messaging
 */
$.toast = function(msg){
	
	var expiry = function($el) {
		setTimeout(function(){
			$el.slideUp('slow',function(){
				$el.remove();
			});
		},5000);
	};
	
	var container = $.el('div').addClass('toast').text(msg);
	$('body').append(container);
	expiry(container);
	return true;
};

$.getCqEditMode = function() {
    $.cqEditMode = $(document.body).hasClass("cq-wcm-edit") 
                || $(document.body).hasClass("cq-wcm-design");	
    return $.cqEditMode;
};

/**
 *  @return www.premierleague.com
 */
$.getDomain = function() {
    if(! $.getDomain.domain ) {
        $.getDomain.domain = (String(document.location).match(/\w+:\/\/([^\/:]+)/) || ["","www.premierleague.com"])[1];
    }
    return $.getDomain.domain;
};
$.getDomain.domain = "";

/**
 *  Returns the top level domain for the website, assumes domian is 4+ letters long
 *  Assumes country code is at max 2 groups 3 letters, ie .com, .co.uk
 *  Assumes country code can compise upto two 3 letter TLDs, ie .com or .goc
 *  @return premierleague.com
 */
$.getTopLevelDomain = function() {
    if(! $.getTopLevelDomain.domain ) {
        var subdomain = $.getDomain();

        if( subdomain.match(/\.\w{2,3}\.\w{2,3}$/) ) { // check for .co.uk
            var domain = subdomain.split('.').slice(-3).join('.') || "premierleague.com"; 
        } else {
            var domain = subdomain.split('.').slice(-2).join('.') || "premierleague.com";
        }
        $.getTopLevelDomain.domain = domain;
    }
    return $.getTopLevelDomain.domain;
};
$.getTopLevelDomain.domain = "";

//***** Ajax Plugins *****//

//-- Not in use at the moment --//
///**
// *  This code sets $._ajaxOverideOptions inside a try block, then resets it again afterwards
// *  This code works a bit like a lisp let block, for setting the force options via the ajaxPrefilter
// *  Doing it this way, as its too dangerous to trust inline code to reset _ajaxOverideOptions
// *
// *  @param {Hash}     forceOptions  options to force override the options passed to any inline $.ajax() calls
// *  @param {Function} callback      code to call with these override options
// *  @param {Widget}   context       context to call the callback in
// */ 
//$.ajaxOptionsOverride = function( forceOptions, callback, context ) {
//    try {
//        $._ajaxOverideOptions = $.extend( $._ajaxOverideOptions, forceOptions );
//        callback.apply(context);
//    } finally {
//        $._ajaxOverideOptions = {};
//    }
//};
//$._ajaxOverideOptions = {};
//$.ajaxPrefilter(function( options, originalOptions, xhr ) {
//    if( typeof $._ajaxOverideOptions == "object" ) {
//        if( typeof options.original === "undefined" ) {
//            options.original = {};
//        }
//        for( var key in $._ajaxOverideOptions ) {
//            options.original[key] = originalOptions[key];
//            options[key] = $._ajaxOverideOptions[key];
//        }
//    }
//});



//*** Plugin Functions ***//


/**
 *  Gets a dot notation key out of a json hash
 *  @param {String|Array} key           key to find
 *  @param {Hash}         json          json to extract out of
 *  @param {String}       nomatch=null  what to return if nothing found
 */
$.getKey = function( key, json, nomatch ) {
    if( typeof nomatch === "undefined" ) { nomatch = null; } // typeof nomatch === "undefined" is actually faster that nomatch === undefined
    if( key && json ) {
        var keys  = key instanceof Array ? key : String(key).split(".");
        var first = keys.shift();
        var rest  = keys;

        if( first in json ) {
            if( rest.length === 0 ) {
                if( json[first] === null ) {
                    return nomatch;
                } else {
                    return json[first];
                }
            } else {
                return $.getKey( rest, json[first], nomatch );
            } 
        } else {
            return nomatch;
        }
    } else {
        return nomatch;
    }
};

/**
 *  Returns the subtree within a json structure that has the given findKey
 *  Performs a breath-first search of the json tree
 *  @param findKey {String}  child key to search for
 *  @param json    {Object}  data structure to search
 *  @Returns       {Object}  value of key, undefined if not found
 */
$.breadthFirstKeySearch = function( findKey, json ) {
    var queue = [json];
    var data;
    while( data = queue.pop() ) {
        if( data && ( typeof data === "object" || typeof data === "function" ) && !data.jquery ) {
            if( findKey in data ) {
                return data[findKey];
            } else {
                for( var key in data ) {
                    if( !json[key] ) { continue; }
                    if( typeof data[key] === "object" && !data[key].jquery ) {
                        queue.push( data[key] );
                    }
                }
            }
        }
    }
    return undefined;
};

/**
 *  Returns the subtree within a json structure that has the given findKey
 *  Performs a depth-first search of the json tree
 *  @param findKey {String}  child key to search for
 *  @param json    {Object}  data structure to search
 *  @Returns       {Object}  value of key, undefined if not found
 */
$.depthFirstKeySearch = function( findKey, json ) {
    if( json && ( typeof json === "object" || typeof json === "function" ) && !json.jquery ) {
        if( findKey in json ) {
            return json[findKey];
        } else {
            for( var key in json ) {
                if( !json[key] ) { continue; }
                var data = $.depthFirstKeySearch( findKey, json[key] );
                if( data !== undefined ) {
                    return data;
                }
            }
        }
    }
    return undefined;
};

/**
 *  Find all the keys that match findKey
 *  @param findKey {String}  child key to search for
 *  @param json    {Object}  data structure to search
 *  @Returns       {Object}  { path: object }
 */
$.exaustiveKeySearch = function( parentPath, findKey, maxDepth, useParent ) {
    findKey    = findKey    || "";
    maxDepth   = maxDepth   || 0;
    parentPath = parentPath || "";
    useParent  = useParent  || false;
    
    var data = $.getKey(parentPath, window);
   
    var queue = [{parentPath: parentPath||"", data: data, depth: 0 }];
    var queueItem;
    var found = {};
    while( queueItem = queue.pop() ) {
        if( queueItem.data && (typeof queueItem.data === "object" || typeof queueItem.data === "function" ) && !queueItem.data.jquery ) {
            if( typeof findKey === "string" && findKey in queueItem.data
             || findKey instanceof Function && findKey(queueItem.data) 
            ) {
                if( useParent ) {
                    found[queueItem.parentPath] = queueItem.data;
                } else {
                    var path = (queueItem.parentPath === "") ? findKey : queueItem.parentPath + "." + findKey;
                    found[path] = queueItem.data[findKey];
                }
            } 
            if( maxDepth && queueItem.depth >= maxDepth ) { 
                continue; 
            }
            for( var key in queueItem.data ) {
                if(! queueItem.data[key]   ) { continue; } // skip empty objects 
                if( key === findKey        ) { continue; } // skip nested keys
                if( key === "superclass"   ) { continue; } // skip superclass
                if( key === "parentWidget" ) { continue; } // skip superclass
                var path = (queueItem.parentPath === "") ? key : queueItem.parentPath + "." + key;

                queue.push({ parentPath: path, data: queueItem.data[key], depth: queueItem.depth+1 });
            }
        }
    }
    return found;
};

// http://stackoverflow.com/questions/1489624/modifying-document-location-hash-without-page-scrolling
$.setDocumentHash = function(hash) {
    hash = hash.replace( /^#/, '' );
    var fx, node = $( '#' + hash );
    if( node.length ) {
        fx = $('<div></div>');
        fx.css({
            position:   'absolute',
            visibility: 'hidden',
            top:        $(window).scrollTop() + 'px'
        });
        fx.attr( 'id', hash );
        fx.appendTo( document.body );
        node.attr( 'id', '' );
    }

    document.location.hash = hash;

    if( node.length ) {
        fx.remove();
        node.attr( 'id', hash );
    }
};

/**
 *  Creates a hash of expando properties for a node and converts numeric answers to real numbers
 *  <div widget="svgWrapper" svgheight="220" color="#fff"> = { widget: "svgWrapper" svgheight: 220, color: "#fff" }
 *  @param  {Hash} defaultHash  [optional] default params to add
 *  @return {Hash}
 */
$.fn.getAttributeHash = function( defaultHash ) {
    return $.getAttributeHash( this.get(0), defaultHash );
};

/**
 *  Opposite of $.fn.getAttributeHash
 *  { widget: "svgWrapper" svgheight: 220, data: {hello: "world"} } = "widget='svgWrapper' svgheight='220' data='{"hello":"world"}'"
 *  @param  {Hash}        options         options to tag encode
 *  @param  {Hash|Array}  options.ignore  keys to ignore
 *  @return {String}
 */
$.getOptionsHTML = function( options ) {
    var optionsHTML = "";
    if( typeof options.ignore == "undefined" ) { options.ignore = {}; }
    if( options.ignore instanceof Array      ) { options.ignore = $.arrayToHash(options.ignore,true); }
    options.ignore.ignore = true;

    if( options ) {
        for( var key in options ) {
            if( key in options.ignore ) { continue; }
            var value = "";
            switch( typeof options ) {
                case "undefined": break;
                case "number":
                case "string": value = options[key];           break;
                case "object":
                default:       value = $.toJSON(options[key]); break;
            }
            if( key === "className" ) { key = "class"; }
            value = value.replace(/^"|"$/g,'');
            value = value.replace(/'/g,"\\'");
            if( value ) {
                optionsHTML += key+"='"+value+"' ";
            }
        }
    }
    return optionsHTML;
};


/**
 *  Finds child nodes matching selector, but also adds self if self also matches selector
 */
$.fn.findAndSelf = function( selector ) {
    return this.find( selector ).add( this.filter(selector) );
};

$.fn.uuid = function() {
    for( var i=0, n=this.length; i<n; i++ ) {
        if( !this[i].getAttribute("uuid") ) {
            this[i].setAttribute("uuid", "uuid"+(++$.fn.uuid.count) );
        }
    }
    return this;
};
$.fn.getUuid = function() {
    return this.uuid().attr("uuid");
};
$.fn.uuid.count = 0;


//*** Utility Functions ***//

$.fn.loadSync = function( url, callback ) {
    var async = $.ajaxSettings.async;
    $.ajaxSetup({ async: false });
    this.load( url, callback );
    $.ajaxSetup({ async: async });
    return this;
};


/**
 *  Loads an image and returns its size via callback
 *  @param {String}   url
 *  @param {Function} function(width,height) - only called if data is valid
 */                 
$.loadImageSize = function( url, callback ) {
    if( url && callback instanceof Function ) {
        $("<img/>")
        .attr( "src",  url )
        .one(  "load", function() {
            var img = this;
            if( false && img.width && img.height ) {
                callback( img.width, img.height );
            } else {
                setTimeout(function() {
                    if( img.width && img.height ) {
                        callback( img.width, img.height );
                    }
                }, 0);
            }
        });
    }
};


/**
 *  Creates a hash of expando properties for a node and converts numeric answers to real numbers
 *  Now preserves case of expando properties defined in defaultHash
 *  <div widget="svgWrapper" svgheight="220" color="#fff"> = { widget: "svgWrapper" svgheight: 220, color: "#fff" }
 *
 *
 *  @see http://dev.w3.org/html5/spec-LC/elements.html#embedding-custom-non-visible-data-with-the-data-attributes
 *
 *  @param  {Element|jQuery} node         node to parse
 *  @param  {Hash}           defaultHash  [optional] default params to add
 *  @return {Hash}
 */
$.getAttributeHash = function( node, defaultHash ) {
    if( node && node.jquery ) { node = node.get(0); }

    var hash = {};
    var toCamel = {};
    if( typeof defaultHash !== "undefined" ) {
        for( var key in defaultHash ) {
            toCamel[ key.toLowerCase() ] = key;
        }

        // Copy rather than pass by reference
        for( var key in defaultHash ) {
            hash[key] = defaultHash[key];
        }
    }
    for( var i=0, n=node.attributes.length; i<n; i++ ) {
        var attribute = node.attributes[i];
        var nodeName = attribute.nodeName.replace(/^data-/); // HTML5 Data Attributes
        nodeName = toCamel[nodeName] || nodeName; // Preserve case of entries in defaultHash
        hash[ nodeName ] = attribute.nodeValue;
    }
    // Convert all attributes to real Numbers, lets avoid string arithmetic "1"+"2" == "12"
    for( var key in hash ) {
        if( typeof hash[key] === "string" ) {
            if(      hash[key] === "true"  ) { hash[key] = true;  }
            else if( hash[key] === "false" ) { hash[key] = false; }
            else if( hash[key].match(/^[+-]?\d*\.?\d+$/) ) {
                hash[key] = Number(hash[key]);
            }
            else if( hash[key].match(/^\[.*\]$/) ) { // Array
                hash[key] = hash[key].replace(/^\[(.*)\]$/g, '$1').split(',');
                for( var i=0, n=hash[key].length; i<n; i++ ) {
                    if( hash[key][i].match(/^[+-]?\d*\.?\d+$/) ) {
                        hash[key][i] = Number(hash[key][i]);
                    }
                    else if( hash[key][i].match(/^(['"])(.*)\1$/) ) {
                        hash[key][i].replace(/^['"](.*)\1$/, "$2"); // Strip quotes from strings
                    }
                }
            }
            else if( hash[key].match(/^\{.*\}$/) ) { // JSON
                hash[key] = $.parseJSON( hash[key] );
            }
        }
    }
    return hash;
};


/**
 *  Initializes HTML widgets marked as [widget] or [data-widget]
 *  @param  {jQuery} rootNode   rootNode to search from, includes self
 *  @return {jQuery}            list of nodes marked as widget
 */
$.initWidgets = function( rootNode ) {
    // This is init code, any uncaught exceptions here will kill all the javascript on the page
    try {
        $.initMiniWidgets(rootNode);
    } catch( e ) {
        console.error("$.initMiniWidgets(",rootNode,"): exception" );
        console.dir(e);
    }
    
    var selector = "[widget]";
    var notSelector = ".template [widget]";
    var nodes = $(selector, rootNode).add( $(rootNode).filter(selector) ).not( notSelector );
    var emptyjQuery = $([]);

    for( var i=0, n=nodes.length; i<n; i++ ) {
        try {
            var widgetClasses = nodes[i].getAttribute("widget").split(/\s+/);
            for( var j=0, m=widgetClasses.length; j<m; j++ ) {
            	var widgetClass = widgetClasses[j]; 
	            if( widgetClass && (widgetClass in $.ui || widgetClass in emptyjQuery) ) {
	                $(nodes[i])[widgetClass]({});
	            } else {
	                console.error("$.initWidgets(): class not found: <node widget='",widgetClass,"'> = ", nodes[i] );
	            }
            }
        } catch( e ) {
            console.error("$.initWidgets(): exception during widget init: <node widget='",widgetClass,"'> = ", nodes[i] );
            console.dir(e);
        }
    }
    return nodes;
};

/**
 *  Strips out any references to jQuery.prevObject that could potentually cause memory leaks
 *  @param {jQuery|Array|Hash}  data   only scans one level deep for hashes and arrays
 */
$.fn.jQueryGC = function() {
    $.jQueryGC(this);
    return this;
};
$.jQueryGC = function( data )  {
    if( typeof data === undefined ) {
        return;
    }
    else if( data instanceof jQuery ) {
        data.prevObject = $.jQueryGC.emptyjQuery;
    }
    else if( data instanceof Array ) {
        for( var i=0, n=data.length; i<n; i++ ) {
            if( data[i] instanceof jQuery ) {
                data[i].prevObject = $.jQueryGC.emptyjQuery;
            }
        }
    }
    else if( typeof data === "object" ) {
        for( var key in data ) {
            if( data[key] instanceof jQuery ) {
                data[key].prevObject = $.jQueryGC.emptyjQuery;
            }
        }
    }
};
$.jQueryGC.emptyjQuery = $([]);


$.fn.emptyGC = function() {
	this.find("[widget]").each(function(){
		var widget = $(this).data("widget");
		if( widget && widget.destroy instanceof Function ) {
			widget.destroy(); 
		}
		$(this).data("widget",null);
	});
	this.jQueryGC();
	this.empty();
	return this;
};


/**
 *  Takes an array and creates a hash based on a key/property of each array item
 *  $.indexArrayByKey( [{id: 1}, {id: 2}, {id: 3}], "id" ) -> { 1: {id: 1}, 2: {id: 2}, 3: {id: 3} }
 *  @param  {Array} list
 *  @return {Hash}
 */
$.indexArrayByKey = function( list, key ) {
    var hash = {};
    try {
        var value;
        for( var i=0, n=list.length; i<n; i++ ) {
            value            = list[i];
            hash[value[key]] = value;
        }
    } catch(e) {
        console.log('EXCEPTION: $.indexArrayByKey = function(', list ,') ', e);
    }
    return hash;
};

/**
 *  @param  {Hash}  hash
 *  @return {Array} array of hash keys
 */
$.hashToKeyArray = function( hash ) {
    var list = [];
    for( var key in hash ) {
        list.push( key );
    }
    return list;
};

/**
 *  @param  {Hash}  hash
 *  @return {Array} array of hash values
 */
$.hashToValueArray = function( hash ) {
    var list = [];
    for( var key in hash ) {
        list.push( hash[key] );
    }
    return list;
};

/**
 *  Converts an array into a hash map, with array values as keys, and optional user-defined value
 *  @param  {Array}   list   array to process
 *  @param  {Boolean} value  [optional] hash value for keys defined, ie true, default is array value
 *  @return
 */
$.arrayToHash = function( list, value ) {
    var hash = {};
    for( var i=0, n=list.length; i<n; i++ ) {
        value = ( typeof value === "undefined" ) ? list[i] : value;
        hash[ list[i] ] = value;
    }
    return hash;
};

/**
 *  Converts an array into a hash map, by splitting each array entry into a key/value pair
 *  @param  {Array<String>}   list   array to process
 *  @param  {Regexp}          split  regexp to split each string via
 *  @return
 */
$.arrayToSplitHash = function( list, split ) {
    var hash = {};
    for( var i=0, n=list.length; i<n; i++ ) {
        var pair = (list[i] || "").split( split );
        hash[ pair[0] ] = pair[1];
    }
    return hash;
};

/**
 *  Recursively sorts a hash, returning a sorted copy
 *  @param {Object|Array} hash     object to sort
 *  @param {Function}     sortFunc [optional] function(a,b) { return -1, 0, 1 } 
 */
$.sortHash = function( hash, sortFunc ) {
    if(!( sortFunc instanceof Function )) {
        sortFunc = undefined; // ensure its valid or undefined, else Array.sort() will throw
    }

    if( hash instanceof Array ) {
        return hash.sort(sortFunc);

    } else if( typeof hash === "object" ) {
        var keys = [];
        for( var key in hash ) {
            keys.push(key);
        }
        keys = keys.sort(sortFunc);

        var newHash = {};
        for( var i=0, n=keys.length; i<n; i++ ) {
            var key = keys[i];
            var value = (typeof hash[key] === "object") ? $.sortHash(hash[key], sortFunc) : hash[key]; // typeof [] === "object"
            newHash[key] = value;
            return newHash;
        }

    } else {
        return hash;
    }
};

$.sortQueryString = function( queryString, sortFunc ) {
    if(!( sortFunc instanceof Function )) {
        sortFunc = undefined; // ensure its valid or undefined, else Array.sort() will throw
    }

    if( typeof queryString === "string" ) {
        var match, newQueryString = "";
        if( queryString.match(/^\?/) ) {
            newQueryString += "?";
            queryString = queryString.slice(1);
        }
        else if( match = queryString.match(/^(\w+:|\/).*?\?/) ) {
            newQueryString += match[0];
            queryString = queryString.replace(/^.*?\?/, "");
        }

        newQueryString += queryString.split("&").sort(sortFunc).join("&").replace(/^&+|&+$/g, "");
        return newQueryString;
    } else {
        return queryString;
    }
};

/**
 *  Returns a hash of headers related to the XHR object
 *  @param  {xhr}  xhr
 *  @return {Hash}
 */
$.getHeaders = function( xhr ) {
    if( xhr && xhr.getAllResponseHeaders instanceof Function ) {
        var lines = xhr.getAllResponseHeaders().split("\n");
        var headers = $.arrayToSplitHash( lines, /:\s+/ );
        return headers;
    } else {
        console.warn("$.getHeaders(",xhr,"): invalid xhr, from: ", arguments.callee.caller );
        return {};
    }
};

/**
 *  Small amount of indirection to handle YWA tracking
 * 
 */
$.ywaTrack = function() {
	// review args, split and fire
	// we need to first convert [arguments] into a proper array
	if (typeof window.YWATracker !== 'undefined') {
		
		var wYWAT = window.YWATracker;
		var argsArray = Array.prototype.slice.call(arguments);
		var e = argsArray.shift();
		var EvPg = argsArray.shift();
		
		//console.log("EvPg",EvPg,"argsArray",argsArray);
		
		if (EvPg === "action") {
			wYWAT.setAction.apply(wYWAT,argsArray);
		} else if (EvPg === "cf") {
			wYWAT.setCF.apply(wYWAT,argsArray);
		} else if (EvPg === "isk") {
			wYWAT.setISK.apply(wYWAT,argsArray);
		} else if (EvPg === "isr") {
			wYWAT.setISR.apply(wYWAT,argsArray);
		} else if (EvPg === "submit") {
			wYWAT.submit_action();
		}
	} else {
		console.warn("tracking event fired with no framework loaded");
		return false;
	}
};
