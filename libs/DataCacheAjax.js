/**
 *  Manages cached lazy loading of urls
 *
 *  TODO: Code currently untested
 *
 *  Syntax compatable wrapper around $.ajax()
 *  Returns the value from the cache if data already valid/loading
 *  ifModified flag will do a conditional GET and return data from cache if 304 notmodified
 *
 *  DataCache.ajax({
 *     url:  "site-header.json",
 *     type: "GET",
 *     ifModified: false, // if true, perform a conditional GET and return data from cache if 304 notmodified
 *     beforeSend: function(xhr, ajaxOptions) {},
 *     success:    function(data, status, xhr) {}
 *     error:      function(xhr, status, error) {}
 *     complete:   function(xhr, status) {}
 *  });
 *  @author James McGuigan
 */
DataCacheEntry = function( options ) {
    this.loading = false;       // {Boolean} is url currently loading via $.ajax()
    this.valid   = false;       // {Boolean} is url currently in cache
    this.date    = new Date();  // {Date}    date of last successful request
    this.expires = new Date(0); // {Date}    expires header from last successful request
    this.data    = null;        // {Object}  return value of $.ajax(url);
    this.xhr     = null;        // {Object}  best xhr so far
    this.headers = {};          // {Hash}    headers from best xhr so far
    this.statusText = "";       // {String}  statusText as returned by jQuery
    this.httpError  = "";       // {String}  httpError  as returned by jQuery

    this.update( options );
};
DataCacheEntry.prototype.update = function( options ) {
    options = options || {};

    // Request was a success, or its the only data we've got
    if( data && xhr.status === 200 || this.valid === false ) {
        this.valid      = (options.data && options.xhr.status === 200) ? true : false;
        this.data       = options.data || null;
        this.xhr        = options.xhr  || null;
        this.headers    = $.getHeaders(options.xhr);
        this.date       = Date.parse(this.headers["Date"])    || new Date();  // or "now"
        this.expires    = Date.parse(this.headers["Expires"]) || new Date(0); // or "1970"
        this.statusText = options.statusText || "";
        this.httpError  = "";
    }
    // Not Modified, update xhr and headers, but not the data or valid flag
    else if( xhr.status === 304 ) {
        this.xhr        = options.xhr || null;
        this.headers    = $.getHeaders(options.xhr);
        this.date       = Date.parse(this.headers["Date"])    || new Date();  // or "now"
        this.expires    = Date.parse(this.headers["Expires"]) || new Date(0); // or "1970"
        this.statusText = options.statusText || "";
        this.httpError  = options.httpError  || "";
    }
    // I'm a teapot
    else if( xhr.status === 418 ) {
        alert("Server Says: \n\nI'm a little teapot, \nShort and stout, \nHere is my handle, \nHere is my spout, \nWhen I get all steamed up, \nHear me shout, \nTip me over and pour me out!");
        $.noop();
    }
    // We already have this data is cache, update gives us no new information
    else {
        console.error("DataCacheEntry.update(): xhr.status = ", xhr.status);
        $.noop();
    }
};

