/**
 *  LazyLoader - allows for javascript files to be loaded dynamically - has no external dependancies
 *
 *  TODO: BUG: Chrome doesn't gaurentee script execution order = error: $.jQuery not defined
 *  @see http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
 *
 *  -- Main external functions
 *  LazyLoader.load(url, callback)          
 *  LazyLoader.loadScriptList(url,callback)
 *
 *  -- Useful Helper functions
 *  LazyLoader.Ajax(url, callback)
 *  LazyLoader.Browser = { IE:, Opera:, WebKit:, Gecko:, MobileSafari: }
 *  LazyLoader.getQueryParams()
 *
 *  -- Script may be accessed via query params
 *  LazyLoader.js?loadScriptList=..|..|path|to|list.txt     - loads a script list (can be plural)
 *  LazyLoader.js?load=..|file1.js,..|file2.js,..|file3.js  - loads individual scripts, use | for /
 *  LazyLoader.js?callback=Global.Function                  - function(params) callback when all scripts have been successfully loaded
 *
 *  Inspired by: http://ajaxian.com/archives/a-technique-for-lazy-script-loading
 *  @author James McGuigan
 */
if( typeof LazyLoader === "undefined" ) { 
    LazyLoader = {};
    LazyLoader.timer   = {};  // contains timers for scripts
    LazyLoader.scripts = {};  // contains called script references

    /**
     *  Simple $.ajax() re-implementation that doesn't depend on jQuery or any other external libary
     *  @param {String}   options.url        the url to query
     *  @param {String}   options.async      if true, make an asyncronous call - default: false
     *  @param {Function} options.beforeSend [optional] function( options )
     *  @param {Function} options.success    [optional] function( response, statusText, xhr )
     *  @param {Function} options.error      [optional] function( xhr, statusText, error, options )
     *  @param {Function} options.complete   [optional] function( xhr, statusText, options )
     */
    LazyLoader.Ajax = function( options ) {
        options          = options || {};
        options.url      = options.url      || "";
        options.async    = options.async    || false;
        options.error    = options.error    || function( xhr, status, error, options ) { 
            console.warn( 'LazyLoader.Ajax: XHR request error: ', xhr, status, error, options );
        };

        var xhr = null;
        if      ( window.XMLHttpRequest ) { xhr = new XMLHttpRequest();                } // Gecko
        else if ( window.ActiveXObject  ) { xhr = new ActiveXObject("MsXml2.XmlHttp"); } // IE

        xhr.callback = xhr.onreadystatechange = function() {
            if( xhr.readyState == 4 ) {
                if( xhr.status == 200 || xhr.status == 304 ) {
                    if( options.success instanceof Function ) { try { 
                        options.success( xhr.responseText, xhr.statusText, xhr, options  );
                    } catch(e) { 
                        console.error("LazyLoader.Ajax:options.success(", xhr.responseText, xhr.statusText, xhr, options); console.dir(e);
                    }}
                } else {
                    if( options.error instanceof Function ) { try {
                        options.error( xhr, xhr.statusText, "error", options  );
                    } catch(e) { 
                        console.error("LazyLoader.Ajax:options.error(", xhr, xhr.statusText, options, ")"); console.dir(e);
                    }}
                }
                if( options.complete instanceof Function ) { try {
                    options.complete( xhr, xhr.statusText  );
                } catch(e) { 
                    console.error("LazyLoader.Ajax:options.complete(", xhr, xhr.statusText, options, ")"); console.dir(e);
                }}
            }
        };

        if( options.beforeSend instanceof Function ) { try { 
            options.beforeSend( options );
        } catch(e) { 
            console.error("LazyLoader.Ajax:options.beforeSend(", options, ") "); console.dir(e);
        }}


        // Now finally make the AJAX request
        try {
            xhr.open('GET', options.url, options.async );
            xhr.send(null);
            if( !options.async ) {
                xhr.callback();
            }
        } catch(e) { 
            console.error("LazyLoader.Ajax:xhr.open()", options.url, options); console.dir(e);
        }
    };

    /**
     *  Browser detection algorithm, as LazyLoader.isScriptTagDefined is highly browser dependant
     *  Stolen from prototype.js as presumably they have throughly tested that it actually works!
     *  http://prototypejs.org/assets/2009/8/31/prototype.js
     *
     *  @return {Hash<Boolean>} 
     */
    LazyLoader.Browser = (function(){
        var ua = navigator.userAgent;
        var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
        return {
            IE:             !!window.attachEvent && !isOpera,
            Opera:          isOpera,
            WebKit:         ua.indexOf('AppleWebKit/') > -1,
            Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
            MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
        };
    })();


    /**
     *  Tests if a script tag has already been defined on the page (doesn't test if the script itself has successfully loaded)
     *  Works for both full http:// urls, and relative ../../path/to/file.js urls (it just strips ../../ and tests url tail)
     *  Caches successful matches in LazyLoader.scripts[url]
     *
     *  @param  {String}  url   script url to test, either full http:// url or relative ../../path/to/file.js
     *  @return {Boolean}       true if script is defined, false otherwise
     */
    LazyLoader.isScriptTagDefined = function(url) {
        if( LazyLoader.scripts[url] ) {
            return true;
        }
        var regexp = url;
        regexp = url.replace(/(\.\.\/)+/, "");    // strip ../../ prefix
        regexp = regexp.replace(/[.]/g, "\\$&"); // regexp encode
        regexp = regexp + "$";
        var scripts = document.getElementsByTagName("script");
        for( var i=0, n=scripts.length; i<n; i++ ) {
            if( scripts[i].src.match(regexp) ) {
                LazyLoader.scripts[url] = true;           // Note the version passed in
                LazyLoader.scripts[url] = scripts[i].src; // Note the full http version from the script
                return true;
            }
        }
        return false;
    };

    /**
     *  Loads a javascript file via url, only if not already loaded. Callback called on successful downloaded or existing file.
     *  TODO: Add handler for unsuccessful download
     *  @param {String}   url        url of javascript file, either full http:// or ../../path/to/file.js
     *  @param {Function} callback   function(url) 
     */
    LazyLoader.load = function(url, callback) {
        // handle object or path
        var classname = null;
        var properties = null;
        try {
            // make sure we only load once
            if( !LazyLoader.isScriptTagDefined(url) ) {

                // Force syncronous browser caching to ensure all files are in order, bug in Opera and IE
                //LazyLoader.Ajax({
                //    url:   url,
                //    async: false
                //});

                var head   = document.getElementsByTagName('HEAD').item(0);
                var script = document.createElement("script");
                script.src = url;
                script.type = "text/javascript";
                head.appendChild(script);

                // was a callback requested
                if( callback instanceof Function ) {
                    // 1. test for onreadystatechange to trigger callback
                    script.onreadystatechange = function () {
                        if( script.readyState == 'loaded' || script.readyState == 'complete' ) {
                            callback(url);
                        }
                    };
                    // 2. test for onload to trigger callback
                    script.onload = function () {
                        callback(url);
                        return;
                    };
                    // 3. safari doesn't support either onload or readystate, create a timer only way to do this in safari
                    if( (LazyLoader.Browser.WebKit && !navigator.userAgent.match(/Version\/3/)) || LazyLoader.Browser.Opera ) { // sniff
                        LazyLoader.timer[url] = setInterval(function() {
                            if (/loaded|complete/.test(document.readyState)) {
                                clearInterval(LazyLoader.timer[url]);
                                callback(url); // call the callback handler
                            }
                        }, 10);
                    }
                }
            } else {
                if( callback instanceof Function ) {
                    callback(url);
                }
            }
        } catch (e) {
            console.error("LazyLoader: ", e );
        }
    };

    /**
     *  Ajaxs a text file of javascript files to be loaded
     *  Format: one file per line, loaded in order, # for comments, blank lines are ignored, hardcoded prefix is appended
     *  @param {String} scriptListUrl  url of script list
     *  @param {String} callback       function( {Array<String>} urls ) - callback after all downloaded, returns url array
     */ 
    LazyLoader.loadScriptList = function( scriptListUrl, callback ) {
        if( !scriptListUrl ) { return; }
        
        LazyLoader.Ajax({
            url: scriptListUrl,
            async: false,
            success: function( text ) {
                var prefix = scriptListUrl.replace(/[^\/]*$/, "");

                text = text.replace(/#[^\n\r]*/g, "" );  // Strip comments
                text = text.replace(/^\s*|\s*$/g, "" );  // Trim front and back
                text = text.replace(/^\s*$/mg, "" );     // Strip empty lines
                text = text.replace(/^(\w+)/mg, prefix+"$1" ); // Repoint urls

                var urls = text.split(/[\n\r]+/);
                var urlsRemaining = urls.length;
                for( var i=0, n=urls.length; i<n; i++ ) {
                    LazyLoader.load( urls[i], function() {
                        if( (--urlsRemaining) === 0 ) {
                            if( callback instanceof Function ) {
                                callback(urls);
                            }
                        }
                    });
                }
            }
        });
    };
    
    /**
     *  Ajaxs an Apache index file of javascript files to be loaded
     *  @param {String} scriptListUrl  url of script list
     *  @param {String} callback       function( {Array<String>} urls ) - callback after all downloaded, returns url array
     */ 
    LazyLoader.loadApacheIndex = function( scriptListUrl, callback ) {
        if( !scriptListUrl ) { return; }
        
        LazyLoader.Ajax({
            url: scriptListUrl,
            async: false,
            success: function( html ) {
                var regexp = /<a[^>]*href=["']([^"']*\.js)["'][^>]*>/ig;
                var urls = html.match( regexp );
                for( var i=0, n=urls.length; i<n; i++ ) {
                    urls[i] = urls[i].replace( regexp, "$1" );
                }

                var urlsRemaining = urls.length;
                for( var i=0, n=urls.length; i<n; i++ ) {
                    LazyLoader.load( urls[i], function() {
                        if( (--urlsRemaining) === 0 ) {
                            if( callback instanceof Function ) {
                                callback(urls);
                            }
                        }
                    });
                }
            }
        });
    };

    /**
     *  Extracts a hash of queryString params passed to this script
     */
    LazyLoader.getQueryParams = function() {
        // Extract the queryString from the script url
        var scripts = document.getElementsByTagName('script');
        var script = scripts[scripts.length-1];
        var queryString = script.src.replace(/^[^\?]*\??/, '').replace(/\|/g, '/').split("&"); // use | for / in urls
        var params = {};
        for( var i=0, n=queryString.length; i<n; i++ ) {
            var split = queryString[i].split("=");
            params[ split[0] ] = split[1];
        }
        return params;
    };

    /**
     *  Takes an array or string list and returns a hash
     *  @param {String|Array}  list
     *  @param {Hash<Boolean>}
     *  @unused
     */
    LazyLoader.arrayToHash = function( list, split ) {
        var hash = {};
        if( typeof list === "string" ) {
            list = list.split(split);
        }
        if( list instanceof Array ) {
            for( var i=0, n=arr.length; i<n; i++ ) {
                hash[arr[i]] = true;
            }
        }
        return hash;
    };

    /**
     *  Actions any queryString params passed to the script. 
     *
     *  LazyLoader.js?loadScriptList=..|..|path|to|list.txt     - loads a script list (can be plural)
     *  LazyLoader.js?load=..|file1.js,..|file2.js,..|file3.js  - loads individual scripts, use | for /
     *  LazyLoader.js?callback=Global.Function                  - function(params) callback when all scripts have been successfully loaded
     *
     *  @param {Hash} params   [optional] queryString parameter list, defaults to LazyLoader.getQueryParams()
     *  @param {Hash} skip     [internal] urls to skip, allows for recursion
     */
    LazyLoader.onScriptLoad = function( params, skip ) {
        params = params || LazyLoader.getQueryParams();
        skip   = skip   || {};

        for( var paramName in params ) {
            if( paramName === "loadScriptList" || paramName === "load" || paramName == "loadApacheIndex" ) {
                var urls = params[paramName].split(",");
                for( var i=0, n=urls.length, url=urls[0]; i<n; i++, url=urls[i] ) {
                    if( skip[url] ) { continue; }
                    LazyLoader[paramName]( url ); // Not asyncronous
                }
            }
        }
        if( params["callback"] ) {
            var split = params["callback"].split(".");
            var namespace = window;

            for( var i=0, n=split.length, next=split[i]; i<n; i++, next=split[i] ) {
                if( namespace[next] ) {
                    namespace = namespace[next];
                } else {
                    break;
                }
            }
            if( namespace instanceof Function ) {
                namespace( params ); 
            } else {
                console.error( "LazyLoader.onScriptLoad: ?callback=", params["callback"], "is invalid global function name"   );               
            }
        }
    };
}
LazyLoader.onScriptLoad();
