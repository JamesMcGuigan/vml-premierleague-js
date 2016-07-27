$.ui.basewidget.subclass('ui.fixtureSearch', {
    klass: '$.ui.fixtureSearch',
    options: {
        hash:         null,    // {Hash}         define objects and arrays within the constructor, else it will create a class variable
        dayNamesMin : ['S','M','T','W','T','F','S'] // {Array} 
    },
    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
    },
    // Called from constructor after _create() – automatically calls this._super() before function
    _init: function() {
        this.initDatepickers();
        this.initDateRangeSelection();
        this.getState();
        this.onMonthChange();
        this.monthHighlight();
        this.onDayChange();
        this.dayHighlight();
		this.changeDateSelection();
		
		this.element.find('input').change();
		this.element.find('select').change();
    },
    /**
     * @deprecated
     */
    initDatepickers: function () {
    	// quit early
    	return true;
    },
    initDateRangeSelection : function(){
    	var that = this;
    	$(':radio:checked','#range-types').live("change",function(){
        	console.log($(this).val());
    		var act = $(this).val();
        	that.swapView(act);
        });
    },
    getState: function() {
    	var act = $(':radio:checked','#range-types').val();
    	if (act == null) {
    		var act = $('#range-types option:selected').val();
    	}
    	this.swapView(act);
    	//insert other state-initialisation here
    },
    onMonthChange: function() {
    	var that = this;
    	$('.dateMonth input','#range-options').live('change',function(){
    		that.monthHighlight();
    	});
    },
    monthHighlight: function() {
    	var $sel =  $('.dateMonth :radio:checked','#range-options');
		$('.dateMonth label','#range-options').removeClass('on');
		$sel.closest('li').find('label').addClass('on');
		// hide + disable week's day drop-down
		$('.dateMonth select').hide().removeAttr('selected').attr('disabled','disabled');
		$sel.closest('li').find('select').removeAttr('disabled').show();
    },
    onDayChange: function() {
    	var that = this;
    	$('.dateDays input','#range-options').live('change',function(){
    		that.dayHighlight();
    	});
    },
    dayHighlight: function() {
    	var $sel =  $('.dateDays :radio:checked','#range-options');
    	$('.dateDays label','#range-options').removeClass('on');
    	$sel.closest('li').find('label').addClass('on');
    },
    changeDateSelection: function() {
    	$('.dateMonth select').live('change',function(){
    		$('.dateMonth select option').removeClass('selected');
    		$('.dateMonth select :selected').addClass('selected');
    		$(this).attr("name", "dateSelected");
    	});
    },
    swapView: function(act) {
    	if (act === '.dateSeason') {
    		$(act+' :checked')
    			.removeAttr('checked')
    			.closest('ul')
    			.find('label.on')
    			.removeClass('on');
    		$('#range-options').children().not(act)
    			.slideUp('fast', function() {
    			//Disable unwanted inputs and selects
    			$('#range-options input').attr('disabled','disabled');
    		});
    	} else {
    		var today = new Date();
    		$('label[for="month'+(today.getMonth() + 1)+'"]').click();
    		$('#range-options input')
    			.removeAttr('disabled');
    		$('#range-options').children()
    			.not(act)
    			.removeAttr('selected')
    			.attr('disabled','disabled');
    		$(act,'#range-options').slideDown('fast');
    	}
    }
});

$.ui.fixtureSearch.subclass('ui.broadcastSearch', {
    klass: '$.ui.broadcastSearch',
    
    initDateRangeSelection : function(){
		var that = this;
	    $("#range-types").live("change",function(){
	    	var act = $(this).val();
	    	that.swapView(act);
	    });
	},
    getState: function() {
		var that = this;
	    $("#range-types").live("change",function(){
	    	var act = $(this).val();
	    	that.swapView(act);
	    });
	},
	swapView: function(act) {
    	if (act === '.dateSeason') {
    		$(act+' :checked')
    			.removeAttr('checked')
    			.closest('ul')
    			.find('label.on')
    			.removeClass('on');
    	} else {
    		var today = new Date();
    		$('label[for="month'+(today.getMonth() + 1)+'"]').click();
    	}
    	// Use callback to init SlideDown once SlideUp complete
    	$('#range-options').children().not(act)
    		.slideUp('fast', function() {
    			//Disable unwanted inputs and selects
    			$('#range-options option').removeAttr('selected');
    			$('#range-options select').removeAttr('selected').attr('disabled','disabled');
    			//Slide down new options
    			$(act,'#range-options').slideDown('fast');
    	});
    }
});