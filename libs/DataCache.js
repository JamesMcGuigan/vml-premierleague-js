/**
 *  Manages cached lazy loading of urls
 *
 *  TODO: Merge AjaxPoller and DataCache into one class
 *  @example
 *    DataCache.register( "/ajaxLiveTvUrl.json", function(){} );
 *    DataCache.lazyLoad( "/ajaxLiveTvUrl.json", function(){} );
 *
 *  @author James McGuigan
 */
DataCache = Base.extend({},{
    klass: "DataCache",

    // Options
    logging:            false, // {Boolean}  enable/disable logging

    // Internal
    cache:              {}, // {Hash<url>:<JSON>}                data cache
    loading:            {}, // {Hash<url>:<Boolean>}             is the url currently loading
    loaded:             {}, // {Hash<url>:<Boolean>}             has the url successfully loaded
    interval:           {}, // {Hash<url>:<Number>}              ms between polling, if zero then don't poll
    callbacks:          {}, // {Hash<url>:<function(json, url)>} callbacks defined for each url
    _ajaxPollSemaphore: {}, // {Hash<url>:<Number>}              semaphore for poll setTimeout

//    constructor: function( options ) {
//        this.options  = options || {};
//
//        this.logging  = options.logging  || this.logging;
//        this.interval = options.interval || this.interval;
//
//        this.cache     = {}; // {Hash<url>:<JSON>}                  data cache
//        this.loading   = {}; // {Hash<url>:<Boolean>}               is the url currently loading
//        this.loaded    = {}; // {Hash<url>:<Boolean>}               has the url successfully loaded
//        this.interval  = {}; // {Hash<url>:<Number>}                ms to wait between polling, 0 for no-poll
//        this.callbacks = {}; // {Hash<url>:[<function(json, url)>]} callbacks defined for each url
//        this._ajaxPollSemaphore = {}; // {Hash<url>:<Number>}
//    },
    /**
     *  Registers a callback for a data url, and triggers callback with loaded data
     *  Callback will be retriggered when if the url is reloaded from the server 
     *  Callback not triggered if data is already cached @see this.lazyLoad(url,callback)
     *  NOTE: Rebind the callback with $.proxy() in _create(), 
     *        Calling $.proxy() inline returns a unique function on each method call, which may result in duplicate registerations
     *  @param {String}   url
     *  @param {Function} callback
     */
    register: function( url, callback, interval ) {
        if(!( this.callbacks[url] instanceof Array )) {
            this.callbacks[url] = [];
        }
        this.callbacks[url].push(callback);
        this.callbacks[url] = this.callbacks[url].uniq(); 
        this.interval[url]  = (typeof interval !== "undefined") ? interval : (this.interval[url] || null);

        if( this.logging ) { console.log(this.klass+":register(",url,", ",callback,", ", interval ,") - callbacks: ", this.callbacks, ", this: ", this); }
        this.lazyLoad(url);
    },
    /**
     *  Lazy loads the url, and triggers optional callback with loaded/cached data
     *  Doesn't register the callback for subsequent url reloads @see this.register()
     *  @param {String}   url
     *  @param {Function} [optional] callback - function(json,url)
     */
    lazyLoad: function( url, callback ) {
        if( this.logging ) { console.log(this.klass+":lazyLoad(",url,", ",callback,") - callbacks: ", this.callbacks, ", this: ", this); }
        if( this.loading[url] ) {
            $.noop(); // Do nothing
        }
        else if( this.loaded[url] ) {
            if( callback instanceof Function ) {
                callback(this.cache[url],url);
            }
        } else {
            this.load(url); 
        }
    },
    /**
     *  Loads/reloads a data url, triggering registered callbacks as required
     *  Checks if the url is currently loading, and refuses to load if currently loading
     *  @threadsafe 
     *  @param {String} url
     */
    load: function( url ) {
        if( this.logging ) { console.log(this.klass+":load(",url,") - callbacks: ", this.callbacks, ", this: ", this); }
        if( !this.loading[url] ) { 
            this.loading[url] = true;
            $.ajax({
                url: url,
                type: "GET",
                ifModified: !this.loaded[url], // check we have the data in cache before doing a conditional GET
                success: $.proxy( function( json, status, xhr ) {
                    if( json && xhr.status != 304 ) { // 304 notmodified, also assumes that json="" is an invalid response
                        this.loaded[url] = true;
                        this.cache[url]  = json;
                        this.trigger(url);
                    }
                }, this),
                complete: $.proxy( function() {
                    this.loading[url] = false;
                    this.startAjaxPoll(url);
                }, this)
            });    
        }
    },
    startAjaxPoll: function(url) {
        var self = this;
        if( this.interval[url] ) {
            this.stopAjaxPoll(url);
            this._ajaxPollSemaphore[url] = setTimeout( function() {
                self.load(url);                
            }, this.interval[url] );
        }
    },
    stopAjaxPoll: function(url) {
        if( this._ajaxPollSemaphore[url] ) {
            clearTimeout( this._ajaxPollSemaphore[url] );
        }
        this._ajaxPollSemaphore[url] = null;
    },

    /**
     *  Triggers registered callbacks for a given URL
     *  @param {String} url
     */
    trigger: function(url) {
        if( this.callbacks[url] instanceof Array ) {
            for( var i=0, n=this.callbacks[url].length; i<n; i++ ) {
                var callback = this.callbacks[url][i];
                if( callback instanceof Function ) {
                    callback(this.cache[url], url);
                }
            }
        }
    },
    /**
     *  Clears the cache for a given URL
     *  @param {String} url
     */
    clear: function(url) {
        this.loaded[url] = false;
        delete this.cache[url];
    }
});
