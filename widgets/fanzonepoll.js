/**
 *  AJAX:
 *  pollType: 'vote'
 *  /fanzone/vote/{matchId}/{userId}/{input}/{userClubId}.json
 *  /fanzone/vote/3329064/135/{input}/1006.json
 *  
 *  pollType: 'team-vote'
 *  /fanzone/team-vote/{matchId}/{userId}/{input}/{homeClubId}/{awayClubId}/{userClubId}.json
 *  /fanzone/team-vote/3329064/135/{input}/1006/4/1006.json
 * 
 */

$.ui.fanzone.subclass('ui.fanzonepoll', {
    klass: '$.ui.fanzonepoll',
    options: {
        type:           null    // {String}       'team-vote' || 'vote'
    },
    required: {
        type:           String
    },
    create: function() {
        this.options.hash  = {};
        this.options       = $.getAttributeHash( this.element, this.options );
    },
    _init: function() {

    	this.el.inputs = this.element.find('input');
        this.el.submit = this.el.inputs.filter('[type=submit]');
    	this.el.target = this.element.find('#fanzonepoll-result');
    	this.type      = this.options.type;

    	// Show either 'login' or 'submit' buttons 
		if ( this.data.loggedin ) {
			this.element.find( '#fanzonepoll-login'  ).remove();
			this.element.find( '#fanzonepoll-submit' ).fadeIn();
		} else {
			this.el.inputs.attr('disabled', 'disabled');
			this.element.find( '#fanzonepoll-submit' ).remove();
			this.element.find( '#fanzonepoll-login'  ).fadeIn();
		}
        if (this.options.ajax) {
        	this.el.legend.hide();
        	this.addClubInfo(); //_super()
        	this.el.target.hide();
        	this.addEvents();
        }
    },
    addEvents: function() {
        var self = this;
        var ajax = this.options.ajax;
        
        this.el.submit.bind('click', $.proxy( function () {
        	// Input check!
        	this.el.value = this.el.inputs.filter(':radio[name=answer]:checked').val();
        	if ( this.el.value ) {
	        	// Remove button
        		this.el.submit.fadeOut();
	            
	            // Workaround for nice removal of inputs
        		this.element.find('tr#inputs input').slideUp();
        		this.element.find('tr#inputs td'   ).css('padding','0');
	        	
	        	// Add selection to ajax string
	            var data = ajax;
	                data = data.replace('{input}',  	this.el.value);
	                data = data.replace('{userId}',     this.data.userId);
	                data = data.replace('{userClubId}', this.data.teamId);
	
	            // Submit Form, Retrieve receipt, call render()
	            $.ajax({
				    type: "GET",
				    url:  data,
				    cache: false,
				    dataType: "json",
				    beforeSend: function( xhr ) {
				    },
				    success: function( json, xhr, status ) {
				        self.render( json, self.type );
				    },
				    error: function( xhr, status, error ) {
				    	self.renderError( xhr.status, error );
		            }
				});
        	} //else do nothing
        	
            // Cancel the submit button default behaviours
            return false;
        }, this ) );// proxy
    },
    render: function( json, polltype ) {
    	// Target <div id="fanzonepoll-result"> element
    	if (!json.exception) {

        	// Remove unneeded result tables
    		this.el.target.find('table:not(.'+polltype+')').remove();
        		
            if ( polltype == "team-vote" && json.fanZoneVoteTeamReceipt) {

            	// Set floating span for yourAnswer == X.answer
                var spanBox = '<span class="yourAnswer" style="background:'+this.options.yourcolor+'"></span>';
            	
            	// Receipt Data
            	var home 			= {}; 
            	var away 			= {}; 
            	var neutral 		= {};
                var yourAnswer			= json.fanZoneVoteTeamReceipt.yourAnswer; 						// 2
                	home.answer			= json.fanZoneVoteTeamReceipt.homeFansModeAnswer; 				// 2
                	home.percentage		= json.fanZoneVoteTeamReceipt.percentageHomeFansModeAnswer; 	// 33
                	neutral.answer 		= json.fanZoneVoteTeamReceipt.neutralFansModeAnswer; 			// 3
                	neutral.percentage	= json.fanZoneVoteTeamReceipt.percentageNeutralFansModeAnswer; 	// 42
                	away.answer			= json.fanZoneVoteTeamReceipt.awayFansModeAnswer; 				// 5
                	away.percentage		= json.fanZoneVoteTeamReceipt.percentageAwayFansModeAnswer; 	// 65

            	// Target Table Cells
            	this.el.homeTarget		= this.el.target.find('.home .result' + home.answer);
            	this.el.awayTarget		= this.el.target.find('.away .result' + away.answer);
            	this.el.neutralTarget	= this.el.target.find('.neutral .result' + neutral.answer);
            	this.el.yourTarget		= this.el.target.find('.'+this.data.fanGroup+' .result' + yourAnswer);

            	this.el.homeTarget.css({'background' : this.options.homecolor})
                		  .html(home.percentage    + "%");
            	this.el.awayTarget.css({'background' : this.options.awaycolor})
                		  .html(away.percentage    + "%");
            	this.el.neutralTarget.css({'background' : this.options.neutralcolor})
                		  .html(neutral.percentage + "%");
                
                // Set yourAnswer
                switch ( this.data.teamId ) {
	                case this.options.homeId:
	                	if ( home.answer == yourAnswer ) {
	                		this.el.homeTarget.html(spanBox+home.percentage+"%");
	                	} else {
	                		this.el.yourTarget.css({'background' : this.options.yourcolor});
	                	}
	                	break;
	                case this.options.awayId:
	                	if ( away.answer == yourAnswer ) {
	                		this.el.awayTarget.html(spanBox+away.percentage+"%");
	                	} else {
	                		this.el.yourTarget.css({'background' : this.options.yourcolor});
	                	}
	                	break;
	                default: //neutral
	                	if ( neutral.answer == yourAnswer) {
	                		this.el.neutralTarget.html(spanBox+neutral.percentage+"%");
	                	} else {
	                		this.el.yourTarget.css({'background' : this.options.yourcolor});
	                	}
	                	break;
                }                
                
                // Move to after options and slideDown
                this.el.target.slideDown();
                this.el.legend.fadeIn();
                
            } else if ( polltype === "vote" && json.fanZoneVoteSimpleReceipt) {
            	this.el.target.show();
                var	answer 		= {}; 
                	answer.your	= json.fanZoneVoteSimpleReceipt.yourAnswer; 				// 2
                	answer.a1	= json.fanZoneVoteSimpleReceipt.percentageVotedForAnswer1; 	// 10
                	answer.a2	= json.fanZoneVoteSimpleReceipt.percentageVotedForAnswer2; 	// 40
                	answer.a3	= json.fanZoneVoteSimpleReceipt.percentageVotedForAnswer3; 	// 20
                	answer.a4	= json.fanZoneVoteSimpleReceipt.percentageVotedForAnswer4; 	// 20
                	answer.a5	= json.fanZoneVoteSimpleReceipt.percentageVotedForAnswer5; 	// 10
            	
                this.el.target.find('.result1').text(answer.a1+"%");
                this.el.target.find('.result2').text(answer.a2+"%");
                this.el.target.find('.result3').text(answer.a3+"%");
                this.el.target.find('.result4').text(answer.a4+"%");
                this.el.target.find('.result5').text(answer.a5+"%");
                
                this.el.target.find('.result'+answer.your).attr({
                	'color' : this.options.yourcolor
                });
                
                // Add widget data to table
                this.el.target.find('table').attr({
            		'widget': 		'svgBarChart',
            		'svgheight': 	'180',
            		'svgwidth':		'710',
            		'showcollabel':	'false',
            		'barSpacing':	'1',
            		'barHeight':	'150'
            	});
                
            	// Initial SVG widget
            	$.initWidgets('table', this.element);
            	
            	// Show target with slideDown
            	this.el.target.hide().slideDown();
            	this.el.legend.fadeIn();
            }
        } else {
            // Receipt Error Text
        	this.el.target.empty().html('<p class="data-error">There was an error submitting your opinion</p>');
            // Move to after options and slideDown
        	this.el.target.insertAfter(this.element).slideDown();
        }
    },
    renderError: function( status, json ) {
    	
    	// Hide target to render error
    	this.el.target.fadeOut().empty();
    	
    	switch ( status ) {
    	case 404:
    		this.el.target.html('<p class="data-error">There was an error submitting your prediction:<br/>Not found</p><!--404-->');
    		break;
    	case 400:
    		this.el.target.html('<p class="data-error">There was an error submitting your prediction:<br/>Please try again later</p><!--400-->');
    		break;
    	case 403:
    		this.el.target.html('<p class="data-error">There was an error submitting your prediction:<br/>No submissions allowed</p><!--403-->');
    		break;
    	case 409:
    		this.el.target.html('<p class="data-error">There was an error submitting your prediction:<br/>You have already submitted</p><!--409-->');
    		break;
    	case 401:
    		this.el.target.html('<p class="data-error">There was an error submitting your prediction:<br/>Unauthorised. Please log in.</p><!--403-->');
    		break;
    	case 500:
    		this.el.target.html('<p class="data-error">There was a server error submitting your prediction</p><!--500-->');
    		break;
    	default:
    		this.el.target.html('<p class="data-error">There was a server error submitting your prediction</p>');
    	}

    	// Re-render target
    	this.el.target.fadeIn();
    }
    
    
});
