var Chances = {
		currentPage:0,
		activeTiles:0,
		activePages:0,
		map:null,
		currentInfoBox:[]
};

Chances.updateList = function (){
		// @TODO: Data bind instead
		$('.chances-boxes div').removeClass('result');
		
		var selectedSeason = "season_" + $('#chances-seasons').val();  
		
		/* the OR logic */
		$(':checkbox:checked').each(function(){
			$('.chances-boxes div.chance-box.' + selectedSeason + '.' + $(this).val()).addClass('result');
		});
		
		/* the AND logic
		 $('#category-filter input:checkbox:checked').each(function() {
			var catVal = $(this).val();
			$('#topic-filter input:checkbox:checked').each(function() {
				var topicVal = $(this).val();
				$('.chances-boxes div.' + selectedSeason + '.' + catVal + '.' + topicVal).addClass('result');
			});
		});
		*/
		
		// Rebuild the pagination
		Chances.buildPagination();
};
	
Chances.buildPagination = function() {
		$('.chances-boxes div').hide();
		$('.chances-boxes div.result').show();
		
		Chances.activeTiles = $('.chances-boxes div.result').size();
		Chances.activePages = Math.ceil(Chances.activeTiles / 8);
		
		if(Chances.activeTiles > 8){
			$('.paging-links ul li').remove();
			$('.paging-links ul').append('<li><a href="#" class="begin">&laquo;</a></li>');
			$('.paging-links ul').append('<li><a href="#" class="prev">Prev</a></li>');
			
			/* Run through the list */
			for(var i = 0; i < Chances.activePages; i++){
				$('.paging-links ul').append('<li><a href="#" class="num">' + (i + 1) + '</a></li>');
				if(i === 0) {
					$('.paging-links ul li a:last').addClass('current');
				}
			}
			
			$('.paging-links ul').append('<li><a href="#" class="next">Next</a></li>');
			$('.paging-links ul').append('<li><a href="#" class="end">&raquo;</a></li>');
			
			
			$('.paging-links').show();
		} else {
			$('.paging-links').hide();
		}
		
		/* Bind pagination links */
		Chances.bindLinks();
};
	
Chances.bindLinks = function (){
		/* Reset page count and position and current link */
		Chances.currentPage = 1;
		$('.chances-boxes ul').stop(true, true).animate({top: 0});

		$('.paging-links a').click(function(){
			if($(this).hasClass('begin')){	// Scroll to the beginning
				Chances.currentPage = 1;
				$('.chances-boxes ul').stop(true, true).animate({top: 0});
			} else if ($(this).hasClass('end')){	// Scroll to the end
				Chances.currentPage = Chances.activePages;
				$('.chances-boxes ul').stop(true, true).animate({top: '-' + ((Chances.activePages - 1) * 380)});
			} else if ($(this).hasClass('prev')){	// Scroll prev page
				if(Chances.currentPage != 1){
					$('.chances-boxes ul').stop(true, true).animate({top: '+=380'});
					Chances.currentPage = Chances.currentPage-1;
				}
			} else if ($(this).hasClass('next')){	// Scroll next page
				if(Chances.currentPage != Chances.activePages){
					$('.chances-boxes ul').stop(true, true).animate({top: '-=380'});
					Chances.currentPage = Chances.currentPage + 1;
				}
			} else {
				var scrollAmount = ($(this).text() * 380) - 380;
				$('.chances-boxes ul').stop(true, true).animate({top: '-' + scrollAmount + 'px'});
				Chances.currentPage = parseInt($(this).text(), 10);
			}
			
			/* Highlight! */
			$('.paging-links a').each(function(){
				$(this).removeClass('current');
				if($(this).text() == Chances.currentPage) {
					$(this).addClass('current');
                }
			});
			
			Chances.showNumLinks();

			return false;
		});
		
		Chances.showNumLinks();
};
	
/* Show/Hide closest num links - If over 5 num links*/
Chances.showNumLinks = function(){
		if($('.paging-links a.num').size() > 5){
			$('.paging-links a.num').each(function(){
				if($(this).text() < (Chances.currentPage + 3) && $(this).text() > (Chances.currentPage - 3)){
					$(this).parent().show();
				} else {
					$(this).parent().hide();
				}
			});
		}
};

Chances.displayChanceItems = function(data) {
	var items = "";

	$.each(data, function(index, obj) {
		var tgs = "";
		if (obj.initiative) {
			$.each(obj.initiative, function(idx, tag) {
				if (tag.match(/^[0-9].+$/)) {
					tag = "season_" + tag;
				}	
				tgs += ' ' + tag;
			});
		}
		var li = '<li><div class="chance-box ' + tgs + '">';
		
		if (obj.openInNewWindow && obj.openInNewWindow == "true") {
			li += '<a target="_blank" href="' + obj.link  +'">';
		}
		else {
			li += '<a href="' + obj.link  +'">';
		}
		li += '<div class="overlay">';
		li += '<h4>' + obj.title + '</h4>';
		if (obj["abstract"]) { // abstract is a javscript reserved word
			li += obj["abstract"];
		}
		if (obj.logo) {
			li += '<img class="logo" src="' + obj.logo + '" />';
		}
		li += '</div>';
		
		if (!obj.landingImageAlt) {
			obj.landingImageAlt = obj.title;
		}
		
		if (!obj.image) {
			obj.image =  "/etc/designs/premierleague/images/shim.gif";
		}	
		
		li += '<img src="' + obj.image + '" width="224" height="190" alt="' + obj.landingImageAlt + '" />';
		li += '</a></div>';
		items += li;
	});

	$("#creatingChances .chances-boxes ul").empty().append(items);
	$("#creatingChances .chances-boxes .chance-box .overlay").hide();
};

