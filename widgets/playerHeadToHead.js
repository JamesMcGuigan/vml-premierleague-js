/**
 *  
 *  
 */
$.ui.basewidget.subclass('ui.playerSearch_headToHead', {
    klass: "$.ui.playerSearch",
    options: {
		tabs: '.table_tabs ul li a',
		test: '',
		alpha: '.alpha_sort input',
		quick: '.player_quick_search input:first',
		searchButton: '.player_quick_search input:last',
		filters: '.player_filters select',
		pagination: '.results_pagination a',
		form: 'form#widgetForm',
		rpp: 'select.results_per_page',
		h2hiselect: 'td.h2h-add-sub a', // <td class="h2h-add-sub">
		activeTab: 'az' // default - overridden within component
		
    },
    
	
	
    _create: function() {

		this.el = {};
		this.el.tabs = $(this.options.tabs,this.element);
		this.el.alpha = $(this.options.alpha,this.element);
		this.el.quick = $(this.options.quick,this.element);
		this.el.searchButton = $(this.options.searchButton,this.element);
		this.el.filters = $(this.options.filters,this.element);
		this.el.activeTab = $('a[href="#'+this.options.activeTab+'"]',this.element);
		this.el.pagination = $(this.options.pagination,this.element);
		this.el.form = $(this.options.form,this.element);
		this.el.rpp = $(this.options.rpp,this.element);
		this.el.h2hs = $(this.options.h2hselect,this.element);
		this.addEventHandlers();
    },
    
    _init: function() {
		this._initSearch();
    	this._initTabs();
    	this._initPagination();
		
    },
    
    addEventHandlers: function() {
    	this.el.tabs.live("click",this._tabClick);
    	this.el.alpha.live("change",{widget:this},this._alphaClick);
    	this.el.quick.live("focus blur",this._searchDefault)
    	this.el.searchButton.live("click",{widget:this.el.quick},this._searchClick);
    	this.el.filters.live("change",{widget:this},this._filterChange);
    	this.el.pagination.live("click",{widget:this},this._paginationClick);
    	this.el.form.bind("submit",{widget:this},this._submit);
    	this.el.rpp.live("change",{widget:this},this._resultsCountChange);
    	this.el.h2hs.live("click",{widget:this},this._h2hClick);
    },
    
    _initSearch: function() {
    	
    	// Set default value
    	var q = this.el.quick;  	
    	q.val(q.attr('data-default'));
    	
    },
    
    _initTabs: function() {
    	
    	this.el.activeTab.click();
    	
    	var s = this.el.tabs.filter('.current').attr('href');
    	
    	var active = ( s === "#az") ? "A_TO_Z" : "BY_CLUB",
    	    	
	    	$i = $.el("input").attr({
	    		type:"hidden",
	    		value:active,
	    		name:"paramSearchType"
	    	});
    	
    	this.el.form.append($i);
    },
    
    _initPagination: function() {
    	var $p = $('.pagination:first select',this.element);
    	var newd = $.el('ul').addClass('results_pagination');
    	$('option',$p).each(function(){
    		
    		var val = $(this).html();
    		var sel = $(this).attr('selected');
    		var newa = (val === "&hellip;") ? 
    				$.el('span').html(val) : 
    				$.el('li').html($.el('a').attr('href','#' + val ).addClass(sel).html(val));
    		
    		newd.append(newa);
    		
    	});
    	$('.pagination select').remove();

    	var selected = $('a.selected',newd).text();
    	
    	var ninp = ""
    	
    	if ($('#paramSelectedPageIndex').length > 0) {
    		
	    	ninp = $.el('input').attr({
	    		type:'hidden',
	    		name:'paramSelectedPageIndex',
	    		id:'paramSelectedPageIndex',
	    		value:selected
	    	});
    	}
    	$('.pagination').append(newd.after(ninp));
    	
    },
    
    //*** Events ***//
    
    /**
     * Handle the tabs
     */
    _tabClick: function (event) {
    	
    	var $t 		= $(this),
    		target 	= $t.attr('href'),
    		$tabs 	= $t.closest('ul').find('a'),
    		$az 	= $('.alpha_sort',this.element),
    		$club 	= $('.club_select',this.element),
    		c = 'current',
    		s = 30,
    		type = "A_TO_Z";
    		
    	if (!$t.closest('a').hasClass(c)) {
    		
	    	$tabs.removeClass(c);
	    	$t.addClass(c);
	    	
	    	if (target === "#az") {
	    		$az.fadeIn(s);
	    		$club.fadeOut(s);
	    	} else {
	    		$az.fadeOut(s);
	    		$club.show(s);
	    		type = "BY_CLUB";
	    	}
	    	
	    	$('input[name="paramSearchType"]').val(type);
    	}
    	
    	return false;
    },
    
    /**
     * Form submit
     */
    _submit: function (event) {
    	
    	var $w = event.data.widget,
			$q = $w.el.quick;
    	
    	if ($q.val() == $q.attr('data-default')) {
    		$q.val("");
    	}

    	$('select[name="paramItemsPerPagex"]').remove();
    	
    	$('input,select',$w.el.form).each(function(){
    		var $t = $(this);
    		if ($t.attr("name") !== "paramAToZ") {
    			console.log($t,$t.attr("name"),$t.val());
    		}
    	});
    	
    	var $t = $('.alpha_sort :radio:checked') 
    	
    	console.log($t,$t.attr("name"),$t.val());
    	
    	
    	
    	//return false;
    },
    
    _resultsCountChange: function (event){
    	
    	var $s = $(event.target);
    	var name = "paramItemsPerPage";
    	
    	if ($s.attr('name') !== name) {
    		$('select[name="'+name+'"]').val($s.val());
    	} else {
    		
    	}
    	event.data.widget.el.form.submit();
    },
    
    /**
     * Alphabet filters
     */
    _alphaClick: function (event) {
    	
    	var letter = $(event.target).val();
    	
    	/* for testing only alert(letter);*/ 
    	
    	event.data.widget.el.form.submit();
    	
    	return false;
    },
    
    /**
     * Quick search focus and blur
     */
    _searchDefault: function (event) {
    	
    	var _default = $(this).attr('data-default');
    	var _val = $(this).val();
    	var test = "";
    	
    	if (event.type === "focusin") {
    		// check value against default.
    		// set to blank if it's the same
    		$(this).val( (_val == _default) ? "" : (_val));
    		;
    	} else if (event.type === "focusout") {
    		// check value is blank
    		// set to default if it is.
    		$(this).val( (_val == "") ? _default : _val); 
    	}
    },
    
    /**
     * Change event for season and club filters 
     */
    _filterChange: function (event) {
    	  	
    	if ($(this).val() != "") { $(this).closest('form').submit(); }
    },
    
    /**
     * Quick search submit
     */
    _searchClick: function(event) {
    	
    	var _default = event.data.widget.attr('data-default');
    	var _val = event.data.widget.val();
    	
    	return (_val != _default && _val != "") ? true : false;
    	
    },
    
    /**
     * Pagination
     */
    _paginationClick: function(event) {
    	var $t = $(this);
    	
    	var $q = event.data.widget.el.quick;
	
		if ($q.val() == $q.attr('data-default')) {
			$q.val("");
		}
    	
    	$('#paramSelectedPageIndex').val($t.text());
    	$t.closest('form').submit();
    },
    
    /**
     * 
     */
    _headToHead: function() {
		//alert('headToHead');
    }
});
