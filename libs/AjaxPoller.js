/**
 *  AjaxPoller polls the server /statusCheck.do and disseminates data based on UID
 *
 *  Use AjaxPoller.register(), AjaxPoller.unregister() as class methods, 
 *      instances will be created for you automattically
 *      
 *  @example (ticker.js)
 *  AjaxPoller.register({
 *      url:          url,
 *      type:         "GET",
 *      interval:     this.options.ajaxInterval,
 *      dataType:     "json",
 *      handler:      [this, this.ajaxPollHandler]
 *  });
 *
 *  TODO: Merge AjaxPoller and DataCache into one class
 *  @author James McGuigan
 */
AjaxPoller = Base.extend({
    klass: "AjaxPoller",

    // Constructor options
    url:          "",     // {String} url to pass to jQuery.ajax()
    type:         "GET",  // {String} GET or POST to pass to jQuery.ajax()
    dataType:     "json", // {String} dataType to pass to jQuery.ajax()
    ifModified:   true,   // {Boolean} option passed to jQuery.ajax()
    interval:     60000,  // {Number} in ms - how often do we poll, default 1 minute
    initialPoll:  null,   // {Number} in ms - how soon for the inital poll, default this.interval
    handlers:     null,   // {Array}

    // Instance Variables
    lastJson:        null,  // {Hash} contents of last json data fetched
    count:           0,     // Iterator for number of calls to the server made
    xhr:             null,  // Currently active xhr requests
    etag:            null,  // {String} last recieved Etag
    ajaxPollRunning: false, // {Boolean} has the ajaxPoll started yet

    /**
     *  @param {String}          options.url                url to poll
     *  @param {Number}          options.interval           polling interval in seconds, default 60s
     *  @param {Any}             options.handler            $.proxy(function(){}), [context, function], ["eventName", EventManager], UidEventManager
     *  @param {Array<handler>}  options.handlers           Array version of above
     */
    constructor: function( options ) {
        this.options = options || {};

        this.interval    = Number(options.interval)    || this.interval;
        this.initialPoll = Number(options.initialPoll) || 0;             // Run first poll immediatly
        this.type        = (options.type)              || this.type;     // Default to GET
        this.count       = 0;
        this.handlers    = [];

        this.registerEventManager();
        this.register(options);
    },
    register: function( options ) {
        if( this.options.handler      ) { this.addHandler( options.handler ); }

        if( typeof options.interval === "number" ) {
            this.interval = Math.min( options.interval, this.interval );
        }

        if( !options.disabled ) {
            this.startAjaxPoll();
        }
    },
    unregister: function( options ) {
        if( options.handler ) { this.removeHandler( options.handler ); }
    },

    addHandler: function( handler ) {
        // TODO: Add validation
        if( handler ) {
            this.handlers.push( handler );
        }
    },
    removeHandler: function( handler ) {
        for( var i=0, n=this.handlers.length; i<n; i++ ) {
            if( handler === this.handlers[i]
             || handler instanceof Array && this.handler[i] instanceof Array
             && handler[0] === this.handler[i][0] && handler[1] === this.handler[i][1]
            ) {
                Array.remove( this.handlers, i );
                break;
            }
        }
        if( this.handlers.length === 0 ) {
            this.stopAjaxPoll();
        }
    },

    /**
     *  Defines an event manager for startAjaxPoll and stopAjaxPoll commands
     *  Setter needs to be called addEventManager as part of the implied EventManager interface
     *  @param {EventManager} eventManager to load
     */
    registerEventManager: function() {
        EventManager.register( this, "startAjaxPoll", this.startAjaxPoll );
        EventManager.register( this, "stopAjaxPoll",  this.stopAjaxPoll );
    },
    unregisterEventManager: function() {
        EventManager.unregister( this, "startAjaxPoll" );
        EventManager.unregister( this, "stopAjaxPoll"  );
    },


    /**
     *  Does an inital server poll, then sets up a repeating poll loop
     *  The inital poll is set using a small timeout, to allow this function to be
     *  repeatedly called at startup with only a single call to the server actually being made
     */
    startAjaxPoll: function() {
        if( this.ajaxPollRunning ) { return; }

        clearTimeout( this._startAjaxPollSemaphore );
        clearTimeout( this._refreshTimeoutId );

        var myself = this;
        this._startAjaxPollSemaphore = setTimeout( function() {
            try {
                myself.statusPollLoop();
                myself.pollServer();
                myself.ajaxPollRunning = true;
            } catch(e) {
                console.error("Exception: AjaxPoller.startAjaxPoll ", this, e);
                console.dir(e);
            }
        }, this.initialPoll );
    },

    /**
     *  Set a repeating timeout to dynamically update the lock and workflow status
     */
    statusPollLoop: function() {
        var myself = this;
        if( this._refreshTimeoutId ) {
            clearTimeout( this._refreshTimeoutId );
        }
        if( this.interval > 0 ) {
            this._refreshTimeoutId = setTimeout( function() {
                try {
                myself.statusPollLoop();
                myself.pollServer();
                myself.ajaxPollRunning = true;
                } catch(e) {
                    console.error("Exception: AjaxPoller.statusPollLoop ", this, e);
                    console.dir(e);
                }
            }, this.interval );
        } else {
            this.ajaxPollRunning = false;
        }
    },
    /**
     *  Stops the repeating timeout to dynamically update the lock and workflow status
     */
    stopAjaxPoll: function() {
        if( this._startAjaxPollSemaphore ) { clearTimeout( this._startAjaxPollSemaphore ); }
        if( this._refreshTimeoutId       ) { clearTimeout( this._refreshTimeoutId );         }
        this.ajaxPollRunning = false;
    },

    trigger: function( json, status, xhr ) {
        for( var i=0, n=this.handlers.length; i<n; i++ ) {
            // Function - context supplied via $.proxy()
            if( this.handlers[i] instanceof Function ) {
                this.handlers[i]( json, status, xhr );
            }
            else if( this.handlers[i] instanceof Array && this.handlers[i].length == 2 ) {
                // [ context, Function ]
                if( this.handlers[i][1] instanceof Function ) {
                    this.handlers[i][1].call( this.handlers[i][0], json, status, xhr );
                }
                // [ eventName, EventManager ]
                if( this.handlers[i][1] instanceof EventManager ) {
                    this.handlers[i][1].trigger( this.handlers[i][0], json, status, xhr );
                }
            }
            // UidEventManager
            else if( this.handlers[i] instanceof UidEventManager ) {
                this.handlers[i].trigger( json, status, xhr );
            }
            else {
                console.warn( this.klass+"::trigger(): Invalid event: ", this.handlers[i], this );
            }
        }
    },

    pollServer: function() {
        var myself = this;

        // Skip sending the next poll request if the previous one has not returned
        if( this.xhr && this.xhr.readyState !== 0 && this.xhr.readyState !== 4 ) {
            this.count--; // ensure every 10th request is a pollForWorkflow, even if we skip some
            return;
        }

        this.xhr = $.ajax({
            type:       this.type,
            url:       (this.options.url instanceof Function) ? this.options.url() : this.options.url,
            dataType:   this.options.dataType,
            ifModified: this.options.ifModified,
            success:  $.proxy(function( json, status, xhr ) {
                if( json && xhr.status != 304 ) { // 304 notmodified, also assumes that json="" is an invalid response
                    //var headers = $.getHeaders( xhr );
                    myself.trigger( json, status, xhr );
                }
            },this),
            error: $.proxy(function( xhr, status, error ) {
                if( xhr.status == 404 || xhr.status == 502 ) { // Not Found or Proxy Error
                    this.stopAjaxPoll();
                    console.warn( this.klass+"::pollServer(): 404 on ", this.url, " aborting further polling ", this );
                }
            },this)
        });
    },
    destroy: function() {
        this.stopAjaxPoll();
        this.unregisterEventManager();

        if( this.xhr && this.xhr.readyState !== 4 ) {
            try {
                this.xhr.abort();
            } catch(e) {}
        }
        this.xhr = null;
        this.base();
    }
},{
    // Class functions

    ajaxPollers: {},

    /**
     *  @param {String}          options.url                url to poll
     *  @param {Number}          options.interval           polling interval in seconds, default 60s
     *  @param {Any}             options.handler            $.proxy(function(){}), [context, function], ["eventName", EventManager], UidEventManager
     *  @param {Array<handler>}  options.handlers           Array version of above
     *  @param {EventManager}    options.eventManager       [optional] registers startAjaxPoll and stopAjaxPoll events
     */
    register: function( options ) {
        var url = options.url;
        if( this.ajaxPollers[url] ) {
            this.ajaxPollers[url].register(options);
        } else {
            this.ajaxPollers[url] = new AjaxPoller(options);
        }
    },
    unregister: function( options ) {
        var url = options.url;
        if( this.ajaxPollers[url] ) {
            this.ajaxPollers[url].unregister(options);
        }
    }
});
