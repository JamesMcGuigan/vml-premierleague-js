/**
 *  EventManager manages event listeners and event triggers.
 *  This allows for decoupled event-based communication between widgets.
 *
 *  @examples
 *    eventManager.register( this, "setActiveComponent", function() {} );
 *    eventManager.trigger( "createDialogeBox", "Hello World" );
 *    eventManager.unregister( this );
 *    eventManager.logging = true;
 *
 *
 *  @events
 *  Below is a list of events registered/triggered within the application (please update as new ones are added):
 *
 *  //----- Command Events - trigger these events to tell other widgets to do things -----//
 *
 *
 *
 *  //----- Status Events - triggered when the state of the application has changed -----//
 *
 *
 *
 *  //----- Getter Events - trigger in order to request data from the rest of the application -  -----//
 *
 *
 *  Static Class
 *  @author James McGuigan
 */
EventManager = Base.extend({},{
    klass: "EventManager",
    
    events:      {},    // {Hash}
    stack:       [],    // {Array}         for debugging, stack of current events being triggered
    lastEventId: 0,

    // Constructor options
    logging:     false, // {Boolean}       if true, add logging to all functions
    logKlass:    {},    // {Hash<Boolean>} if this.logKlass[context.klass] === true, then add logging
    logEvent:    {},    // {Hash<Boolean>} if this.logEvent[eventName] === true, then add logging

//*** Static Class ***//
//    constructor: function( options ) {
//        this.options  = options || {};
//
//        // Init objects here, otherwise they become class rather than instance variables
//        this.events   = {};
//        this.stack    = [];
//
//        this.logging  = this.options.logging  || false;
//        this.logKlass = this.options.logKlass || {};
//        this.logEvent = this.options.logEvent || {};
//    },

    /**
     *  Returns a count of the number of each type of widget in memory.
     *  This is primary if use in debugging and locating memory leaks.
     *  If a klass is provided, the returned data is filtered to only include that klass
     *
     *  @param  {String} klass  [optional] the klass name
     *  @return {Hash<Number>}  list of widgets in memory indexed by klass
     */
    getWidgetCountInMemory: function( klassName ) {
        klassName = klassName || '';
        var count   = {};
        var widgets = this.trigger( "returnAll"+klassName );
        for( var i=0, n=widgets.length; i<n; i++ ) {
            var klass = widgets[i].klass;
            if( !count[klass] ) { count[klass] = 0; }
            count[klass]++;
        }
        return count;
    },



    /**
     *  Registers an handler function, for a given object for a perticular eventName
     *  @param {Object}   context         the instance to listen to the event
     *  @param {String}   eventName       the name of the event to listen for
     *  @param {Function} handler         the function to call when the event is triggered, may take multiple args passed in via trigger
     *  @param {Boolean}  options.delayed call handler after all non-delayed functions
     */
    register: function( context, eventName, handler, options ) {
        console.assert( typeof eventName === "string", this.klass+"::register: eventName must be of type String ", arguments ); // instanceof String fails in FF2
        console.assert( handler instanceof Function,   this.klass+"::register: handler must be of type Function ", arguments );

        if( !this.events[eventName] ) { this.events[eventName] = {}; }

        var eventHash = {
            eventId:   ++this.lastEventId,
            context:   context,
            eventName: eventName,
            handler:   handler,
            delayed:   !!(options && options.delayed)
        };

        this.events[eventName][eventHash.eventId] = eventHash;

        if( this.logging || this.logEvent[eventName] || this.logKlass[context.klass] ) {
            console.debug( context.klass, '::register(',eventName,') on context:', context.klass,'(',context,'), handler: ', handler, ' = ', this.events[eventName] );
        }
    },
    /**
     *  Unregisters any event handlers bound to an eventName
     *  @param {Object}   context    the instance to listen to the event
     *  @param {String}   eventName  [optional] eventName that was being listened for, if empty unbind all eventNames
     *  @param {Function} handler    [optional] reference to handler function, if empty unbind all functions
     */
    unregister: function( context, eventName, handler ) {
        var name, key;
        var eventNameHash = {};
        if( !this.events[eventName] ) { this.events[eventName] = {}; }

        if( eventName ) {
            eventNameHash[eventName] = eventName; // loop over only eventName
        } else {
            eventNameHash = this.events;          // loop over all eventNames
        }

        for( name in eventNameHash ) {
            if( !this.events[name] ) {
                continue;
            }
            for( key in this.events[name] ) {
                if( this.events[name][key]
                 && (!context || context === this.events[name][key].context)
                 && (!handler || handler === this.events[name][key].handler) ) {
                    delete this.events[name][key];
                }
            }
        }

        if( this.logging || this.logEvent[eventName] || this.logKlass[context.klass] ) {
            console.debug( context.klass, '::unregister(',eventName,') on context:', context.klass,'(',context,'), handler: ', handler, ' = ', this.events[eventName] );
        }
    },

    /**
     *  Fires an event, calls all listeners
     *  @param  {String} eventName  eventName to fire
     *  @param  {Object} arg        [optional] arg to pass to the event handlers
     *  @param  {Object} argN       [optional] may pass in multiple arguments
     *  @return {Array}             return values of all handler functions called
     */
    trigger: function( eventName ) {
        console.assert( typeof eventName === "string", this.klass+"::trigger: eventName must be of type String", arguments ); // instanceof String fails in FF2

        var i, pdi, key, eventHash, argKlass, args = [], result, results = [], processingDelayed;

        this.stack.push(eventName); // For debugging purposes
        if( this.logging || this.logEvent[eventName] ) {
            var eventNameKlass = {}, klass;
            for( key in this.events[eventName] ) {
                klass = this.events[eventName][key].context.klass;
                eventNameKlass[klass] = (eventNameKlass[klass]||0) + 1; // useful for debugging event memory leaks
            }
            console.debug( this.klass, '::START::trigger( ', arguments, ') count: ', eventNameKlass, " stack: ", this.stack, ", over: ", this.events[eventName] );
        }

        for( i=1, n=arguments.length; i<n; i++ ) { // skip first argument, its the eventName
            args.push( arguments[i] );
        }

        // TODO: profile if this.events[eventName] is better off as a hash or an array
        if( this.events[eventName] ) {
            for( pdi=0, processingDelayed=false; pdi<2; pdi++, processingDelayed=true ) {
                for( key in this.events[eventName] ) {
                    eventHash = this.events[eventName][key];
                    if( !eventHash ) {
                        continue; // nothing to see here... move on
                    }
                    if( eventHash.delayed != processingDelayed ) {
                        continue; // skip the delayed events first, then the normal ones on the second loop
                    }

                    if( eventHash.context._destroyed ) {
                        this.unregister( eventHash.context ); // Garbage collection
                        continue;
                    }


                    if( eventHash.handler instanceof Function ) {

                        // Fire at William
                        result = eventHash.handler.apply( eventHash.context, args );
                        if( typeof result !== "undefined" ) {
                            results.push( result );
                        }

                        // Logging
                        if( eventHash.context && this.logKlass[eventHash.context.klass] ) {
                            argKlass = args[0] && args[0].klass || '';
                            console.debug( eventHash.context.klass, "::triggered(", eventName, ") args: ", argKlass, "(", args, ") = ", result, " stack: ", this.stack );
                        }
                    }
                }
            }
        }
        if( this.logging || this.logEvent[eventName] ) {
            console.debug( this.klass, '::END::trigger( ', eventName, args, ') over: ', this.events[eventName] );
        }
        this.stack.pop(); // For debugging purposes
        return results;
    }
});
