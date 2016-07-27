$.ui.basewidget.subclass('ui.localeDate', {
    klass: "$.ui.localeDate",
    options: {
        timestamp: null,  // {Number}  13 digit millisecond timestamp
        format:    null,  // {String}  Date Format, ie HH:mm or dd/MM/yy
        force:     null   // {Boolean} If true, don't check that existing text is a valid date
    },
    required: {
        timestamp: Number,
        format:    String
    },
    _init: function() {
        if( this.options.timestamp && this.options.format ) {
            this.text = this.element.text().trim();
            var formatRegexp = this.options.format.replace(/\w/g, '\\d');
            if( this.options.force || this.text.match(formatRegexp) ) {
                this.localeDateString = (new Date( this.options.timestamp )).toString( this.options.format );
                this.element.text( this.localeDateString );
            } else {
                if( !this.text.match(/\b(TODAY|LIVE|FT|HT|FHS|SHS)\b/) ) {
                    console.error( this.klass+":_init(): text: "+this.text+" does not match format: "+this.options.format + " regexp: "+formatRegexp );
                }
            }
        }
    }
});
