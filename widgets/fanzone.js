/**
 * $.ui.fanzone
 * 
 * 		Base fanzone widget functionality, ensuring all widgets made for 
 * 		fanzone provide an ajax URL to submit to and provide error-handling 
 * 		functionality in the case of failure.
 * 
 *  <h3 class="question noborder">
 *	    <%=question%>
 *		<span class="club">
 *		<!-- Inserted by Javascript -->
 *	        <img src="<%=userClubLogo%>" alt="<%=userClubName%>" />
 *	        <%=userClubName%>
 *      <!-- Inserted by Javascript -->
 *      </span>
 *	</h3>
 *   
 */

$.ui.basewidget.subclass('ui.fanzone', {
    klass: '$.ui.fanzone',
    options: {
        ajax:           null,    	 // {String}       ajax URL for the given match
        homeId:			null,	 	 // {Number}	   paId of home team
        awayId:			null,	 	 // {Number}	   paId of away team
        homecolor:	   '#d5302a',    // {Hex}		   Home team fans cell background colour
        awaycolor:	   '#202986',	 // {Hex}		   Away team fans cell background colour
        neutralcolor:  '#999999',	 // {Hex}		   Neutral fans cell background colour
        yourcolor:	   '#00b8f1',	 // {Hex}		   Your input cell background colour
        logoSize:	    23,		 	 // {Number}	   club logo size for fanzone components
        tracking:		null		 // {String}	   clubA-vs-clubB suffix for tracking
    },
    required: {
        ajax:           String
    },
   _create: function() {
        this.options.hash  = {};
        this.options       = $.getAttributeHash( this.element, this.options );
        
        this.options.tracking = this.options.tracking || "";

        this.data.loggedin = false;
        this.data.teamName = null;
        this.data.teamLogo = null;
        this.data.fanGroup = 'neutral';
    },
   _init: function() {
    	this.el.legend 	 = this.element.find('ul.legend');
    	this.el.faveClub = this.element.find('span.club');
    	
    	this.getLogin();
    },
    getLogin: function() {
    	try {
    		this.data.userId   = window.userObject.user.id;
    		this.data.teamId   = window.userObject.user.faveClubCode;
        	if (this.data.teamId === this.options.homeId) { this.data.fanGroup = 'home'; }
        	if (this.data.teamId === this.options.awayId) { this.data.fanGroup = 'away'; }
    		this.data.loggedin = true;
    	} catch (error) {
    		//console.error(this.klass+":getLogin(): Invalid user object:" + window.userObject, " - this: ", this );
    	}
    },
    addClubInfo: function() {
    	if (this.data.teamId) {
	    	// Form AJAX url specifically for user's team
	    	var ajax = '/ajax/club/' + this.data.teamId + '.json';
	    	// Quite hardcoded, with the expectation that club logo location is not going to change
	    	var logo = '/content/dam/premierleague/shared-images/clubs/{initial}/{club}/logo.png'
	    				+ '/_jcr_content/renditions/cq5dam.thumbnail.'
	    				+ this.options.logoSize 
	    				+ '.'
	    				+ this.options.logoSize 
	    				+'.png';
	
	    	var self = this;
	    	$.ajax({
				type:  	    "GET",
	            url:   	    ajax,
	            cache: 	    true,
	            dataType:   "json",
	            beforeSend: function( xhr ) {
	            },
	            success: function( json, xhr, status ) {
	            	try {
	            		if (json.atomicClub) {
			            	//Getting team name is simples
			            	self.data.teamName = json.atomicClub.clubShortName;
			            	//Getting logo needs a bit of manipulation and replacing
			            	var cmsAlias = json.atomicClub.cmsAlias[0];
			            	self.data.teamLogo = logo
			            		.replace('{initial}', cmsAlias.charAt(0))
			            		.replace('{club}',	  cmsAlias);
			            	// Check we have everything needed, target, name and logo!
			            	if ( self.el.faveClub && self.data.teamName && self.data.teamLogo ) {
			            		self.el.faveClub.html('<img src="' + self.data.teamLogo + '" alt="' 
			            				+ self.data.teamName + '" />' + self.data.teamName);
			            		
			            		// Show club info
			            		self.el.faveClub.fadeIn();
			            	}
	            		}
	            	} catch (error) {
	            		console.error(this.klass+":getFaveClub(): No clubShortName or cmsAlias in:" + json, " - this: ", this );
	            	}
	            },
	            error: function( xhr, status, error ) {
	            	console.error(this.klass+":getFaveClub(): ajax error:" + xhr.status, " - this: ", this );
	            }
			});
    	}
    },
    doTracking: function ( cfVal, actionVal ) {
    	
    	window.YWABeacon
    		.trigger("YWAEvent:track",["cf", cfVal, this.options.tracking])
    		.trigger("YWAEvent:track",["action", actionVal])
	        .trigger("YWAEvent:track",["submit"]);
    	
    }
});