DataCacheAjax = Base.extend({},{
    klass: "DataCacheAjax",

    // Options
    logging:          false,   // {Boolean}  enable/disable logging

    // Internal
    cache:            {},      // {Hash<dataCacheKey>:DataCacheEntry}  cache to store our data in
    requestQueue:     {},      // {Hash<dataCacheKey>:ajaxOptions}     requests currently waiting for an ajax response
    requestListeners: {},      // {Hash<dataCacheKey>:Function}        listener functions to be updated successful cache update [not implemented]

    /**
     *  This is our drop-in wrapper replacement for $.ajax()
     *  it should follow the exact same spec as jQuery.ajax
     *
     *  Stores ajax response data in a local cache
     *  Ensures multiple requests to the same ajax url only generate a single $.ajax request
     *  Retuns cache data from previous $.ajax request if available
     *  Setting ajaxOptions.ifModified flag will force a conditional GET to update the cache
     *
     *  @see http://api.jquery.com/jQuery.ajax/
     *
     *  @param {String}   ajaxOptions.url
     *  @param {String}   ajaxOptions.type        "POST" or "GET"
     *  @param {Boolean}  ajaxOptions.ifModified  if true, force a conditional GET to update the cache
     *  @param {Object}   ajaxOptions.data
     *  @param {Function} ajaxOptions.beforeSend: function(xhr, ajaxOptions)
     *  @param {Function} ajaxOptions.success:    function(data, status, xhr)
     *  @param {Function} ajaxOptions.error:      function(xhr, status, error)
     *  @param {Function} ajaxOptions.complete:   function(xhr, status)
     */
    ajax: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":ajax(",ajaxOptions,"), this: ", this); }

        // GETs are also conditional on us actually having the data in cache
        if( ajaxOptions.ifModified && !this.getCache(ajaxOptions).valid ) {
            ajaxOptions.ifModified = false;
        }

        // If request is currently loading, then push it on the queue, deal with it on return
        if( this.getCache(ajaxOptions).loading ) {
            this.addRequestToQueue( ajaxOptions );

        } else {
            if( this.getCache(ajaxOptions).valid ) {
                if( ajaxOptions.ifModified ) {
                    this.addRequestToQueue( ajaxOptions );
                    this.fireAjaxRequest( ajaxOptions );
                } else {
                    this.processRequestFromCache( ajaxOptions );
                }
            } else {
                this.addRequestToQueue( ajaxOptions );
                this.fireAjaxRequest( ajaxOptions );
            }
        }
    },



    //***** Workflow *****//

    fireAjaxRequest: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":fireAjaxRequest(",ajaxOptions,"), this: ", this); }
        var myself = this;

        // beforeSend() may potentually modify url: and thus dataCacheKey
        var dataCacheAjaxOptions = {};
        dataCacheAjaxOptions = $.extend({}, ajaxOptions, {
            beforeSend: function(xhr, dataCacheAjaxOptions) {
                if( ajaxOptions.beforeSend instanceof Function ) {
                    var beforeSendFlag = ajaxOptions.beforeSend(xhr, dataCacheAjaxOptions);
                    if( beforeSendFlag === false ) {
                        return false;
                    }
                }
                myself.getCache(dataCacheAjaxOptions).loading = true;
            },
            success: function( data, statusText, xhr ) {
                myself.getCache(dataCacheAjaxOptions).update({
                    data:       data,
                    xhr:        xhr,
                    statusText: statusText
                });
            },
            error: function( xhr, statusText, httpError ) {
                myself.getCache(dataCacheAjaxOptions).update({
                    data:        data,
                    xhr:         xhr,
                    statusText:  statusText,
                    httpError:   httpError 
                });
            },
            complete: function( xhr, statusText ) {
                myself.processRequestQueue( dataCacheAjaxOptions );
                myself.getCache(dataCacheAjaxOptions).loading = false;
            }
        });
        $.ajax( dataCacheAjaxOptions );
    },

    addRequestToQueue: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":addRequestToQueue(",ajaxOptions,"), this: ", this); }

        var dataCacheKey = this.getDataCacheKey(ajaxOptions);
        if(!( this.requestQueue[dataCacheKey] instanceof Array )) {
            this.requestQueue[dataCacheKey] = [];
        }
        this.requestQueue[dataCacheKey].push( ajaxOptions );
    },

    processRequestQueue: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":processRequestQueue(",ajaxOptions,"), this: ", this); }

        var dataCacheKey = this.getDataCacheKey(ajaxOptions);
        if( this.requestQueue[dataCacheKey] instanceof Array ) {
            while( this.requestQueue[dataCacheKey].length ) {
                try {
                    var requestOptions = this.requestQueue[dataCacheKey].shift();
                    this.processRequestFromCache( requestOptions );
                } catch( e ) {
                    console.error("DataCache:processRequestFromCache(",requestOptions,"): exception: ", e);
                }
            }
        }
    },

    /**
     *  @param {Function} ajaxOptions.beforeSend: function(xhr, ajaxOptions)
     *  @param {Function} ajaxOptions.success:    function(data, status, xhr)
     *  @param {Function} ajaxOptions.error:      function(xhr, status, error)
     *  @param {Function} ajaxOptions.complete:   function(xhr, status)
     */
    processRequestFromCache: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":processRequestFromCache(",ajaxOptions,"), this: ", this); }

        var dataCacheKey = this.getDataCacheKey(ajaxOptions);

        // beforeSend() spec says it may modify ajaxOptions - fire a new request if dataCacheKey has changed
        // beforeSend() spec says return false will cancel the rest of the request
        // beforeSend() spec is processed in same thread as original code
        if( ajaxOptions.beforeSend instanceof Function ) {
            var beforeSendFlag = ajaxOptions.beforeSend(xhr, ajaxOptions);
            if( beforeSendFlag === false ) {
                return;
            }
            if( dataCacheKey !== this.getDataCacheKey(ajaxOptions, force) ) {
                ajaxOptions.beforeSend = null; // Only run this once
                this.ajax( ajaxOptions );      // Rerequest new ajaxCacheKey
                return;
            }
        }

        // If async flag is set (default), then process response in new thread, else same thread
        if( ajaxOptions.async ) {
            setTimeout($.proxy(this._processRequestFromCacheAsync, this, ajaxOptions), 0);
        } else {
            this._processRequestFromCacheAsync(ajaxOptions);
        }
    },
    _processRequestFromCacheAsync: function( ajaxOptions ) {
        if( this.logging ) { console.log(this.klass+":_processRequestFromCacheAsync(",ajaxOptions,"), this: ", this); }
        var cache = this.getCache(ajaxOptions);

        // Since jQuery 1.5 success(), error(), complete() may be arrays
        if( cache.valid === true ) {
            if( ajaxOptions.success instanceof Function ) {
                ajaxOptions.success( cache.data, cache.statusText, cache.xhr, cache.statusText );
            }
            else if( ajaxOptions.success instanceof Array ) {
                for( var i=0, n=ajaxOptions.success.length; i<n; i++ ) {
                    if( ajaxOptions.success[i] instanceof Function ) {
                        ajaxOptions.success[i]( cache.data, cache.statusText, cache.xhr, cache.statusText );
                    }
                }
            }
        } else {
            if( ajaxOptions.error instanceof Function ) {
                ajaxOptions.error( cache.xhr, cache.statusText, cache.httpError );
            }
            else if( ajaxOptions.error instanceof Array ) {
                for( var i=0, n=ajaxOptions.error.length; i<n; i++ ) {
                    if( ajaxOptions.error[i] instanceof Function ) {
                        ajaxOptions.error[i]( cache.xhr, cache.statusText, cache.httpError );
                    }
                }
            }
        }

        if( ajaxOptions.complete instanceof Function ) {
            ajaxOptions.complete( cache.xhr, cache.statusText );
        }
        else if( ajaxOptions.complete instanceof Array ) {
            for( var i=0, n=ajaxOptions.complete.length; i<n; i++ ) {
                if( ajaxOptions.complete[i] instanceof Function ) {
                    ajaxOptions.error[i]( cache.xhr, cache.statusText );
                }
            }
        }
    },



    //***** Getters / Setters *****//

    /**
     *  Returns the data object as originally sent from the server, otherwise null
     *  @param  {Hash}            ajaxOptions
     *  @return {DataCacheEntry}
     */
    getCache: function( ajaxOptions ) {
        var dataCacheKey = this.getDataCacheKey(ajaxOptions);
        if(!( this.cache[dataCacheKey] instanceof DataCacheEntry )) {
            this.cache[dataCacheKey] = new DataCacheEntry();
        }
        return this.cache[dataCacheKey];
    },

    /**
     *  This creates our hash code for caclulating if two ajaxOptions refer to the same request
     *  For performance, we insert an extra field ajaxOptions.dataCacheKey, this can be set manually to override this function
     *  @param  {Hash}    ajaxOptions
     *  @param  {Boolean} forceRegen    don't use saved value, force a recalculation
     *  @return {String}
     */
    getDataCacheKey: function( ajaxOptions, forceRegen ) {
        if( !ajaxOptions.dataCacheKey || forceRegen ) {
            var dataCacheKey = ajaxOptions.url;
            var data = $.sortHash(ajaxOptions.data);

            if( data ) {
                if( ajaxOptions.url.match(/\?/) ) {
                    dataCacheKey = $.sortQueryString( ajaxOptions.url + "&" + $.param(data) );
                } else {
                    dataCacheKey += "?"+$.param(data);
                }
            }
            dataCacheKey = ajaxOptions.type+":"+dataCacheKey;
            dataCacheKey = dataCacheKey.replace(/[&?]+$/, "");

            ajaxOptions.dataCacheKey = dataCacheKey;
        }
        return ajaxOptions.dataCacheKey;
    }
});
