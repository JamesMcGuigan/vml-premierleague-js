/**
 *  Class extended by templateTabs.js
 *
 *  If cqEditMode is on, we render the meganav visible and inline, and disable all other links
 *  If in preview or publish, we render meganav hidden and as a position:absolute flyout
 *
 *  TODO: ipad/touch spec to be defined/tested
 */
$.ui.basewidget.subclass('ui.meganav', {
    klass: "$.ui.meganav",
    options: {
        target:          '#meganav',   // {String}  selector for target
        links:           'li',         // {String}  selector for links
        ajaxLinks:       'li[ajax]',   // {String}  selector for ajaxLinks
        prefix:          'meganav',    // {String}  css class prefix for flyouts, <flyout class="$prefix-inner $prefix-$name">
        selectedClass:   'active',     // {String}  css selected class for links
        closeButtonClass:'close-icon', // {String}  css class for close button
        expandEvent:     'mouseenter.megaexpand',                  // {String}  event(s) to bind on links for meganav flyout
        collapseEvent:   'mouseleave.megaexpand click.megaexpand', // {String}  event(s) to bind on links for meganav flyout
        collapseTimeout: 500,          // {Number}  ms after mouseout to close the flyout
        nocache:         false,        // {Boolean} always reload the flyouts via ajax, mostly for development
        preload:         true,         // {Boolean} ajax preload the content of all links on document.ready
        editMode:        null,         // {Boolean} are we in cqEditMode with an editable dropdown, null for auto
        renderInline:    false         // {Boolean} render inline, just like edit mode, for development purposes
    },
    required: {
        target: String,
        ajaxLinks:  String
    },
    counter: 0,            // {Number}  Semaphore to ensure that only the last click is rendered
    _closeTimeoutId: null, // {Number}  [private] setTimeout id for collapseEvent

    //*** Init ***//
    _create: function() {
        // TODO: touch untested
        //if( Modernizr && Modernizr.touch ) {
        //    this.options.expandEvent   = "touchstart";
        //    this.options.collapseEvent = "click";
        //}

        this.el = {};
        this.el.links         = this.element.find(this.options.links).not(this.options.target);
        this.el.ajaxLinks     = this.element.find(this.options.ajaxLinks).not(this.options.target);
        this.el.target        = $(this.options.target).eq(0);
        this.el.closeButton   = $([]);
        this.el.flyouts       = this.el.target.children().not(this.el.closeButton);
        this.el.editFlyout    = ($.cqEditMode) ? this.el.target.children(".meganav-initial") : $([]);
        this.options.editMode = (this.options.editMode === null) ? $.cqEditMode : this.options.editMode;

        this._onMouseEnter = $.proxy(this._onMouseEnter, this);
        this._onMouseLeave = $.proxy(this._onMouseLeave, this);
        this._onBodyClick  = $.proxy(this._onBodyClick,  this);
    },
    _init: function() {
        if( this.options.editMode ) {
            // You can't edit a component if clicking on it takes you to another page
            // CQ may add edit the content after page load
            this.el.target.find("a").bind("click", function(event){ event.preventDefault(); });
            $(".cq-wcm-edit .meganav .column a, " +
              ".cq-wcm-edit .meganav .row    a").live("click", function(event) { 
                event.preventDefault(); 
            });
        } else {
            if( this.options.preload ) {
                this.preloadAll();
            }

            if( this.options.renderInline ) {
                this.renderInline();
            } else {
                this.hide();
            }
            this.bindMouseEvents();
        }
        this.addLinkHoverStates();
    },
    destroy: function() {
        this.unbindMouseEvents();
        this.unbindBodyClickEvent();
        this.close();
    },

    renderInline: function() {
        this.options.renderInline = true;
        if( this.el.links.filter(".currentpage").length ) {
            this.load( this.el.links.filter(".currentpage") );
        }
    },

//    /**
//     *  @unused, intended for touch interface
//     */
//    addCloseButton: function() {
//        if( Modernizr && Modernizr.touch ) {
//            this.el.closeButton = $("<div class='"+this.options.closeButtonClass+"'>").prependTo(this.el.target);
//            this.el.closeButton.bind("click", $.proxy(this.hide, this));
//        }
//    },


    //*** Getters / Setters ***//

    getFlyoutWrapper: function( url, name ) {
        var flyout = this.el.target.children("[url='"+url+"']");
        if( this.options.nocache ) {
            this.el.flyouts = this.el.flyouts.not(flyout).jQueryGC();
            flyout.remove();
        }
        if( flyout.length === 0 ) {
            flyout = $("<div class='"+this.options.prefix+"-inner "+this.options.prefix+"-"+name+"' url='"+url+"'></div>").appendTo( this.el.target );
        }
        this.el.flyouts = this.el.flyouts.add(flyout);
        return flyout;
    },
    isFlyoutRendered: function( flyout ) {
        return !flyout.text().match(/^\s*$/);
    },


    //*** Actions ***//

    hide: function() {
        this.el.ajaxLinks.removeClass(this.options.selectedClass);
        this.el.flyouts.hide();
        this.el.closeButton.hide();
    },
    close: function( delay ) {
        delay = delay || 10; // 10ms is enough time for this.el.target:mouseenter to trigger
        if( this._closeTimeoutId ) { 
            clearTimeout( this._closeTimeoutId ); 
        }
        this._closeTimeoutId = setTimeout($.proxy(function() {
            this.hide();
            this.unbindBodyClickEvent();
        }, this), delay);
    },
    cancelClose: function() {
        if( this._closeTimeoutId ) { 
            clearTimeout( this._closeTimeoutId ); 
        }
    },
    show: function( flyout ) {
        this.cancelClose();
        var url = flyout.attr("url");

        this.hide();
        this.el.ajaxLinks.filter("[ajax='"+url+"']").addClass(this.options.selectedClass);
        this.el.closeButton.show();
        flyout.show();
    },
    
    

    //*** Render Actions ***//

    /**
     *  @param  {jQuery} flyout   flyout node to render in
     *  @param  {String} html     html to render
     *  @return {jQuery}          node of html rendered
     */
    render: function( flyout, html ) {
        var node = this.renderHidden(flyout, html);
        this.show( flyout );
        return node;
    },
    renderHidden: function( flyout, html ) {
        flyout.hide().empty();
        var node = $(html).appendTo( flyout );
        return node;
    },
    renderPreload: function( flyout, html ) {
        flyout.empty();
        var node = $(html).appendTo( flyout );
        return node;
    },


    //*** Bind / Unbind Event Handlers ***//

    addLinkHoverStates: function() {
        var self = this;
        this.el.links.hover(
            function(event) {
                // @context {this.element}
                var node = event.target;
                self.element.addClass("hovering");
                self.el.links.removeClass("hover");
                $(node).closest(self.el.links).addClass("hover");
            },
            function(event) {
                // @context {this.element}
                self.element.removeClass("hovering");
                self.el.links.removeClass("hover");
            }
        );
    },
    bindBodyClickEvent: function() {
        if( this.options.collapseEvent.match(/click/) && !this.options.renderInline ) {
            this.unbindBodyClickEvent();
            $(document.body).bind("click", this._onBodyClick);
        }
    },
    unbindBodyClickEvent: function() {
        if( this.options.collapseEvent.match(/click/) ) {
            $(document.body).unbind("click", this._onBodyClick);
        }
    },
    bindMouseEvents: function() {
        if( this.options.collapseEvent.match(/mouseleave/) ) {
            this.unbindMouseEvents();
            $([]).add(this.el.target).add(this.element).bind(  "mouseleave", this._onMouseLeave);
            $([]).add(this.el.target).add(this.el.links).bind( "mouseenter", this._onMouseEnter);
        }
    },
    unbindMouseEvents: function() {
        if( this.options.collapseEvent.match(/mouseleave/) ) {
            $([]).add(this.el.target).add(this.el.links).unbind( "mouseenter", this._onMouseEnter);
            $([]).add(this.el.target).add(this.element).unbind(  "mouseleave", this._onMouseEnter);
        }
    },


    //*** Events ***//
    /**
     *  this.el.links:mouseenter - open nav, close others
     *  this.el.links:mouseleave - close nav, unless this.target.mouseenter
     *  this.el.links:mouseenter - cancel close
     *  this.el.links:mouseleave - set timeout to close
     *  $(body):click - close
     */
    _onMouseEnter: function( event ) {
        var node        = $(event.currentTarget); // this.el.ajaxLink[] or this.el.target
        var eventTarget = $(event.target);        // $("a") or $("span") etc

        if( eventTarget.closest(this.el.ajaxLinks).length ) {
            this.load( node );
        }
        else if( eventTarget.closest(this.el.links).not(this.el.ajaxLinks).length ) {
            this.close();
        }
        else if( eventTarget.closest(this.el.target).length ) {
            this.cancelClose();
        }
    },
    _onMouseLeave: function( event ) {
        var node        = $(event.currentTarget); // this.element[] or this.el.target
        var eventTarget = $(event.target);        // $("a") or $("span") etc

        var node = this; // this.element or this.el.target
        if( !this.options.renderInline ) {
            this.close( this.options.collapseTimeout ); // add a delay
        }
    },
    _onBodyClick: function( event ) {
        var node        = $(event.currentTarget); // $(document.body)
        var eventTarget = $(event.target);        // $("a") or $("span") etc

        if( eventTarget.closest(this.el.ajaxLinks).length === 0
         && eventTarget.closest(this.el.target).length    === 0 ) {
            this.close();
        }
    },


    load: function( node ) {
        this.cancelClose();
        this.bindBodyClickEvent(); // $(body) events are rebound on each load/close, 
                                   // mouseenter/mouseleave events are bound once on init
       
        var url    = $(node).attr("ajax");
        var name   = $(node).attr("name");
        var flyout = this.getFlyoutWrapper( url, name );

        if( this.isFlyoutRendered(flyout) ) {
            this.show(flyout);
        } else {
            this.render( flyout, "<div class='spinner'><p>...</p></div>" );

            var counter = ++this.counter;
            $.ajax({
                type: "GET",
                url:  url,
                dataType: "text",
                success: $.proxy( function( html, xhr, status ) {
                    if( counter === this.counter ) {
                        this.render( flyout, html );
                    } else {
                        this.renderHidden( flyout, html );
                    }
                }, this),
                error: $.proxy( function( xhr, status ) {
                    if( counter !== this.counter ) { return; }

                    var html = "<div class='ajax-error'>Unable to load navigation content</div>";
                    this.render( flyout, html );

                    // Failsafe fallback - if content cannot be loaded, click the link - TODO: Confirm Spec
                    //var href = node.findAndSelf("a[href]").attr("href");
                    //if( href ) { document.location.assign(href); }
                }, this)
            });
        }
    },
    preloadAll: function() {
        for( var i=0, n=this.el.ajaxLinks.length; i<n; i++ ) {
            this.preload( this.el.ajaxLinks[i] );
        }
    },
    preload: function( node ) {
        var url    = $(node).attr("ajax");
        var name   = $(node).attr("name");
        var flyout = this.getFlyoutWrapper( url, name );

        if( !this.isFlyoutRendered(flyout) ) {
            $.ajax({
                type: "GET",
                url:  url,
                dataType: "text",
                success: $.proxy( function( html, xhr, status ) {
                    this.renderPreload( flyout, html );
                }, this)
            });
        }
    }
});
