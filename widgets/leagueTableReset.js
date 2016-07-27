$.ui.basewidget.subclass('ui.leagueTableReset', {
    klass: '$.ui.leagueTableReset',
    options: {
        selector: 			null,
        selectedRowClass:   'selected-row',
        selectedCellClass:	'selected-cell'
    },
    required: {
        selector: 			String,
        selectedRowClass:   String,
        selectedCellClass:	String
    },
    _init: function() {
        this.element.bind( "click", $.proxy(this.onClick, this) );
    },
    onClick: function() {
    	this.element.closest(this.options.selector).hide();
    	
    	//Select table, remove selected classes and add accented classes
    	var tr = this.element.closest(this.options.selector).prev();
    	var table = tr.closest('table');
    	
    	tr.removeClass( this.options.selectedRowClass );
    	tr.children('td').removeClass( this.options.selectedCellClass );
    	    	
    	table.find('tr.club-row').each( function(i) {
			if ( i == 0 ) {
    			$(this).addClass( 'accent1' );
        	} else if ( i >= 1 && i <= 3 ) {
        	   	$(this).addClass( 'accent2' );
        	} else if ( i == 4 ) {
        	   	$(this).addClass( 'accent3' );
        	} else if ( i >= 17 ) {
        	   	$(this).addClass( 'accent4' );
        	} else {
        	    //do nothing
        	}
    	});
    	
        return false;
    }
});
