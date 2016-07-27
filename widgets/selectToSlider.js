/***
 *  This is a wrapper around the selectToUISlider jquery plugin
 */

$.ui.basewidget.subclass('ui.selectToSlider', {
    klass: '$.ui.selectToSlider',
    options: {
        wrapperClass: 'selectToSliderWrapper',
        hideSelects:  true,
        hideLabels:   true,
        labels: 7,
        tooltip: true
    },

    _create: function() {
        this.el = {};
        this.element.wrap("<div class='"+this.options.wrapperClass+"'></div>");
        this.el.wrapper = this.element.parent();
        this.el.selects = this.element.findAndSelf("select");
        this.sliderOptions = {};
    },

    _init: function() {
        var labelCount  = this.element.find("option").length;
        var showTooltip = this.options.tooltip && !!(labelCount > this.options.labels);

        // If you want a double slider, this.el.selects needs contain two select elements
    	this.el.selects.selectToUISlider({
			labels:   this.options.labels,
			labelSrc: "text",
			tooltip:  showTooltip,
            sliderOptions: this.sliderOptions,
            hideLabels: this.options.hideLabels
		});
    	
        if( this.options.hideSelects ) {
            this.element.findAndSelf("select").hide();
        }
        if( this.options.hideLabels ) {
            this.element.find("label").hide();
        }
    }
});
