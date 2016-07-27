$.ui.basewidget.subclass('ui.playerSearch_headToHead', {
    klass: '$.ui.playerindex',
    options: {
        baselogo:       '/etc/designs/premierleague/images/backgrounds/player-h2h-blank.png',        // {String}       location of image for unselected club logo
        eventManager:   null,       // {EventManager} reference to js/libs/EventManager.js, passed in via init.js
        hash:           null        // {Hash}         define objects and arrays within the constructor, else it will create a class variable
    },

    // Called from constructor before _init() – automatically calls this._super() before function
   _create: function() { 
        this.options.hash = {};
        this.options = $.getAttributeHash( this.element, this.options );
    },

    // Called from constructor after _create() – automatically calls this._super() before function
    _init: function() {
		this.addEvents();
        this.displayPlayerNamesInStats();
		this.displayCompareButton();
        //this.moveToHero();
    },
    displayPlayerNamesInStats: function(){
    	//updates the player names above the stats table
    	if($('#clubAField').val()!= '' && $('#clubBField').val() != ''){
    		$('#lhsPlayerName').text($('#clubAName').val());
    		$('#rhsPlayerName').text($('#clubBName').val());
    	}
    	
    },
    addEvents: function() {
        var self = this;
		
		//$('td.selector',this.element).each(function(){
        $('td.selector').each(function(){
            $t          			= $(this);
			var name    			= $t.attr('name');
            var logoRef 			= $t.attr('logo');
            var paId    			= $t.attr('paid');
			var teamId 				= $t.attr('teamid');
			var teamName 			= $t.attr('teamid');
			var playerNationality 	= $t.attr('nationality');
			var playerNationalityImg = $t.attr('nationality_flag');
			console.log('playerNationalityImg: ' + playerNationalityImg);
			var playerPosition 		= $t.attr('playerposition');
			var playerShirtNumber 	= $t.attr('playershirtnumber');
			var clubLogoSrc			= $t.attr('clubLogo');
            
            var submit  = $('input [type=submit]', self.element);
			
            var left          			= {};
                left.logo     			= $('#left-club img.logo');
                left.overlay  			= $('#left-club img.overlay');
                left.txt      			= $('#left-club p.playerName');
                left.input    			= $('#clubAField');
				left.teamName			= $('#left-club p.clubName'); //Needs to pull in img url
				left.nationality		= $('#left-club p.nationalityTxt span');
				left.nationalityImg		= $('#left-club .playerHeadToHeadHeroNationalFlag');
				left.playerPosition		= $('#left-club p.playerPosition');
				left.playerSquadNumber	= $('#left-club p.squadNumber');
			
				left.playerNameHidden	= $('#clubAName');
				left.changePlayer 		= $('#changePlayerLhs');
				left.clubLogo			= $('#lhsClubLogo');
				 
            var right         			= {};
                right.logo    			= $('#right-club img.logo');
                right.overlay 			= $('#right-club img.overlay');
                right.txt     			= $('#right-club p.playerName');
                right.input   			= $('#clubBField');
				right.teamName			= $('#right-club p.clubName');
				right.nationality		= $('#right-club p.nationalityTxt span');
				right.nationalityImg	= $('#right-club .playerHeadToHeadHeroNationalFlag');
				right.playerPosition	= $('#right-club p.playerPosition');
				right.playerSquadNumber	= $('#right-club p.squadNumber');

				right.playerNameHidden	= $('#clubBName');
				right.changePlayer 		= $('#changePlayerRhs');
				right.clubLogo			= $('#rhsClubLogo');

				$t.click(function(){
				
					if( (parseInt($('#clubAField').val()) !=0) && (parseInt($('#clubBField').val()) !=0)){
						bothFieldsPopulated=true;
						//show the compare button
						$('.compareButtonDiv').css('display','block');
					}
					else{
						bothFieldsPopulated=false;
					}

					if($(this).hasClass('plus-sign')){
						//add player data	
						if(left.txt.text().length>0 && bothFieldsPopulated == false){
							//the left data is there so set the right data
							$(this).removeClass( 'plus-sign' ).addClass( 'minus-sign' );
							//update the text 
							right.txt.text(name);
							$('#clubBName').val(name);
							right.input.val(paId);
							right.clubLogo.attr("src",clubLogoSrc);
							
							right.nationality.text(playerNationality);
							right.nationalityImg.attr("src",playerNationalityImg);
							
							right.playerPosition.text(playerPosition);
							right.playerSquadNumber.text(playerShirtNumber);
							
							//fade the new player images
							right.overlay.fadeOut();
							right.logo
								.fadeOut()
								.attr('src', logoRef)
								.attr('club-id', paId)
								.fadeIn(300);
							right.overlay.fadeIn(800);
															
							//prepare the url string and compare button
							var urlString = "/content/premierleague/en-gb/players/head-to-head.html?paramLhsComparePlayerId=" + $('#clubAField').val() + "&paramRhsComparePlayerId=" + $('#clubBField').val() + '&paramLhsComparePlayerName=' + $('#clubAName').val()+ '&paramRhsComparePlayerName=' + $('#clubBName').val();
							$('#compareLink').attr("href", urlString);
							document.getElementById('changePlayerRhs').style.display='block';
							$('.compareButtonDiv').css('display','block');
						}
						else if(bothFieldsPopulated==false){
							//no data in yet so set the left data
							$(this).removeClass( 'plus-sign' ).addClass( 'minus-sign' );
							left.txt.text(name);
							left.playerNameHidden.val(name);
							$('#clubAName').val(name);
							left.input.val(paId);
							left.clubLogo.attr('src',clubLogoSrc);
							
							//left.nationality.text(playerNationality);
							left.nationality.text(playerNationality);
							console.log('playerNationalityImg - left data : ' + playerNationalityImg);
							left.nationalityImg.attr("src",playerNationalityImg);
							
							left.playerPosition.text(playerPosition);
							left.playerSquadNumber.text(playerShirtNumber);
							
							left.overlay.fadeOut();
							left.logo
								.fadeOut()
								.attr('src', logoRef)
								.attr('club-id', paId)
								.fadeIn(300);
							left.overlay.fadeIn(800);
							//prepare the url string and compare button
							var urlString = "/content/premierleague/en-gb/players/head-to-head.html?paramLhsComparePlayerId=" + $('#clubAField').val() + "&paramRhsComparePlayerId=" + $('#clubBField').val() + '&paramLhsComparePlayerName=' + $('#clubAName').val()+ '&paramRhsComparePlayerName=' + $('#clubBName').val();
							$('#compareLink').attr("href", urlString);
							document.getElementById('changePlayerLhs').style.display='block';
						}
					}
					else{ 
						//remove player data on LHS
						if($('#clubAField').val() == paId){
							//remove data
							left.txt.text('');
							left.input.val('');
							left.teamName.text('');
							left.clubLogo.attr('src','');
							left.playerPosition.text('');
							left.nationality.text('');
							left.playerSquadNumber.text('');
							
							$('#clubAField').val(0);
							$('#clubAName').val('');
							
							left.overlay.fadeOut();
							left.logo
								.fadeOut()
								.attr('src', self.options.baselogo)
								.attr('club-id', '')
								.fadeIn();
							left.overlay.fadeIn(800);
							//hide the change player button
							left.changePlayer.css('display','none');
						}
						else{
							//remove data on RHS
							right.txt.text('');
							right.input.val('');
							right.teamName.text('');
							right.clubLogo.attr('src','');
							
							right.playerPosition.text('');
							right.nationality.text('');
							right.playerSquadNumber.text('');
							$('#clubBField').val(0);
							$('#clubBName').val();
							
							right.overlay.fadeOut();
							right.logo
								.fadeOut()
								.attr('src', self.options.baselogo)
								.attr('club-id', '')
								.fadeIn();
							right.overlay.fadeIn(800);
							right.txt.text('');
							
							//hide the change player button
							right.changePlayer.css('display','none');
						}
						//reset CSS styles
						$(this).removeClass( 'minus-sign' ).addClass( 'plus-sign' );
						
						//check to see if both players have been de-selected and hide the Compare Button
						if($('#clubAField').val()==0 && $('#clubBField').val()==0 ){
							$('.compareButtonDiv').css('display','none');
						}
					}
				//finally double check the LHS and RHS and display the compare button if both have been set
				if( (parseInt($('#clubAField').val()) !=0) && (parseInt($('#clubBField').val()) !=0)){
					//show the compare button
					$('.compareButtonDiv').css('display','block');
				}
            });
        });
    },
    moveToHero: function() {
        //$('.svg-wrapper').empty();
        //$.initWidgets($('#playerStatsTabs', this.element));
    	//$.initWidgets($('.tabs', this.element));
/*
    	var clubindex = '<div class="clubindex" />';
        $('.headimage',        this.element).appendTo('.hero').wrap( clubindex );
        $('.tabnav-container', this.element).appendTo('.hero').wrap( clubindex );
*/		
    },
	displayCompareButton: function() {
		if($('#clubAField').val()>0 && $('#clubBField').val()>0 ){
			$('.compareButtonDiv').css('display','block');
		}
	}
	
    
});

