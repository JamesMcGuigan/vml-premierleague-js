/**
 *  Requires: <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false">
 *
 *  Widget not quite complete, but we have a basic google maps widget
 *  @see http://code.google.com/apis/maps/documentation/javascript/reference.html
 *  @see http://code.google.com/apis/maps/documentation/javascript/services.html#DirectionsResults
 *
 *  Still needs cleaning up and working out how to properly render directions
 */
$.ui.basewidget.subclass('ui.googlemaps', {
    klass: '$.ui.googlemaps',
    options: {
      zoom:   15,
      mapTypeId: (typeof google !== 'undefined') ? google.maps.MapTypeId.HYBRID : "-1",
      travelMode: "walking"
    },
    _create: function() {
        this.stadium       = {};
        this.el.map        = this.element.find(".map");
        this.el.directions = this.element.find(".directions");
        this.el.travelMode = this.element.find(".travelMode");
        this.el.form       = this.element.find("form");
        this.el.input      = this.element.find("form input[type=text]");
        this.defaultValue = this.el.input.val();
            
     },
    _init: function() {
        if (typeof google !== 'undefined') {
        	this.draw();
	        this.bindEventHandlers();
	        
	        this.directionsService = new google.maps.DirectionsService();
	        this.directionsDisplay = new google.maps.DirectionsRenderer({ map: this.map });
	        this.stepDisplay       = new google.maps.InfoWindow();
	        this.markerArray = [];
        }
    },
    draw: function() {
        this.stadium.point = new google.maps.LatLng(this.options.lat, this.options.lon);
        
        this.map = new google.maps.Map(this.el.map[0], {
              zoom:      this.options.zoom,
              center:    this.stadium.point,        
              mapTypeId: this.options.mapTypeId
        });
        this.stadium.marker = new google.maps.Marker({
            position:  this.stadium.point, 
            map:       this.map,
            animation: google.maps.Animation.DROP
        });
        this.stadium.info = new google.maps.InfoWindow({
            minHeight:  100,
            content:   "<b>Emirates Stadium.</b><br/>England, United Kingdom<br/> Population: 0<br/>Elevation: 0 <br/>Time zone: Europe/London"
        });
        var $tM = $.el('input').attr({type:'hidden',id:'travelMode'}),
        	$tD = $.el('span').addClass('driving'),
        	$tW = $.el('span').addClass('walking'),
        	$tS = $.el('span').addClass('travelMode'); 
        this.el.form.append($tM).prepend($tS.append($tD).append($tW));
        
    },
    bindEventHandlers: function() {
        $(this.el.form).bind("submit", $.proxy(this._onSubmit,this));
        google.maps.event.addListener(this.stadium.marker, 'click', $.proxy(this._onClickMarker, this));
        
        $('input.location',this.el.form).live('focus',function(){
        	$t = $(this);
        	$t.addClass('active');
        	$t.val(($t.val() != this.defaultValue) ? $t.val() : "");
        });
        $('input.location',this.el.form).live('blur',function(){
        	$t = $(this);
        	
        	$t.val(($t.val() != "") ? $t.val() : this.defaultValue); 
        	if ($t.val() == this.defaultValue) {
        		$t.removeClass('active');
        	}
        });
        $('.travelMode span',this.el.form).live('click',function(){
        	var d = $(this).hasClass('driving');
        	var act = (d) ? 'driving' : 'walking';
        	var rem = (!d) ? 'driving' : 'walking';
        	$(this).parent().addClass(act).removeClass(rem);
        	$('#travelMode').val(act);
        });
        $('.travelMode span.'+this.options.travelMode).click();
        
    },
    // @see http://code.google.com/apis/maps/documentation/javascript/services.html#DirectionsResults
    _onSubmit: function() {
        try {
            var location = this.el.input.val();
            if( !location.match(/^\s*$/) ) {
                this.directionsService.route({
                    origin:      location,
                    destination: this.stadium.point,
                    travelMode:  travelM = ($('#travelMode',this.el.form).val() == 'walking') ? 
                    		google.maps.TravelMode.WALKING : 
                    			google.maps.TravelMode.DRIVING
                }, $.proxy(function( directionsResult, directionsStatus ) {
                    if( directionsStatus == google.maps.DirectionsStatus.OK ) {
                        this.directionsDisplay.setDirections( directionsResult );
                       // this.drawRouteMarkers( directionsResult );
                        this.drawRouteText( directionsResult );

                        //var route = directionsResult.routes[0].overview_path;
                        //this.el.directions[0].innerHTML += "<b>"+ (i+1) + ": " + route[i] + "</b><br />";

                        //// For each route, display summary information.
                        //var route = directionsResult.routes[0];
                        //this.el.directions[0].innerHTML = "";
                        //for (var i = 0; i < route.legs.length; i++) {
                        //    var routeSegment = i+1;
                        //    this.el.directions[0].innerHTML += "<b>Route Segment: " + routeSegment + "</b><br />";
                        //    this.el.directions[0].innerHTML += route.legs[i].start_address + " to ";
                        //    this.el.directions[0].innerHTML += route.legs[i].end_address + "<br />";
                        //    this.el.directions[0].innerHTML += route.legs[i].distance.text + "<br /><br />";
                        //}
                    }
                },this));
            }
        } catch( exception ) {
            console.log('Exception: ', this&&this.klass||'' , ':_onSubmit(): ', exception);
            console.dir(exception);
        }       
        return false;
    },
    drawRouteText: function( directionsResult ) {
        var route = directionsResult.routes[0].legs[0];
        var steps = route.steps;
                        
        this.el.directions[0].innerHTML = "";
        for( var i=0, n=steps.length; i<n; i++ ) {
            var text = steps[i].instructions;
            var time = steps[i].duration.text

            /*this.el.directions[0].innerHTML += "<div style='padding:0.5em; border-bottom: 1px solid #666'>" +
                    "<span style='float:right; clear:both;'>" + time + "</span>" +
                    "<span>" + text + "</span>" +
                "</div>";*/
            this.el.directions[0].innerHTML += "<div class=\"step\">" +
            "<span class=\"time\">" + time + "</span>" +
            "<span class=\"text\">" + text + "</span>" +
        "</div>";
        }
        if (steps.length > 0) { 
        	$(this.el.directions[0]).addClass("returned"); 
        } else {
        	$(this.el.directions[0]).removeClass("returned");
        }
        
        	
        //console.log('DEBUG: ', this&&this.klass||'' ,' route.steps ', route.steps);
    },
    drawRouteMarkers: function( directionsResult ) {
        var route = directionsResult.routes[0].legs[0];

        for( var i = 0; i < route.steps.length; i++ ) {
            var text   = route.steps[i].instructions;
            var marker = new google.maps.Marker({
                position: route.steps[i].start_point,
                map:      this.map
            });
            google.maps.event.addListener(marker, 'click', $.proxy(function(marker, text) {
                this.stepDisplay.setContent(text);
                this.stepDisplay.open(this.map, marker);
            }, this, marker, text));
            this.markerArray[i] = marker;
        }
    },
    _onClickMarker: function() {
        if( this.stadium.info_open === true ) {
            this.stadium.info.close();
            this.stadium.info_open = false;
        } else {
            this.stadium.info.open(this.map, this.stadium.marker);
            this.stadium.info_open = true;
        }
    }
});  
