// Requires libs/jquery-custom/jquery.extensions.js
(function($) {
	/**
	 * topnav event model and construction
	 */
	$.fn.topnav = function (options) {
		if (this.length === 0) {return this;} // Quit early on empty selector
		
		var opts = $.extend({}, $.fn.topnav.defaults, options);
				
		var buildNav = function($el,urlRoot) {
			var navData = $el.data();
			var nu = $el.closest('li').find('.sub');
			nu.empty();
			
			for (var key in navData) {
				//console.log('jquery?',key);
				if (navData.hasOwnProperty(key) && key.indexOf("jcr:") < 0 && key.indexOf("jQuery") < 0 ) {
					//console.log(key,navData[key]);
					var li = $.el('li');
					var la = $.el('a').attr( {'href':urlRoot+'/'+key+'.html'}).text(navData[key]['jcr:content']['jcr:title']);
					nu.append(li.html(la));
				}
			}

			$el.after(nu);
			$el.data({'loaded':true});
		};
		
		var showNav = function($t){
			
			var my$li = $t.closest('li');
			
			if (my$li.hasClass('active')) {
				// do nothing
			} else {
				$('.active','#navigation').removeClass('active');
				$('.sub','#navigation').fadeOut('fast');
				my$li.addClass('active').find('.sub').show();
			}
			
		};
		
		return this.each(function(){
			
			var $t = $(this); 
			var init = function() {
				
				/*var img = $.el('img').attr({
                    src:'images/throbber.gif',
                    width:'16',
                    height:'16'
                });*/
                var li = $.el('li').html("loading");
				var nu = $.el('ul').addClass('sub').html(li);
				
				$t.after(nu);
				//alert("in init")
			}();
			
			$t.click(function(){
				
				th = this.href;
				
				if ($t.data("loaded") !== true) {
					// get the nav data
					$.ajax({
						url:$.fn.topnav.sourceJSON(this.href),
						success: function(data){		
						  $t.data(data);
						  buildNav($t,th.split('.')[0]);
						},
						error:function(){}
					});
				}
				showNav($t);
				return false;
			});
		});
	};

	/**
	 * Define how to locate our source for the nav data
	 */
	$.fn.topnav.sourceJSON = function(href) {
	    var hrp = href.split('.');
	    var jsh = hrp[0]+".2.json";
		return jsh;
	};
	/**
	 * Define topnav defaults
	 */
	$.fn.topnav.defaults = {};
	
})(jQuery);
