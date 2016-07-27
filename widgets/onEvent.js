/**
 *  <input type="checkbox" widget="onEvent" event="onCheck" target="#weeks" addClass="selected" removeClass="unselected"/>
 * 
 *  <select widget="onEvent" event="onChange" target="#weeks">
 *  	<option updateSelect="[01,02,03,04]">2011-2012</option>
 *  </select>
 *  <select id="weeks"></select>
 *  
 *  
 *  Define event and target, all other options are commands to perform upon event
 */
$.ui.basewidget.subclass('ui.onEvent', {
    klass: '$.ui.onEvent',
    options: {
        event:        null,  // {String} one of: onCheck, onChange
        target:       null,  // {Selector}
        addClass:     null,  // {String}
        removeClass:  null,  // {String}
        updateSelect: null   // {Array|Hash} "[01,02,03,04]" or { "01": "Week 1", "02": "Week 2" }
        // TODO: add other commands as required
    },
    required: {
        event:  String,
        target: String
    },
    _create: function() {
        this.target = $(this.options.target);
        this.onEvent = $.proxy( this.onEvent, this );
        this.onCheck = $.proxy( this.onCheck, this );
        this.onChange = $.proxy( this.onChange, this );
        this.events = this.options.event.split(",");

        if( this.target.length === 0 ) {
            console.error(this.klass+":_init(): invalid target: ", this.target, this.options.target, " this: ", this);
        }
    },
    _init: function() {
        for( var i=0, n=this.events.length; i<n; i++ ) {
            switch( this.events[i] ) {
                case "onCheck":
                    this.element.bind("change", this.onCheck );
                    this.onCheck();
                    break;
                case "onChange":
                	this.element.bind("change", this.onChange );
                    this.onChange();
                    break;
                default:
                    console.error(this.klass+":_init(): invalid event: ", this.events[i], " this: ", this);
            }
        }

        this.element.bind( this.options.event, this.onEvent );
    },
    destroy: function() {
        this.element.unbind( this.options.event, this.onEvent );
    },

    onCheck: function() {
        if( this.element.attr("checked") === "checked" ) {
            this.onEvent();
        }
    },
    onChange: function() {
    	this.onEvent();
    },

    onEvent: function() {
    	// Take parameters from selected option if appropriate
    	var options = this.options;
    	if( this.element.is("select") ) {
    		options = $.getAttributeHash( this.element.find("option:selected"), this.options );
    	}
    	
    	// Handle Events
        if( options.addClass ) {
            this.target.addClass( options.addClass );
        }
        if( options.removeClass ) {
            this.target.removeClass( options.removeClass );
        }
        if( options.updateSelect ) {
        	this.updateSelect(options);
        }
    },
    updateSelect: function( options ) {
    	if( this.target.is("select") ) {
    		this.target.find("option").remove();
    		if( options.updateSelect instanceof Array ) {
    			for( var i=0; i<options.updateSelect.length; i++ ) {
    				var value = options.updateSelect[i];
    				this.target.append("<option>"+value+"</option>");
    			}
    		} else if( typeof options.updateSelect === "object" ) {
    			for( var key in options.updateSelect ) {
    				var value = options.updateSelect[key];
    				this.target.append("<option value='"+key+"'>"+value+"</option>");
    			};
    		} else {
    			console.warn(this.klass+":updateSelect() - this.updateSelect is not of type Array or Object: ", this.updateSelect, " - this: ", this  );
    		}
    	} else {
    		console.warn(this.klass+":updateSelect() - this.target: ", this.target, " is not a <select> - this: ", this  );
    	}
    }
});
