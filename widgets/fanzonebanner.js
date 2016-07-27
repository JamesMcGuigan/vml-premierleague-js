/**
 *  <div id="homeSelect">
 *	   <span class="up"></span>
 *	   <span class="down"></span>
 *	</div>
 *	<img class="score home <%=homePrediction%>" alt="" src="<%=designPath%>/images/shim.gif" />
 *	<p class="scoredivider">&ndash;</p>
 *	<img class="score away <%=awayPrediction%>" alt="" src="<%=designPath%>/images/shim.gif" />
 *	<div id="awaySelect">
 *	   <span class="up"></span>
 *	   <span class="down"></span>
 *	</div>
 *
 *  AJAX:
 *  Fanzone Page: Banner Receipt + Information Display
 *  /ajax/fanzone/score/{matchId}/{userId}/{homeScore}/{awayScore}/{homeTeamId}/{awayTeamId}/{userClubId}.json
 *  /ajax/fanzone/score/3329064/{userId}/{homescore}/{awayscore}/42/4/{userClubId}.json
 *  
 *  Other Pages: Banner Receipt + Link to Fanzone
 *  /ajax/fanzone/quick-score/{matchId}/{userId}/{homeScore}/{awayScore}/{homeTeamId}/{awayTeamId}/{userClubId}.json
 *  /ajax/fanzone/quick-score/3329064/{userId}/{homescore}/{awayscore}/42/4/{userClubId}.json
 *  
 *  N.B. Upon ajax success the component fires a tracking code submission for Yahoo
 *  	 Analytics
 * 
 */

