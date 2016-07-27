$.ui.basewidget.subclass('ui.hideParent', {
    klass: '$.ui.hideParent',
    options: {
        selector: null
    },
    required: {
        selector: String
    },
    _init: function() {
        this.element.bind( "click", $.proxy(this.onClick, this) );
    },
    onClick: function() {
        this.element.closest(this.options.selector).hide();
        return false;
    }
});