//called by the change player button on either LHS or RHS 
function changePlayer(whichSide){
			
			var baseLogo = "/etc/designs/premierleague/images/backgrounds/player-h2h-blank.png";
			
            var left          			= {};
                left.logo     			= $('#left-club img.logo');
                left.overlay  			= $('#left-club img.overlay');
                left.txt      			= $('#left-club p.playerName');
                left.input    			= $('#clubAField');
				//left.teamId				= $('#left-club p.teamId');
				left.teamName			= $('#left-club p.clubName'); //Needs to pull in img url
				left.nationality		= $('#left-club p.nationalityTxt');
				//left.nationalityImg		= $('#left-club p.nationalityTxt img');
				//national logo
				left.playerPosition		= $('#left-club p.playerPosition');
				left.playerSquadNumber	= $('#left-club p.squadNumber');
			
				left.playerNameHidden	= $('#clubAName');
				 
            var right         			= {};
                right.logo    			= $('#right-club img.logo');
                right.overlay 			= $('#right-club img.overlay');
                right.txt     			= $('#right-club p.playerName');
                right.input   			= $('#clubBField');
				//right.teamId			= $('#right-club p.teamId');
				right.teamName			= $('#right-club p.clubName');
				right.nationality		= $('#right-club p.nationalityTxt');
				//right.nationalityImg	= $('#right-club p.nationalityImg img');
				right.playerPosition	= $('#right-club p.playerPosition');
				right.playerSquadNumber	= $('#right-club p.squadNumber');

				right.playerNameHidden	= $('#clubBName');


	if(whichSide=='left'){
	/*
		left.txt.text('');
		left.input.val('');
		left.teamName.text('');
		left.playerPosition.text('');
		left.nationality.text('');
		left.playerSquadNumber.text('');
		
		left.nationality.text('');
		left.nationalityImg.attr('src','');
		
		$('#clubAField').val(0);
		$('#clubAName').val('');
/*		
		left.overlay.fadeOut();
		left.logo
			.fadeOut()
			.attr('src', baseLogo)
			.attr('club-id', '')
			.fadeIn();
		left.overlay.fadeIn(800);
		
		document.getElementById('changePlayerLhs').style.display='none';
		$('.compareButtonDiv').attr('display','none');
*/		
		
		//reload the page
		if($('#clubBField').val() != 0){
			var urlString = "/content/premierleague/en-gb/players/head-to-head.html?paramRhsComparePlayerId=" + $('#clubBField').val() + '&paramRhsComparePlayerName=' + $('#clubBName').val();		
		}
		else{
			var urlString = "/content/premierleague/en-gb/players/head-to-head.html";
		}
		window.location.href=urlString;
	}
	else{
	/*
		right.txt.text('');
		right.input.val('');
		right.teamName.text('');
		right.playerPosition.text('');
		right.nationality.text('');
		
		right.nationalityImg.attr('src','');
		
		right.playerSquadNumber.text('');
		$('#clubBField').val(0);
		$('#clubBName').val('');
/*		
		right.overlay.fadeOut();
		right.logo
			.fadeOut()
			.attr('src', baseLogo)
			.attr('club-id', '')
			.fadeIn();
		right.overlay.fadeIn(800);
		right.txt.text('');	

		document.getElementById('changePlayerRhs').style.display='none';
		$('.compareButtonDiv').attr('display','none');
*/
		//reload the page
		if($('#clubAField').val() != 0){
			var urlString = "/content/premierleague/en-gb/players/head-to-head.html?paramLhsComparePlayerId=" + $('#clubAField').val() + '&paramLhsComparePlayerName=' + $('#clubAName').val();		
		}	
		else{
			var urlString = "/content/premierleague/en-gb/players/head-to-head.html";
		}
		window.location.href=urlString;
	}
}

