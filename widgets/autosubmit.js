/**
 *  We can either call this on a <form> element, and autosubmit for any field
 *  Or we call this on individual inputs, and only autosubmit when these change 
 *
 *  The submit button will only be hidden if it is inside the <widget="autosubmit"> tag
 */
$.ui.widget.subclass('ui.autosubmit', {
    klass: '$.ui.autosubmit',
    options: {
        hideSubmit: true
    },
    _create: function() {
        this.el = {};

        this.el.form = this.element.findAndSelf("form");
        if( this.el.form.length === 0 ) { 
            this.el.form = this.element.closest("form"); 
        }

        // Note: search from this.element, not this.el.form
        this.el.submit = this.element.find("input[type=submit]");
        this.el.inputs = this.element.findAndSelf("input,select,textarea,button").not(this.el.submit);

        this.onChange = $.proxy(this.onChange, this);
    },
    _init: function() {
        if( this.options.hideSubmit ) {
            this.el.submit.hide();
        }
        this.el.inputs.bind("change", this.onChange);
    },
    onChange: function() {
        this.el.form.submit();
    }
});
