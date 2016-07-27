/**
 *  <div widget="templateTabs">
 *      <ul>
 *          <li name="match" template=".match" ajax="./match.json"></li>
 *      </ul>
 *      <div class="templates">
 *          <div class="match">
 *          </div>
 *      </div>
 *      <div class="target">
 *      </div>
 *  </div>
 */
$.ui.meganav.subclass('ui.templateTabs', {
    klass: "$.ui.templateTabs",
    options: {
    	templates:     'script',
        target:        '.target',
        links:         'li[ajax]',
        prefix:        'templateTabs',
        selectedClass: 'selected',
        renderInline:  true,
        nocache:       false,
        autoselect:    0
    },
    _create: function() {
    	this.el.templates = this.options.templates.match(/#/) ? $(this.options.templates) : this.element.find(this.options.templates);
        this.el.links     = this.element.find(this.options.links ).not(this.options.target)
        this.el.target    = this.element.find(this.options.target).eq(0);
    },
    _init: function() {
        //if( typeof this.options.autoselect == "number" ) {
        //    this.el.links.eq(this.options.autoselect).trigger("click");
        //}
    },
    _onBodyClickEvent:    function() {},
    bindBodyClickEvent:   function() {},
    unbindBodyClickEvent: function() {},
    
    renderTemplate: function( flyout, template, json ) {
        this.el.target.children().not( this.el.links.parents() ).hide();
        this.el.templates.filter(template).tmpl(json).appendTo(flyout.empty());
        $.initWidgets(flyout);
        flyout.show();
    },
    _onClick: function( node ) {
        var url              = node.getAttribute("ajax");
        var name             = node.getAttribute("name");
        var templateSelector = node.getAttribute("template");
        var flyout           = this.getFlyoutWrapper( url, name );

        if( this.isFlyoutRendered(flyout) ) {
            this.show(flyout);
        } else {
            this.render( flyout, "<div class='spinner'><p>...</p></div>" );

            var counter = ++this.counter;
            $.ajax({
                type: "GET",
                url:  url,
                dataType: "json",
                success: $.proxy( function( json, xhr, status ) {
                    if( counter === this.counter ) {
                        this.renderTemplate( flyout, templateSelector, json );
                    }
                }, this),
                error: $.proxy( function( xhr, status ) {
                    if( counter !== this.counter ) { return; }

                    var html = "<div class='ajax-error'>Unable to load content</div>";
                    this.render( flyout, html );
                }, this)
            });
        }
    }
});
