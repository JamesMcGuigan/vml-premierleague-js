$.ui.svgWidget.subclass('ui.svgImage', {
    options: {
    },
    _create: function() {
    },
    _init: function() {
        this.draw();
    },
    draw: function() {
        this.canvas.image( this.element.attr("src"), 0, 0, this.getInitWidth(), this.getInitHeight() );
        this.element.hide();
    }
});
