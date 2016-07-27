/**
 * This widget has been customised for functionality required by the Premier League - James McGuigan
 *
 * --------------------------------------------------------------------
 * jQuery-Plugin - selectToUISlider - creates a UI slider component from a select element(s)
 * by Scott Jehl, scott@filamentgroup.com
 * http://www.filamentgroup.com
 * reference article: http://www.filamentgroup.com/lab/update_jquery_ui_16_slider_from_a_select_element/
 * demo page: http://www.filamentgroup.com/examples/slider_v2/index.html
 * 
 * Copyright (c) 2008 Filament Group, Inc
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 *
 * Usage Notes: please refer to our article above for documentation
 *  
 * --------------------------------------------------------------------
 */


jQuery.fn.selectToUISlider = function(settings){
	var selects = jQuery(this).filter("select").length ? jQuery(this).filter("select") : jQuery(this).find("select");
	
	//accessible slider options
	var options = jQuery.extend({
		labels: 7, //number of visible labels
		tooltip: true, //show tooltips, boolean
		tooltipSrc: 'text',//accepts 'value' as well
		labelSrc: 'value',//accepts 'value' as well	,
		sliderOptions: null,
        hideSlider: true,
        hideLabels: true
	}, settings);

        
    //var labels = jQuery(this).find("labels");
    //if( options.hideLabels ) { 
    //    labels.hide(); 
    //}

    //var wrapper = jQuery(this);
    //if( options.wrapperClass ) {
    //    wrapper = jQuery(this).wrap("<div class='"+this.options.wrapperClass+"'></div>");
    //}


	//handle ID attrs - selects each need IDs for handles to find them
	var handleIds = (function(){
		var tempArr = [];
		selects.each(function(){
			tempArr.push('handle_'+jQuery(this).attr('id'));
		});
		return tempArr;
	})();
	
	//array of all option elements in select element (ignores optgroups)
	var selectOptions = selects.eq(0).find("option[value!='']").map(function(){
        return {
            value: jQuery(this).attr('value'),
            text:  jQuery(this).text()
                               .replace(/^\d\d(\d\d)-\d\d(\d\d)/, '$1/$2') // Short Years: 2010-2011 -> 10-11
        };
	});
	
	//array of opt groups if present
	var groups = (function(){
		if(selects.eq(0).find('optgroup').size()>0){
			var groupedData = [];
			selects.eq(0).find('optgroup').each(function(i){
				groupedData[i] = {};
				groupedData[i].label = jQuery(this).attr('label');
				groupedData[i].options = [];
				jQuery(this).find("option[value!='']").each(function(){
					groupedData[i].options.push({
                        text:     jQuery(this).text()
                                              .replace(/^\d\d(\d\d)-\d\d(\d\d)/, '$1/$2'),
                        value:    jQuery(this).attr('value'),
                        disabled: jQuery(this).attr('disabled')
                    });
				});
			});
			return groupedData;
		}
		else {
            return null;
        }
	})();	
	
	//check if obj is array
	function isArray(obj) {
		return obj.constructor == Array;
	}
	//return tooltip text from option index
	function ttText(optIndex){
        if(!( selectOptions[optIndex] )) { return ""; }
		return (options.tooltipSrc == 'text') ? selectOptions[optIndex].text : selectOptions[optIndex].value;
	}

    function updateSliderBar() {
        //change background width
        var sliderBar    = sliderComponent.find('.ui-slider-range');
        var sliderHandle = sliderComponent.find('.ui-slider-handle');
        sliderBar.css("width", sliderHandle.offset().left + sliderHandle.width()/2 - sliderBar.offset().left );
    }

	
    var selectedIndex = selects.attr("selectedIndex");
	//plugin-generated slider options (can be overridden)
	var sliderOptions = {
		step: 1,
		min: 0,
		orientation: 'horizontal',
		max: selectOptions.length-1,
		range: "min",
		slide: function(e, ui) {//slide function
            var thisHandle = jQuery(ui.handle);
            //handle feedback 
            var textval = ttText(ui.value);
            thisHandle
                .attr('aria-valuetext', textval)
                .attr('aria-valuenow', ui.value)
                .find('.ui-slider-tooltip .ttContent')
                .text( textval );

            setTimeout( updateSliderBar, 0 );
		},
        change: function(e, ui) {
            // If we select a disabled option, then jump back to the original selectedIndex
            var thisHandle = jQuery(ui.handle);
            var currSelect = jQuery('#' + thisHandle.attr('id').split('handle_')[1]);
            var currOption = currSelect.find('option:selected');
            var dragOption = currSelect.find('option').eq(ui.value);
            if( dragOption.index() != currOption ) {
                if( dragOption.attr("disabled") ) {
                    sliderComponent.slider("values", [selectedIndex]);
                } else {
                	currOption.removeAttr('selected'); //remove from all
    				dragOption.attr('selected', 'selected'); //add to selected
                }
            }
            
            setTimeout( updateSliderBar, 0 );
        },
		values: (function(){
			var values = [];
			selects.each(function(){
				values.push( jQuery(this).get(0).selectedIndex );
			});
			return values;
		})()
	};
	
	//slider options from settings
	options.sliderOptions = (settings) ? jQuery.extend(sliderOptions, settings.sliderOptions) : sliderOptions;
		
	//select element change event	
	selects.bind('change keyup click', function(){
		var thisIndex = jQuery(this).get(0).selectedIndex;
		var thisHandle = jQuery('#handle_'+ jQuery(this).attr('id'));
		var handleIndex = thisHandle.data('handleNum');
        sliderComponent.slider("values", handleIndex, thisIndex );
		//thisHandle.parents('.ui-slider:eq(0)').slider("values", handleIndex, thisIndex);
	});
	

	//create slider component div
	var sliderComponent = $.el('div').addClass("selectToUISliderComponent");

	//CREATE HANDLES
	selects.each(function(i){
		var hidett = '';
		
		//associate label for ARIA
		var thisLabel = jQuery('label[for=' + jQuery(this).attr('id') +']');
		//labelled by aria doesn't seem to work on slider handle. Using title attr as backup
		var labelText = (thisLabel.size()>0) ? 'Slider control for '+ thisLabel.text()+'' : '';
		var thisLabelId = thisLabel.attr('id') || thisLabel.attr('id', 'label_'+handleIds[i]).attr('id');
		
		
		if( options.tooltip == false ) { hidett = ' style="display: none;"'; }
		jQuery('<a '+
                   'href="#" tabindex="0" '+
                   'id="'+handleIds[i]+'" '+
                   'class="ui-slider-handle" '+
                   'role="slider" '+
                   'aria-labelledby="'+thisLabelId+'" '+
                   'aria-valuemin="'+options.sliderOptions.min+'" '+
                   'aria-valuemax="'+options.sliderOptions.max+'" '+
                   'aria-valuenow="'+options.sliderOptions.values[i]+'" '+
                   'aria-valuetext="'+ttText(options.sliderOptions.values[i])+'" '+
               '>' + 
                    '<span class="screenReaderContext">'+labelText+'</span>'+
                    '<span class="ui-slider-tooltip ui-widget-content ui-corner-all"'+ hidett +'>' + 
                        '<span class="ttContent"></span>'+
                        '<span class="ui-tooltip-pointer-down ui-widget-content"><span class="ui-tooltip-pointer-down-inner"></span></span>'+
                    '</span>' + 
               '</a>')
			.data('handleNum',i)
			.appendTo(sliderComponent);
	});
	
	//CREATE SCALE AND TICS
	
	//write dl if there are optgroups
	if(groups) {
		var inc = 0;
		var scale = sliderComponent.append('<dl class="ui-slider-scale ui-helper-reset" role="presentation"></dl>').find('.ui-slider-scale:eq(0)');
		jQuery(groups).each(function(h){
			scale.append('<dt style="width: '+ (100/groups.length).toFixed(2) +'%' +'; left:'+ (h/(groups.length-1) * 100).toFixed(2)  +'%' +'"><span class="ui-slider-optgroup-label">'+this.label+'</span></dt>');//class name becomes camelCased label
			var groupOpts = this.options;
            var optGroupLabel = this.label;
			jQuery(this.options).each(function(i){
				var style = (inc == selectOptions.length-1 || inc == 0) ? 'style="display: none;"' : '' ;
				var labelText = (options.labelSrc == 'text') ? groupOpts[i].text : groupOpts[i].value;
				var disabled  = (options.disabled === true)  ? ' disabled="disabled"' : "";

                var node = $('<dd style="left:'+ leftVal(inc) +'" class="optgroup-'+optGroupLabel+'" '+disabled+'><span class="ui-slider-label">'+ labelText +'</span><span class="ui-slider-tic ui-widget-content"'+ style +'></span></dd>');
                scale.append(node);
				inc++;
			});
		});
	}
	//write ol
	else {
		var scale = sliderComponent.append('<ol class="ui-slider-scale ui-helper-reset" role="presentation"></ol>').find('.ui-slider-scale:eq(0)');
		jQuery(selectOptions).each(function(i){
			var style = (i == selectOptions.length-1 || i == 0) ? 'style="display: none;"' : '' ;
			var labelText = (options.labelSrc == 'text') ? this.text : this.value;
                
			scale.append('<li style="left:'+ leftVal(i) +'"><span class="ui-slider-label">'+ labelText +'</span><span class="ui-slider-tic ui-widget-content"'+ style +'></span></li>');
		});
	}
	
	function leftVal(i){
		return (i/(selectOptions.length-1) * 100).toFixed(2)  +'%';
		
	}
	

	
	
	//show and hide labels depending on labels pref
	//show the last one if there are more than 1 specified
	if(options.labels > 1) { sliderComponent.find('.ui-slider-scale li:last span.ui-slider-label, .ui-slider-scale dd:last span.ui-slider-label').addClass('ui-slider-label-show'); }


	//set increment
	var increm = Math.max(1, Math.round(selectOptions.length / options.labels));
	//show em based on inc
	for(var j=0; j<selectOptions.length; j+=increm){
		if((selectOptions.length - j) > increm){//don't show if it's too close to the end label
			sliderComponent.find('.ui-slider-scale li:eq('+ j +') span.ui-slider-label, .ui-slider-scale dd:eq('+ j +') span.ui-slider-label').addClass('ui-slider-label-show');
		}
	}

	//style the dt's
	sliderComponent.find('.ui-slider-scale dt').each(function(i){
		jQuery(this).css({
			'left': ((100 /( groups.length))*i).toFixed(2) + '%'
		});
	});
	
    // Center labels
	sliderComponent.find('span.ui-slider-label').each(function() {
        $(this).css("margin-left", ($(this).width()/2)+"px");       
    });

	//inject and return 
	sliderComponent
	.insertAfter(jQuery(this).eq(this.length-1))
	.slider(options.sliderOptions)
	.attr('role','application')
	.find('.ui-slider-label')
	.each(function(){
		jQuery(this).css('marginLeft', -jQuery(this).width()/2);
	});
	
	//update tooltip arrow inner color
	sliderComponent.find('.ui-tooltip-pointer-down-inner').each(function(){
				var bWidth = jQuery('.ui-tooltip-pointer-down-inner').css('borderTopWidth');
				var bColor = jQuery(this).parents('.ui-slider-tooltip').css('backgroundColor');
				jQuery(this).css('border-top', bWidth+' solid '+bColor);
	});
	
	var values = sliderComponent.slider('values');
	
	if(isArray(values)){
        var ttContent = sliderComponent.find('.ui-slider-tooltip .ttContent');
        for( var i=0, n=values.length; i<n; i++ ) {
            ttContent.eq(i).text( ttText(values[i]) );
        }
	}
	else {
		sliderComponent.find('.ui-slider-tooltip .ttContent').eq(0).text( ttText(values) );
	}
    // Center tooltips
    sliderComponent.find('.ui-slider-tooltip').each(function() {
        var sliderHandleWidth = 6;
        var marginLeft = ( $(this).width() - sliderHandleWidth ) / 2;
        $(this).css("margin-left", -marginLeft+"px");
    });
	
    updateSliderBar(); // No setTimeout(), apply immediatly on render
	return this;
};


