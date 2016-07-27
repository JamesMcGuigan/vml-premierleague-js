$.ui.basewidget.subclass('ui.playerSearch', {
    klass: "$.ui.playerSearch",
    options: {
		tabs: 			 '.table_tabs a',	  		// {String} Search type tab links
		search:		 	 '.search',			  		// {String} Class of search section parent div 
		filter: 		 '.filter',			  		// {String} Class of filter section parent div 
		resultsPerPage:  '.results_per_page', 		// {String} Class of result pagination section parent div
		paramResPerPage: 'paramItemsPerPage', 		// {String} Name  of input for how many items per page 
		searchTypeInput: '#paramSearchType',  		// {String} Id    of input for search type parameter
		searchdefault:   'Enter player name'  // {String} Default 'Quick Search' text
		//h2hiselect: 	 'td.h2h-add-sub a'   // {String} TBA: H2H Selection target cell
    },
   _create: function() {
		this.el.tabs 		   = this.element.find( this.options.tabs );
		this.el.form 		   = this.element.find( 'form' );
		this.el.searchType	   = this.element.find( this.options.searchTypeInput );
		this.el.searchInput    = this.element.find( 'input[type=text]',   this.options.search );
		this.el.searchButton   = this.element.find( 'input[type=submit]', this.options.search );
		this.el.filterAlpha    = this.element.find( '.alpha_sort',  	  this.options.filter );
		this.el.filterClub     = this.element.find( '.club_selectLi',     this.options.filter );
		this.el.filterSeason   = this.element.find( '#paramSeason',       this.options.filter );
		this.el.filterReset    = this.element.find( '#resetButton',       this.options.filter );
		this.el.pageLinks      = this.element.find( '.pagination', 		  this.options.resultsPerPage );
		this.el.pageNumItems   = this.element.find( '.items_per_page',    this.options.resultsPerPage );
		this.el.pageInput      = this.element.find( '[name=paramSelectedPageIndex]' );
		//this.el.h2hs 		   = this.element.find( this.options.h2hselect );
    },
   _init: function() {
    	this.el.tabs	    .live("click", 		$.proxy(this.tabClick, 	    this));
    	this.el.searchInput .live("focus blur", $.proxy(this.searchDefault, this));
    	this.el.searchButton.live("click",		$.proxy(this.searchClick,   this));
    	this.el.filterReset .live("click",		$.proxy(this.reset,			this));
    	this.el.filterAlpha .live("change",		$.proxy(this.submit,        this));
    	this.el.filterClub  .live("change",		$.proxy(this.submit,        this));
    	this.el.filterSeason.live("change",		$.proxy(this.submit,        this));
    	this.el.pageNumItems.live("change",     $.proxy(this.resultsClick,  this));
    	this.el.pageLinks   .live("change",		$.proxy(this.pageClick,     this));
    	//this.el.h2hs		.live("click",		$.proxy(this.h2hClick,		this));
    	
    	this.initTabs();
    },
    initTabs: function() {
    	if (this.el.tabs.filter('.current').attr('href') === '#az') {
    		this.el.filterClub.hide();
    	} else if (this.el.tabs.filter('.current').attr('href') === '#club') {
    		this.el.filterAlpha.hide();
    	}
    },
    tabClick: function(event) {
    	var type = "A_TO_Z";
    	var current = this.el.tabs.filter( event.currentTarget );
    	if (!current.hasClass('current')) {
    		this.el.tabs.not(current).removeClass('current');
    		current.addClass('current');
	    	if (current.attr('href') === "#az") {
	    		this.el.filterAlpha.slideDown();
	    		this.el.filterClub.hide();
	    	} else {
	    		this.el.filterAlpha.slideUp();
	    		this.el.filterClub.show();
	    		type = "BY_CLUB";
	    	}
	    	this.el.searchType.val(type);
    	}
    	return false;
    },
    searchDefault: function(event) {
    	var val = this.el.searchInput.val();
    	if (event.type === "focusin") {
    		// check value against default and set to blank if same
    		this.el.searchInput.val( 
    			(val.toLowerCase() === this.options.searchdefault.toLowerCase()) ? '' : (val)
    		);
    	} else if (event.type === "focusout") {
    		// check value is blank and set to default if it is.
    		this.el.searchInput.val( 
    			(val === '') ? this.options.searchdefault : val); 
    	}
    },
    searchClick: function() {
    	return (this.el.searchInput.val() != this.options.searchdefault 
    				&& this.el.searchInput.val() != '') ? this.submit() : false;
    },
    pageClick: function(event) {
    	var page = this.el.pageLinks.find( ':checked', event.currentTarget ).val();
    	this.el.pageInput.val(page);
    	this.submit();
    	return true;
    },
    resultsClick: function(event) {
    	var sel = this.el.pageNumItems.filter( event.currentTarget );
    	// Remove other select box
    	this.el.pageNumItems.not(sel).remove();
    	// Change input name if required
    	sel.attr('name', this.options.paramResPerPage);
    	this.submit();
    	return true;
    },
    submit: function() {
		if (this.el.searchInput.val() == this.options.searchdefault) {
			this.el.searchInput.val('');
    	}
		// Encode and strip string for search
		this.el.searchInput.val(this.el.searchInput.val().replace(/\s+/g,' ').trim());
		// Reset club input if A-Z tab 
		if ( this.el.tabs.filter('.current').attr('href') === '#az' ) {
			this.el.filterClub.remove();
		}
		// Remove A-Z input if club tab 
		if ( this.el.tabs.filter('.current').attr('href') === '#club' ) {
			this.el.filterAlpha.remove();
		}
		this.el.form.submit();
		return true;
    },
    reset: function() {
    	this.el.searchInput.val('');
    	this.el.filterAlpha.find('input').remove(); //Hacky way to reset but works
    	this.el.filterClub.val(0);
    	this.el.filterSeason.val(0);
    	this.el.pageNumItems.val(0);
    	
    	this.el.form.submit();
    	return true;
    }
});

$.ui.playerSearch.subclass('ui.playerSearchCustom', {
	klass: "$.ui.playerSearchCustom",
	options: {
		
	},
	_create: function() {
		this.el.filterPosition = this.element.find( '#paramPosition', this.options.filter );
	},
	_init: function() {
		this.el.filterPosition.live("change", $.proxy(this.submit, this));
	},
    reset: function() {
    	this.el.searchInput.val('');
    	this.el.filterAlpha.find('input').remove(); //Hacky way to reset but works
    	this.el.filterClub.val(0);
    	this.el.filterSeason.val(0);
    	this.el.filterPosition.val(0);
    	this.el.pageNumItems.val(0);
    	
    	this.el.form.submit();
    	return true;
    }
});