$.ui.fanzone.subclass('ui.fanzonebanner', {
    klass: '$.ui.fanzonebanner',
    options: {
		type:			null,	 // {String}	   'quick-score' || 'score'
		fanzoneurl:		null,	 // {String}	   page url for fan-zone tab
		loginurl:		null,	 // {String}	   page url for login
        state:			null,	 // {String} 	   class identifier of form 'state#'
        initial:		0,		 // {Number}	   default for score values
        min:			0,		 // {Number}	   Minimum value for selection
        max:			6		 // {Number}	   Maximum value for selection 6 => 5plus
    },
    required: {
    	fanzoneurl:		String,
    	loginurl:		String,
    	state:			String,
    	type:			String
    },

    create: function() {
        this.options.hash  = {};
        this.options 	   = $.getAttributeHash( this.element, this.options );
    },
   _init: function() {

    	this.el.target 	 	= this.element.find('#banner-receipt');
    	this.el.receipt		= this.element.find('.receipt');
    	this.el.linkButton  = this.element.find('#view');
    	this.el.errorTarget = this.element.find('.text-error');
    	
    	this.el.allstates	= this.element.find('[class^="state"]');
    	this.el.state1		= this.element.find('.state1');
    	this.el.state2		= this.element.find('.state2');
    	this.el.state3		= this.element.find('.state3');
    	this.el.state4		= this.element.find('.state4');
    	
        this.state 		 	= this.options.state;
    	this.type  		 	= this.options.type;
    	this.fanzoneURL  	= this.options.fanzoneurl;
    	
    	this.hideStates();
    	this.addEvents();
    	this.addSpinnerControl('home');
    	this.addSpinnerControl('away');
    },
    addSpinnerControl: function ( team ) {
    	
    	var selectorId   = team + 'Select';
    	var initial 	 = this.options.initial;
    	var interval	 = this.options.interval;
    	var min 		 = this.options.min;
    	var max 		 = this.options.max;
    	var inputControl = $('#'+selectorId+'Input');

        // validate if the object is a input of text type.
        if (!inputControl.is(':text')) { return inputControl; }
        if (inputControl.hasClass('spinnerControl')) { return inputControl; }
        else { inputControl.addClass('spinnerControl'); }

        // create the Spinner Control body.
        var strContainerDiv = '';
        strContainerDiv += '<div id="'+team+'Select">';
        strContainerDiv += '<span class="updown updown_up"></span>';
        strContainerDiv += '<span class="updown updown_down"></span>';
        strContainerDiv += '</div>';
        strContainerDiv += '<img class="valueDisplay score '+team+'" alt="" src="/etc/designs/premierleague/images/shim.gif" />';

        // add the above created control to page
        var objContainerDiv = $(strContainerDiv).insertAfter(inputControl);

        // hide the input control and place within the Spinner Control body
        inputControl.insertAfter($(".valueDisplay." + team)).css('display', 'none');

        // set default value;
        if (initial < min || initial > max) {
            initial = min;
        }
        inputControl.val(initial);
        this.element.find('.valueDisplay.' + team).addClass('predict'+initial);
        
        var selectedValue = initial;

        if ((max - min) > 1) {
            // attach events;
            $("span.updown_up", objContainerDiv).click(function() {
                if ((selectedValue + 1) <= max) {
                	var newClass;
                	var oldClass = 'predict'+selectedValue;
                	selectedValue += 1;
                	if (selectedValue == 6) {
                		selectedValue = '5+';
                		newClass = 'predict5plus';
                	} else {
                		newClass = 'predict'+selectedValue;
                	}
                    $(".valueDisplay." + team).switchClass( oldClass, newClass, 'fast' );
                    inputControl.val(selectedValue);
                }
            });

            $("span.updown_down", objContainerDiv).click(function() {
            	var oldClass;
            	if (selectedValue == '5+') {
            		selectedValue = max;
            		oldClass = 'predict5plus';
            	} else {
            		oldClass = 'predict'+selectedValue;
            	}
                if ((selectedValue - 1) >= min) {
                	selectedValue -= 1;
                    var newClass = 'predict'+selectedValue;
                    $(".valueDisplay." + team).switchClass( oldClass, newClass, 'fast' );
                    inputControl.val(selectedValue);
                }
            });
        };
    },
    hideStates: function () {
    	this.el.allstates.hide();
    	
    	if ( this.options.state === '.state1' ) {
    		this.el.target.hide();
    		// Show either 'login' or 'enter prediction' buttons 
    		if ( this.data.loggedin ) {
    			this.element.find( '#fanzonebanner-login' ).remove();
    			this.element.find( '#fanzonebanner-enter' ).fadeIn();
    		} else {
    			this.element.find( '#fanzonebanner-enter' ).remove();
    			this.element.find( '#fanzonebanner-login' ).fadeIn();
    		}
    	}
    	this.element.find( this.options.state ).show();
    },
    addEvents: function () {
    	var ajax = this.options.ajax;
    	var self = this; // Only use in the ajax call! :(
    	
    	// STATE 1 --> STATE 2
    	this.el.state1.find('#fanzonebanner-enter .submit').bind('click', $.proxy( function() {
    		this.el.state1.fadeOut();
    		this.el.state2.fadeIn();
    	}, this));

		// STATE 2 --> STATE 3
    	this.el.state2.find('.submit').bind('click', $.proxy( function() {
    		
    		this.el.state2.fadeOut();
			/**
			 * Submit Form, Retrieve receipt, alter DOM and display 
			 */
			var data = ajax;
				data = data.replace('{homescore}',  $('#homeSelectInput').val());
				data = data.replace('{awayscore}',  $('#awaySelectInput').val());
				data = data.replace('{userId}',     this.data.userId);
				data = data.replace('{userClubId}', this.data.teamId);

			$.ajax({
				type:  "GET",
                url:   data,
                cache: false,
                dataType: "json",
                beforeSend: function( xhr ) {
                },
                success: function( json, xhr, status ) {
                	self.render( json );
                	self.doTracking( "17", "03" );	// TRACKING
                },
                error: function( xhr, status, error ) {
			    	self.renderError( xhr.status, error );
	            }
			});
			//cancel the submit button default behaviours
			return false;
		}, this ) );
    },
    render: function ( json ) {
    	
    	var bannerPercentage = "";
    	var self = this;
    	
    	if (!json.exception) {
	    	
    		if ( this.type === "quick-score" && json.fanZoneScorePredictionShortReceipt) {
	        	// Short Receipt Data
	        	bannerPercentage = json.fanZoneScorePredictionShortReceipt.percentageSameFanGroupPredictedSameScore;
	        	this.el.receipt.html(bannerPercentage+"% of "+this.data.fanGroup+" fans predicted the same score");
	    		this.el.linkButton.attr("href", this.fanzoneURL);
	    		
	    		/****************TEMP DO NOT DISPLAY LINK******************/
	    		this.el.linkButton.remove();
	    	
    		} else if (this.type === "score" && json.fanZoneScorePredictionLongReceipt) {

    			json = json.fanZoneScorePredictionLongReceipt;
    			
	    		// Short Receipt Data for Banner
	    		bannerPercentage = json.percentageFansPredictedSameScore;
	    		this.el.receipt.html(bannerPercentage+"% of "+this.data.fanGroup+" fans predicted the same score");
	    		
	    		// Extended Receipt
	    		var display 		= {}; // Overall display view
	    		
	    		var popularHome 	= {}; // Home supporter scores
	    		var popularNeutral 	= {}; // Neutral supporter scores
	    		var popularAway 	= {}; // Away supporter scores
	    		
	    		var votedHome		= {}; // Home supporter W/D/L breakdown
	    		var votedNeutral	= {}; // Neutral supporter W/D/L breakdown
	    		var votedAway		= {}; // Away supporter W/D/L breakdown
	    		
	    		if ( o = json.modeScorePredictionOverall ) {
		    		display.home 		= (o.homeScore == '5+') ? 'predict5plus' : 'predict'+o.homeScore;
		    		display.away 		= (o.awayScore == '5+') ? 'predict5plus' : 'predict'+o.awayScore;
	    		}
	    		if ( h = json.modeScorePredictionHomeFans ) {
	    			popularHome.home	= (h.homeScore == '5+') ? 'predict5plus' : 'predict'+h.homeScore;
	    			popularHome.away	= (h.awayScore == '5+') ? 'predict5plus' : 'predict'+h.awayScore;
	    		}
	    		if ( n = json.modeScorePredictionNeutralFans ) {
	    			popularNeutral.home	= (n.homeScore == '5+') ? 'predict5plus' : 'predict'+n.homeScore;
	    			popularNeutral.away	= (n.awayScore == '5+') ? 'predict5plus' : 'predict'+n.awayScore;
	    		}
	    		if ( a = json.modeScorePredictionAwayFans ) {
	    			popularAway.home	= (a.homeScore == '5+') ? 'predict5plus' : 'predict'+a.homeScore;
	    			popularAway.away	= (a.awayScore == '5+') ? 'predict5plus' : 'predict'+a.awayScore;
	    		}
	    		if ( hb = json.homeFansScorePredictionsBreakdown ) {
		    		votedHome.Hwin		= hb.percentagePredictedHomeWin+'%';
		    		votedHome.draw		= hb.percentagePredictedDraw+'%';
		    		votedHome.Awin		= hb.percentagePredictedAwayWin+'%';
	    		}
	    		if ( nb = json.neutralFansScorePredictionsBreakdown ) {
		    		votedNeutral.Hwin	= nb.percentagePredictedHomeWin+'%';
		    		votedNeutral.draw	= nb.percentagePredictedDraw+'%';
		    		votedNeutral.Awin	= nb.percentagePredictedAwayWin+'%';
	    		}
	    		if ( ab = json.awayFansScorePredictionsBreakdown ) {
		    		votedAway.Hwin		= ab.percentagePredictedHomeWin+'%';
		    		votedAway.draw		= ab.percentagePredictedDraw+'%';
		    		votedAway.Awin		= ab.percentagePredictedAwayWin+'%';
	    		}
	    		
	    		// Set Overall display image classes
	    		this.el.target.find('.display .prediction.home .score.home').addClass(display.home);
	    		this.el.target.find('.display .prediction.away .score.away').addClass(display.away);
	    		
	    		// Set Popular Predictions display image classes
	    		this.el.target.find('.popularpredictions .fans.home .score.home').addClass(popularHome.home);
	    		this.el.target.find('.popularpredictions .fans.home .score.away').addClass(popularHome.away);
	    		this.el.target.find('.popularpredictions .fans.neutral .score.home').addClass(popularNeutral.home);
	    		this.el.target.find('.popularpredictions .fans.neutral .score.away').addClass(popularNeutral.away);
	    		this.el.target.find('.popularpredictions .fans.away .score.home').addClass(popularAway.home);
	    		this.el.target.find('.popularpredictions .fans.away .score.away').addClass(popularAway.away);
	    		
	    		// Set How Fans Voted table
	    		this.el.target.find('.howfansvoted .hWin' ).html(votedHome.Hwin);
	    		this.el.target.find('.howfansvoted .hDraw').html(votedHome.draw);
	    		this.el.target.find('.howfansvoted .hLoss').html(votedHome.Awin);
	    		this.el.target.find('.howfansvoted .nWin' ).html(votedNeutral.Hwin);
	    		this.el.target.find('.howfansvoted .nDraw').html(votedNeutral.draw);
	    		this.el.target.find('.howfansvoted .nLoss').html(votedNeutral.Awin);
	    		this.el.target.find('.howfansvoted .aWin' ).html(votedAway.Hwin);
	    		this.el.target.find('.howfansvoted .aDraw').html(votedAway.draw);
	    		this.el.target.find('.howfansvoted .aLoss').html(votedAway.Awin);
	    		
	    		// Remove pesky display button, init SVG and just show it!
	    		this.el.linkButton.remove();
	    		
	    		/**
	    		 * Clunky cleaning up for pie charts
	    		 * 
	    		 * find the wrapper, 
	    		 * take out the table, 
	    		 * remove the wrapper, 
	    		 * re-wrap the table,
	    		 * add the widgets to the rows (not added in the JSP)
	    		 * and then initialise the widgets again...
	    		 */ 
    			var svgWrapper = self.el.target.find('.howfansvoted .svg-wrapper');	//find
    			self.el.target.find('table').insertAfter(svgWrapper);				//take out
    			svgWrapper.remove(); 												//remove		
    			self.el.target.find('table').wrap('<div widget="svgWrapper" svgheight="220" svgwidth="710" />'); //re-wrap
    			self.el.target.find('tr').attr('widget','svgPieChart');				//add widgets				
        		$.initWidgets( self.el.target );									//init widgets
	    		this.el.target.slideDown('fast');
	    	}
    	} else {
	        // Receipt Error Text - Should not reach this point 
	        this.el.receipt.html("There was an error submitting your prediction");
        	this.el.linkButton.remove();
	    }
    	// Show receipt
    	this.el.state3.fadeIn();
    },
    renderError: function ( status, json ) {
    	
    	var results	= this.el.linkButton.remove();

    	switch ( status ) {
    	
    	case 404:
    		this.el.receipt.html('<p class="data-error">There was an error submitting your prediction:<br/>Not found</p><!--404-->');
    		break;
    	case 400:
    		this.el.receipt.html('<p class="data-error">There was an error submitting your prediction:<br/>Please try again later</p><!--400-->');
    		break;
    	case 403:
    		this.el.receipt.html('<p class="data-error">There was an error submitting your prediction:<br/>No submissions allowed</p><!--403-->');
    		break;
    	case 409:
    		this.el.receipt.html('<p class="data-error">There was an error submitting your prediction:<br/>You have already submitted</p><!--409-->');
    		break;
    	case 401:
    		this.el.receipt.html('<p class="data-error">There was an error submitting your prediction:<br/>Unauthorised. Please log in.</p><!--403-->');
    		break;
    	case 500:
    		this.el.receipt.html('<p class="data-error">There was a server error submitting your prediction</p><!--500-->');
    		break;
    	default:
    		this.el.receipt.html('<p class="data-error">There was a server error submitting your prediction</p>');
    	
    	}
    	// Re-render target
    	this.el.state3.fadeIn();
    }
});
