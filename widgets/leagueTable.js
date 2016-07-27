/**
 *  File: etc/designs/premierleague/clientlibs/js/widgets/jquery.leagueTable.js
 *
 *
 * <script type="text/x-jquery-tmpl" class="leagueTable-P" render=".overview-title" ajax="false"></script>
 * <script type="text/x-jquery-tmpl" class="leagueTable-P" render=".overview-data"  ajax="true"></script>
 * 
 * <table class="leagueTable" matchurl="matches/" widget="leagueTable">
 * <td class="dataRow" template=".leagueTable-P" ajax="/ajax/league-table/date-timeline/expanded/2010-2011/02-02-2011/12/P.json">24</td>
 * <tr class="club-overview-row">
 *   <div class="overview-title"></div>
 *   <div class="overview-data"></div>
 * </tr>
 * </table>
 */
$.ui.basewidget.subclass('ui.leagueTable', {
    klass: "$.ui.leagueTable",
    options: {
        matchesurl:			null,
        clubsurl:			null,
        playersurl:			null,
        icalurl:			null,
		links:           	'.club-row td[ajax]',
		rows:            	'.club-row',
        targets:         	'.club-overview-row',
        spinnerSelector: 	'.spinner',
        selectedRowClass:   'selected-row',
        selectedCellClass:	'selected-cell',
        accentClasses:      'accent1 accent2 accent3 accent4 accent5 accent6 accent7 accent8 accent9',
        autoExpandTabshow:  false,
        autoExpandInit:     false,
        updateLogoSizes:    true
    },
    required: {
    	matchesurl:			String,
        links:           	String,
        targets:         	String,
        selectedRowClass:   String,
        selectedCellClass:	String,
        spinnerSelector: 	String
    },
    requiredElements: {
        templates: true,
        rows:      true,
        links:     true,
        targets:   true
    },

    _create: function() {
        this.matchesurl   = this.options.matchesurl;
        this.clubsurl     = this.options.clubsurl;
        this.playersurl   = this.options.playersurl;
        this.icalurl 	  = this.options.icalurl;
    	this.el.templates = $("script[type='text/x-jquery-tmpl']");
        this.el.links     = this.element.find(this.options.links);
        this.el.rows      = this.element.find(this.options.rows);
        this.el.targets   = this.element.find(this.options.targets);
        this.renderedSelector      = this.el.templates.map(function(){ return this.getAttribute("render"); }).get().uniq().join(", "); // $.map returns only an array like object, need to call .get() before .join()
        this.templateClassNamesAll = this.getTemplateClassNames("*");

        this.data         = this.parseHtmlTable();
        this.loaded       = false;
    },
    _init: function() {
        this.el.rows.bind("click", $.proxy(this.onClickTD, this));
        this.el.links.addClass("clickable");
        this.el.targets.hide();
        this.bindUIEvents();
        this.updateLogoSizes();
    },
    validateRequiredElements: function() {
        this._super();

        var self = this;
        var hasTemplate = _.memoize(function(selector) { return !!self.el.templates.filter(String(selector)).length;} );
        var missingTemplates = this.el.links.map(function() { return this.getAttribute("template"); })
                                            .filter(function() { return !hasTemplate(this); } )
                                            .toArray().uniq();
        if( missingTemplates.length ) {
            var missingSelector = _.map(missingTemplates, function(t) { return "[template='"+t+"']"; }).join(",");
            var missingLinks = this.el.links.filter( missingSelector ); 
            console.error(this.klass, ":validateRequiredElements(): missingTemplates: ", missingTemplates, " in missingLinks: ", missingLinks, " for this.el: ", this.el, " - this: ", this  );
        }
    },

    updateLogoSizes: function() {
        if( !this.options.updateLogoSizes ) { return; }

        for( var rowName in this.data.rows ) {
            $.loadImageSize( this.data.rows[rowName].logourl, $.proxy(function(rowName, width, height) {
                this.data.rows[rowName].logoheight = height;
                this.data.rows[rowName].logowidth  = width;
            }, this, rowName));
        }
    },

    /**
     *  _.memorize from underscore.js - keeps a cache of computed results
     *  @param  {String} selector
     *  @return {String} space separated list of classnames
     */
    getTemplateClassNames: _.memoize(function(selector) {
        return this.el.templates.filter(selector).map(function(){ return this.className.split(" "); }).toArray().uniq().sort().join(" ");
    }),

    bindUIEvents: function() {
        if( this.options.autoExpandTabshow ) {
            this.element.parents("[widget=tabs],[widget=pagetabs]").bind("tabsshow", $.proxy(function(event,ui) {
                if( !this.loaded && this.element.closest(ui.panel).length > 0 ) {
                    this.el.links.first().trigger("click"); 
                }
            }, this));
        }
        if( !this.loaded && this.options.autoExpandInit && this.element.is(":visible") ) {
            this.el.links.first().trigger("click"); 
        }
    },

    onClickTD: function( event ) {
        var self      = this;
        var node      = $(event.target).closest("[template]");
        var link      = $(event.target).closest(this.el.links);
        var row       = $(event.target).closest(this.el.rows);
        var target    = row.next(this.el.targets);

        var ajax               = node.attr("ajax");
        var templateSelector   = node.attr("template");
        var templates          = this.el.templates.filter( templateSelector );
        var spinnerTemplates   = this.el.templates.filter(this.options.spinnerSelector);
        var staticTemplates    = templates.filter("[static]");
        var ajaxTemplates      = templates.not(staticTemplates);
        var templateClassNames = this.getTemplateClassNames( templateSelector );

        // TODO: Add caching and preloading
        if( templates.length && link.length && row.length && node.length ) {
            this.el.targets.hide();
            target.find(this.renderedSelector).empty();
            target.removeClass( this.templateClassNamesAll ).addClass( templateClassNames );

            staticTemplates.each( $.proxy(this.render, this, {}, target) ); // template passed as third param
            
            this.el.rows.removeClass( this.options.selectedRowClass );
            this.el.rows.removeClass( this.options.accentClasses );
            row.addClass( this.options.selectedRowClass );
            link.siblings().removeClass( this.options.selectedCellClass );
            link.addClass( this.options.selectedCellClass );
            this.loaded = true;

            if( ajax ) {
                spinnerTemplates.each( $.proxy(this.render, this, {}, target) ); // template passed as third param

                var counter = ++$.ui.leagueTable.counter; // Semaphore to prevent multiple loading
                $.ajax({
                    type: "GET",
                    url:  ajax,
                    dataType: "json",
                    beforeSend: function( xhr ) {
                    },
                    success: $.proxy(function( json, xhr, status ) {
                        if( counter != $.ui.leagueTable.counter ) { return; }
                        json.matchesurl = this.matchesurl; 	// Add MatchesURL base location for linking
                        json.clubsurl   = this.clubsurl; 	// Add ClubsURL base location for linking
                        json.playersurl = this.playersurl; 	// Add PlayersURL base location for linking
                        json.icalurl 	= this.icalurl; 	// Add iCalURL base location for linking
                        spinnerTemplates.each( $.proxy(this.hide, this, {}, target) );
                        ajaxTemplates.each( $.proxy(this.render, this, json, target) ); // template passed as third param
                    }, this),
                    error: $.proxy(function( xhr, status ) {
                        //console.log('DEBUG: ', this&&this.klass||'' ,' error: function(  ', '  xhr: ',  xhr, ' status: ', status);
                        ajaxTemplates.each( $.proxy(this.renderError, this, null, target) ); // template passed as third param
                    }, this)
                });
            }
        }
    },
    render: function( json, target, index, template ) {
        var renderIn = target.find( template.getAttribute("render") ).empty();
        var rendered = $(template).tmpl(json).appendTo( renderIn );

        target.show();

        $.initWidgets(rendered);
    },
    renderError: function( html, target, index, template ) {
        html = html || "<div class='ajax-error'>Unable to load content</div>";
        
        var renderIn = target.find( template.getAttribute("render") ).empty();
        var rendered = $(html).appendTo( renderIn );
        target.show();
    },
    hide: function( json, target, index, template ) {
        var renderIn = target.find( template.getAttribute("render") ).empty();
    }
});
$.ui.leagueTable.counter = 0;


$.ui.leagueTable.subclass('ui.statsTabs', {
    klass: '$.ui.statsTabs',
    options: {
        matchesurl:	"",
        rows:       "ul.statsFatTabs",
        links:      "ul.statsFatTabs li[ajax]",
        targets:    "div.target",
        autoExpandTabshow:  true,
        autoExpandInit:     true
    },
    _create: function() {
        // Make links with <span class="data">0</span> unclickable
        this.el.links = this.el.links.filter(function() {
            return ($(this).find(".data").text() !== "0");
        });
    }
});
