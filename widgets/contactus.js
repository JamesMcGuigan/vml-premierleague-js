$.ui.basewidget.subclass('ui.contactus', {
    klass: '$.ui.contactus',
    _create: function() {
        this.target = this.element;
    },
    _init: function() {
		this.element.find('.tabLinks a:first').addClass('active');
        this.tabSwitch();
		//this.mapView();		// @Todo: Map View JS init
    },
    tabSwitch: function() {
    	var self = this;
		
		this.element.find('.tabLinks a').click(function(){
			var linkself = $(this);
			if(!$(this).hasClass('active')){
				self.element.find('.tabLinks a').removeClass('active').removeClass('inactive');
				$(this).addClass('active');
				self.element.find('.tabLinks a:not(.active)').addClass('inactive');
				
				self.element.find('.tabContent > li').fadeOut('slow', function(){
					self.element.find('.tabContent li.' + linkself.attr('rel')).fadeIn('slow');
					
				});
			}
			return false;	
		});
    }
});
