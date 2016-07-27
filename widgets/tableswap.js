/**
 * 		tableswap widget.
 * 
 * 		Usage: apply to a <div> element which is parsed for tables to be swapped.
 * 			   A select box is created based on titles and labels provided.
 * 
 * 	    Required: a unique 'name' attribute for each table, and a 'title' class 
 * 			   applied to a table heading tag for display in the dropdown
 *
 * 		Example:			   
 *		<div widget="tableswap" label="View type:">
 *			<!-- dynamically inserted <p> here --->
 *			<table name="table-id-1">
 *				<tr><th class="title">Type 1</th></tr>
 *				<tr><td>Data1</td><td>Data2</td></tr>
 *			</table>
 *			<table name="table-id-2">
 *				<tr><th class="title">Type 2</th></tr>
 *				<tr><td>Data1</td><td>Data2</td></tr>
 *			</table>
 *		</div>
 */

$.ui.widget.subclass('ui.tableswap', {
    klass: '$.ui.tableswap',
    options: {
		label:		  '',
        maxPlayers:   9,       // {Number}       maximum number of players in list as per design
        hash:         null     // {Hash}         define objects and arrays within the constructor, else it will create a class variable
    },

    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
    },

    // Called from constructor after _create() – automatically calls this._super() before function
   _init: function() {
        //this.doSomething('players to watch init' );
        this.addSelect();
        this.addEvents();
        this.onChange();
    },
   
    addSelect: function (args) {
    	var tables = this.element.find('table[name]');

    	var data = {};
    	for( var i=0, n=tables.length; i<n; i++ ) {
    		var name  = $(tables[i]).attr('name');
    		var title = $('th.title', tables[i]).text();

    		if( title && name ) {
    			data[name] = title;
    		}
    	}
    	
    	var html = "<p class='select'>" + this.options.label + "<select>";
    	for( var name in data ) {
    		var title = data[name]; 
    		html += "<option value='"+name+"'>"+title+"</option>";
    	}
    	html += "</select></p>";
    	
    	this.element.prepend(html);
    	this.select = this.element.find("select");
    },
    
    addEvents: function (args) {
    	$('select',this.element).live('change', $.proxy(this.onChange,this));
    },
    onChange: function() {
		var showClass = this.select.val();
		$('table:not([name='+showClass+'])',this.element).hide();
		$('table[name='+showClass+']',this.element).fadeIn( 400 );    	
    }
});