Chances.mapInit = function(){
	$('#map_canvas').hide();
	$('#map_canvas').attr('style', 'left:0; position:relative; display:none;');
	
	/* View Map Page */
	$('.view a').toggle(function(){
		$(this).text('Grid View');
		$(this).parent().removeClass('map');
		$(this).parent().addClass('grid');

		$('.chances-boxes, .paging-links').stop(true, true).fadeOut('500', function(){
			$('#map_overlay, #map_canvas, .map_footer').fadeIn();
		});
		
		$('ul#chance-main-menu a.selected').each(function(){
			$(this).click();
		});
		return false;

	}, function(){
		$(this).text('Map View');
		$(this).parent().removeClass('grid');
		$(this).parent().addClass('map');

		$('#map_overlay').stop(true, true).fadeOut('500', function(){
			$('.chances-boxes, .paging-links').fadeIn();
		});
		$('ul#chance-main-menu a.selected').each(function(){
			$(this).click();
		});
		return false;
	});
};

Chances.displayMapMarkers = function(data) {
	$.each(data, function(index, val) {

	    var markerColor = val.markerColor;
	    if (!val.markerColor) {
	    	markerColor = "red";
	    }
	   
		var image = '/etc/designs/premierleague/images/chances/mapmarker_' + markerColor + '.png';
		var myLatLng = new google.maps.LatLng(val.lat, val.lon);
		var marker = new google.maps.Marker({
			position: myLatLng,
			map: Chances.map,
			icon: image,
			title: val.title
		});
		
		var contentString = '<div id="contentBubble">';
		if (val.logo) {
			contentString += '<img height="50" src="' + val.logo + '" alt="' + val.title + '" />';
		}
		contentString += '<div style="float:left;width:100px"><h4>' + val.title + '</h4>';
		if (val["abstract"]) { // abstract is a javscript reserved word
			contentString += val["abstract"];
		}	
		contentString += '<a href="' + val.link + '">&raquo; See more</a>';
		contentString += '</div></div>';
		
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});
		
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(Chances.map,marker);
			$(Chances.currentInfoBox).each(function(){
				this.close();
				Chances.currentInfoBox.pop();
			});
			
			Chances.currentInfoBox.push(infowindow);
		});
	});
};

Chances.loadChanceData = function() {
	var url = $("#chances-ajax-url").text();
	$.getJSON(url, function(data) {
		Chances.displayChanceItems(data);
		Chances.displayMapMarkers(data);
		Chances.updateList();
	});
};


/* entry point */

$(document).ready(function() {
	if($('#creatingChances').size() > 0){
		
		Chances.loadChanceData();
		
		/* Create Body ID */
		$('body').addClass('creatingChances');
		
		/* Add green field */
		$('.bodypsys').addClass('green-field');
		
		/* Category Dropdown */
		$('#category-filter').hide();
		$('#chance-main-menu li.category a').click(
			function(){
				if($(this).hasClass('selected')){
					$('#category-filter').slideUp();
					$(this).removeClass('selected');
				} else {
					$('#chance-main-menu a').removeClass('selected');
					$(this).addClass('selected');
					$('#topic-filter').slideUp();
					$('#category-filter').slideDown();
				}
	
				return false;
		});
		
		$('#chances-seasons').change(function() { 
			Chances.updateList();
		});
		
		$('#category-filter .close-filter').click(function(){
			$('#chance-main-menu li.category a').click();
			return false;
		});
		$('#category-filter button').click(function(){
			$('#category-filter input').removeAttr('checked');
			Chances.updateList();
			return false;
		});
		
		/* Topic Dropdown */
		$('#topic-filter').hide();
		$('#chance-main-menu li.topic a').click(
			function(){
				if($(this).hasClass('selected')){
					$('#topic-filter').slideUp();
					$(this).removeClass('selected');
				} else {
					$('#chance-main-menu a').removeClass('selected');
					$(this).addClass('selected');
					$('#category-filter').slideUp();
					$('#topic-filter').slideDown();
				}
	
				return false;
		});
		$('#topic-filter .close-filter').click(function(){
			$('#chance-main-menu li.topic a').click();
			return false;
		});
		$('#topic-filter button').click(function(){
			$('#topic-filter input').removeAttr('checked');
			Chances.updateList();
			return false;
		});
		
		/* Overlay overlay */
		$('.chance-box').live({
			  mouseenter: function() { 
			   $(this).find('.overlay').fadeIn();
			  },
			  mouseleave: function () {
			   $(this).find('.overlay').fadeOut();
			  }
		 });
		
		/* Category/Topic Sort */
		$('input[name="topic"], input[name="category"]').click(function(){
			Chances.updateList();
		});
		
		/* Init the Google Map */
		var latlng = new google.maps.LatLng(15, 0);
		var myOptions = {
			zoom: 2,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		Chances.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		google.maps.event.addDomListener(window, 'load', Chances.mapInit);
	}
});
