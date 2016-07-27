$.ui.svgWidget.subclass('ui.svgWrapper', {
    klass: "$.ui.svgWrapper",
    options: {
    },
    _create: function() {
        $.noop();
    },
    _init: function() {
        $.noop();
    },
    /**
     *  Nothing to see here, move along
     *  @return {Object}
     */
    parseHtmlTable: function() {
        return {};
    },

    /**
     *  Define the current element as the wrapper, we need to do this to ensure HTML nesting
     *  @return {jQuery}
     */
    createWrapper: function() {
        this.wrapper = this.element;
        this.wrapper.addClass("svg-wrapper"); // Needs to be a parent to child nodes
        this.createWrapperInit();
        return this.wrapper;
    }
});
