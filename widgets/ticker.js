$.ui.basewidget.subclass('ui.ticker', {
    klass: "$.ui.ticker",
    options: {
        visible:         9,          // {Number}      maximum number of ticker items visable as per design
        position:        0,          // {Number}      start position, counting from the right hand side
        ajax:            "/ajax/site-header.json",                      // {String}      url to poll for updates to matchday items
        ajaxFixtures:    "/ajax/site-header/ajax-all-fixtures.json",
        ajaxResults:     "/ajax/site-header/ajax-all-results.json",
        ajaxAll:         "/ajax/site-header/ajax-all-matches.json",
        ajaxLiveTvUrl:   "/content/premierleague-ajax/livetvbymatch.ajax",
        ajaxInterval:    60000,      // {Number}      ms for ajax poll frequency
        scrollBuffer:    5,          // {Number}      how close to the edge can you scroll before loading the full data set
        filter:          "*"         // {String}      [optional] "*", ".PRE_MATCH", ".POST_MATCH"
    },
    required: {
        visible:  Number,
        position: Number,
        ajax:     String,
        filter:   String
    },
    items:               null,    // {Hash<jQuery>}    jQuery references to ticker tape items
    _ajaxResultsLoaded:  false,   // {Boolean}         Have the full set of results been loaded
    _ajaxFixturesLoaded: false,   // {Boolean}         Have the full set of results been loaded

    //***** Init *****//

    _create: function() {
        this.matchIndex = {};
        this.oldData    = {};

        this.el.ul             = this.element.find(".ticker-tape ul");
        this.el.nextArrow      = this.element.find(".ticker-arrow-next");
        this.el.prevArrow      = this.element.find(".ticker-arrow-prev");
        this.el.template       = this.element.find(".template");
        this.el.filters        = this.element.find(".ticker-filter li");

        this.onlyPostMatchFlag = this.el.ul.hasClass("ONLY_POST_MATCH");
        this.position = Number(this.options.position);

        this.registerAjaxPoller( this.options.ajax );
        this.registerEventManager();
        this.addEventListeners();

        this.renderLiveTV = $.proxy( this.renderLiveTV, this ); // $.proxy so we have a unique function to pass to DataCache
        DataCache.register( this.options.ajaxLiveTvUrl, this.renderLiveTV );
    },
    /**
     *  This function is called on init, and after the ticker is scrolled
     */
    _init: function() {
        this.lookupItems();
        this.setPosition(); // Uses this.position by default
        this.onlyPostMatchFix();

        DataCache.lazyLoad( this.options.ajaxLiveTvUrl, this.renderLiveTV );
    },
    destroy: function() {
        this.unregisterAjaxPoller();
        this._super();
    },


    /**
     *  This is a failsafe for any bugs causing jsp exceptions inside .template
     *  We lose the ability to dynamically update the ticker, but we ensure we don't blat it with a JSP exception
     */
    _isTemplateValidAnswer: null,
    isTemplateValid: function() {
        if( this._isTemplateValidAnswer === null ) {
            var isValid  = false;
            var html     = "";
            var template = null;
            try {
                html = this.el.template.html();
                template = $(html);
                if( template && template.length === 1 && template[0].nodeName === "LI" ) {
                    isValid = true;
                }
                template.remove();
            } catch( e ) {
            }
            if( isValid === false ) {
                console.error(this.klass+":isValidTemplate(): invalid template:" + this.el.template, html, " - this: ", this );
            }
            this._isTemplateValidAnswer = isValid;
        } 
        return this._isTemplateValidAnswer;
    },

    lookupItemsInit: function() {
        if(!( this.items && this.items.loaded )) {
            this.lookupItems();
        }
    },
    lookupItems: function() {
        $.jQueryGC( this.items );
        this.items = {};

        this.items.all        = this.element.find(".ticker-tape ul li").not(".template");
        this.items.filtered   = this.items.all.filter(this.options.filter);
        this.items.POST_MATCH = this.items.all.filter(".POST_MATCH").not(".SAME_MATCH_DAY");
        this.items.LIVE       = this.items.all.filter(".LIVE,.SAME_MATCH_DAY");
        this.items.PRE_MATCH  = this.items.all.filter(".PRE_MATCH");

        // Cached node lookup - we want polling to be quick - allows for duplicate IDs
        this.items.id = {};
        for( var i=0, n=this.items.all.length; i<n; i++ ) {
            var matchId = this.items.all[i].getAttribute("matchId");
            if( this.items.id[matchId] ) {
                //console.warn(this.klass+":lookupItems(): duplicate matchId: ", matchId, ' nodes: ', this.items.id[matchId], " - this: ", this);
                this.items.id[matchId].remove(); // Sometimes we get duplicate Ids when PA send test data, keep latest match
                this.items.id[matchId] = this.items.id[matchId].add( this.items.all[i] );
            } else {
                this.items.id[matchId] = $(this.items.all[i]);
            }
        }
        this.items.loaded = true;
    },
    removeDuplicateMatchIds: function() {
        for( var matchId in this.items.id ) {
            if( this.items.id[matchId].length >= 2 ) {
                var last = this.items.id[matchId].last();
                this.items.id[matchId].not(last).remove();
            }
        }
    },

    addEventListeners: function() {
        // Scroll the list right, to the future
        this.el.nextArrow.bind("click", { widget: this }, function(event, ui) {
            if( $(this).hasClass("disabled") ) { return; }
            event.data.widget.moveNext.call( event.data.widget );
        });

        // Scroll the list left, to the past
        this.el.prevArrow.bind("click", { widget: this }, function(event, ui) {
            if( $(this).hasClass("disabled") ) { return; }
            event.data.widget.movePrev.call( event.data.widget );
        });

        this.el.filters.bind("click", { widget: this }, function(event, ui) {
            if( $(this).hasClass("selected") ) { return; }

            event.data.widget.setFilter( this.getAttribute("filter") );
            event.data.widget.el.filters.removeClass("selected");
            $(this).addClass("selected");
        });
        this.el.filters.css("cursor", "pointer");


        // Nasty hardcodedness for links to ticker icons, nested <a href=""> are illegal
        this.element.find(".ticker-tape").bind("click", function(event) {
            var target = $(event.target);
            var li     = target.closest("li");
            var href   = target.closest("a").attr("href") || "";
            var icon   = target.closest(".ticker-broadcaster, .ticker-icons");

            if( href && icon.length ) {
                if(!( href.match(/\.html/) )) {
                    console.log('DEBUG: ', this&&this.klass||'' ,' ticker link doesn\'t contain .html');
                }

                // Broadcaster icon - has child image
                if( icon.hasClass("ticker-broadcaster") && icon.find("img").length ) {
                    event.preventDefault();
                    document.location = href.replace(/^(.*)\.html/, '$1.tv-radio.html');
                    return false;
                }

                // Tickets icon - has TX class on li
                // We have no way of determining if we clicked on the icon or the html block element
                if( icon.hasClass("ticker-icons") && li.hasClass("TX") ) {
                    event.preventDefault();
                    document.location = href.replace(/^(.*)\.html/, '$1.tickets.html');
                    return false;
                }
            }

            // else do nothing, allow the default <a href=""> click handler to work its magic
        });
    },
//    addLinkClickHandlers: function() {
//        this.el.links.find("a").bind("click", function(event) {
//            // @context {this.element}
//        });
//    },
    registerEventManager: function() {
        EventManager.register( this, "ticker.moveNext",     this.moveNext );
        EventManager.register( this, "ticker.movePrev",     this.movePrev );
        //EventManager.register( this, "ticker.removeItem",   this.removeItem );
        //EventManager.register( this, "ticker.addItem",      this.addItem );
        EventManager.register( this, "ticker.ajaxPollHandler", this.ajaxPollHandler );
    },
    renderLiveTV: function( json ) {
        this.lookupItemsInit();

        // TODO: If we implement polling, we may need to iterate over the entire set of ticker items,
        //       to remove items that are not in the ajax data set
        var fixtureList = json && json.fixtureList || [];
        for( var i=0, n=fixtureList.length; i<n; i++ ) {
            var fixture = fixtureList[i];
            if( fixture && fixture.matchId && this.hasItem(fixture.matchId) ) {
                if( fixture.channel || fixture.channelImage ) {
                    var altText = (fixture.channel || "").split(/[\W\s]+/).map(function(item){return item.capitalize();}).join(" ");
                    var channelImage = fixture.channelImage ? "<img src='"+fixture.channelImage+"' alt='"+altText+"'/>" : altText;
                } else {
                    var altText      = "";
                    var channelImage = "";
                }
                this.getItem(fixture.matchId).find(".ticker-broadcaster").html(channelImage);

                if( fixture.tickets ) {
                    this.getItem(fixture.matchId).addClass("TX");
                } else {
                    this.getItem(fixture.matchId).removeClass("TX");
                }
            }
        }
    },
    registerAjaxPoller: function( url ) {
        if( !this.isTemplateValid() ) { return; }

        AjaxPoller.register({
            url:          url,
            type:         "GET",
            interval:     this.options.ajaxInterval,
            dataType:     "json",
            handler:      [this, this.ajaxPollHandler]
        });
    },
    unregisterAjaxPoller: function() {
        AjaxPoller.unregister({
            handler:      [this, this.ajaxPollHandler]
        });
    },

    //***** Getters/Setters *****//

    firstItem: function() {
        return this.items.visible.first();
    },
    lastItem: function() {
        return this.items.visible.last();
    },
    nextItems: function() {
        if( this.items.visible.length ) {
            return this.items.visible.last().nextAll( this.options.filter );
        } else {
            return this.items.filtered.last();
        }
    },
    prevItems: function() {
        if( this.items.visible.length ) {
            return this.items.visible.first().prevAll( this.options.filter );
        } else {
            return this.items.filtered.first();
        }
    },

    /**
     * @param  {Number} matchId
     * @return {jQuery}
     */
    getItem: function( matchId ) {
        return this.items.id[ matchId ] || $([]);
    },
    setItem: function( matchId, item ) {
        this.items.id[ matchId ] = item;
    },
    hasItem: function( matchId ) {
        return !!( this.items.id[matchId] && this.items.id[matchId].length );
    },


    /**
     *  Position is defined as offset from first matchday item
     */
    getPositionZero: function() {
        var positionZero = 0;
        switch( this.options.filter ) {
            default:
            case "*":           positionZero = this.items.POST_MATCH.length; break;  // First Live Match on Left - Arrows both ways
            case ".PRE_MATCH":  positionZero = 0; break;                             // First Fixture on Left    - Arrow future
            case ".POST_MATCH": positionZero = this.items.filtered.length; break;    // Last Result on Right     - Arrow past
        }
        return positionZero;
    },
    getPosition: function() {
        return this.position;
    },
    setPosition: function( position ) {
        this.lookupItemsInit();

        if( typeof position === "undefined" ) { position = this.position; }
        var positionZero  = this.getPositionZero();
        var visible       = this.options.visible;

        this.position = Math.max( -positionZero, Math.min( position, this.items.filtered.length - positionZero - visible ));
        this.items.all.hide(); // Premature Optimization: this.items.visible.hide(); instead, possibly buggy
        this.items.visible = this.items.filtered.slice( this.position + positionZero, this.position + positionZero + visible ).show();
        this.updateArrows();
    },

    setFilter: function( filter ) {
        this.lookupItemsInit();

        this.options.filter = filter;
        this.items.filtered = this.items.all.filter( this.options.filter );
        this.setPosition(0);
    },
    updateArrows: function() {
        // Check the arrows have the right state
        if( this.nextItems().length === 0 ) {
            this.el.nextArrow.addClass("disabled");
        } else {
            this.el.nextArrow.removeClass("disabled");
        }

        if( this.prevItems().length === 0 ) {
            this.el.prevArrow.addClass("disabled");
        } else {
            this.el.prevArrow.removeClass("disabled");
        }
    },

    //***** Commands *****//

    moveNext: function() {
        this.setPosition( this.getPosition() + 1 );
        if( !this._ajaxFixturesLoaded && this.nextItems().length < this.options.scrollBuffer ) {
            this.ajaxLoadFixtures();
        }
    },
    movePrev: function() {
        this.setPosition( this.getPosition() - 1 );
        if( !this._ajaxResultsLoaded && this.prevItems().length < this.options.scrollBuffer ) {
            this.ajaxLoadResults();
        }
    },

    /**
     *  @note   Need to run lookupItems() after calling this function
     *  @return {Hash}   matchData  { matchId: 3285269, matchName: "AST v LIV", boxText: "FT", date: "29/02/12", time: "16:00", dateStatus: "fixture", timeStatus: "future" }
     *  @return {jQuery}            updated node
     */
    updateItem: function( itemData ) {
        if( !this.isTemplateValid() ) { return; }

        var matchId = itemData.matchId;
        var node  = this.getItem(matchId);
        var clone = this.el.template.tmpl(itemData).insertAfter(node.last()); // BUG: sometimes we get duplicate match IDs 
        node.remove();

        this.setItem( matchId, this.getItem(matchId).not(node).add(clone) ); // update cache
        return clone;
    },

    //***** Ajax Commands *****//

    ajaxLoadFixtures: function() {
        if( !this.isTemplateValid() ) { return; }

        this._ajaxFixturesLoaded = true;
        $.ajax({
            type: "GET",
            url: this.options.ajaxFixtures,
            success: $.proxy( function(json, xhr, status) {
                // Redraw all Fixtures
                var jsonList = this.reformatMatchData(json); // Index by ID and reformat
                this.items.PRE_MATCH.remove();
                this.el.template.tmpl(jsonList).appendTo( this.el.ul );
                this._init();
            }, this),
            error: $.proxy( function(xhr, status) {
                this._ajaxFixturesLoaded = false;
            }, this)
        });
    },
    ajaxLoadResults: function() {
        if( !this.isTemplateValid() ) { return; }

        this._ajaxResultsLoaded = true;
        $.ajax({
            type: "GET",
            url: this.options.ajaxResults,
            success: $.proxy( function(json, xhr, status) {
                // Redraw all Results
                var jsonList = this.reformatMatchData(json); // Index by ID and reformat
                this.items.POST_MATCH.remove();
                this.el.template.tmpl(jsonList).prependTo( this.el.ul );
                this._init();
            }, this),
            error: $.proxy( function(xhr, status) {
                this._ajaxResultsLoaded = false;
            }, this)
        });
    },
    ajaxLoadAll: function() {
        if( !this.isTemplateValid() ) { return; }

        this._ajaxResultsLoaded  = true;
        this._ajaxFixturesLoaded = true;
        $.ajax({
            type: "GET",
            url: this.options.ajaxAll,
            success: $.proxy( function(json, xhr, status) {
                // Redraw all Results
                var jsonList = this.reformatMatchData(json); // Index by ID and reformat
                this.items.all.remove();
                this.el.template.tmpl(jsonList).prependTo( this.el.ul.empty() );
                this._init();
            }, this),
            error: $.proxy( function(xhr, status) {
                this._ajaxResultsLoaded  = false;
                this._ajaxFixturesLoaded = false;
            }, this)
        });
    },

    /**
     *  Takes an id hash of itemData and adds any newly created nodes
     *  @param {Hash} matchData  { siteHeaderSection: { matches: [ { matchName: "AST v LIV", id: 3285269, type: "FT", date: 1306076400000 }, ... ]}}
     */
    ajaxPollHandler: function( json, status, xhr ) {
        if( !this.isTemplateValid() ) { return; }

        this.lookupItemsInit();

        var jsonList = this.reformatMatchData(json); // Index by ID and reformat
        var jsonHash = $.indexArrayByKey( jsonList, "matchId" ); // same format as this.matchId

        // Assumptions - no new items are created or destroyed
        //             - we only poll for updates on matchDay and surrounding items
        if( this.items.all.length === 0 ) {
            // Nothing got loaded first time, so lets just dump all our JSON onto the page
            this.el.template.tmpl(jsonList).prependTo( this.el.ul.empty() );
        } else {
            for( var matchId in jsonHash ) {
                var matchData = jsonHash[matchId];

                // TODO: should we hash these entries to reduce DOM updates
                if( this.hasItem(matchId) ) {
                    this.updateItem(matchData);
                } else {
                    // NOTE: This may just be a data issue
                    //console.warn(this.klass,':ajaxPollHandler(json,status,xhr) - matchId (', matchId,') not found for matchData: ', matchData, ' in jsonHash: ', jsonHash);
                    $.noop();
                }
            }
        }
        this._init();
    },

    onlyPostMatchFix: function() {
    	// Position is ill defined if the JSP sets the ONLY_POST_MATCH
        if( this.onlyPostMatchFlag && this.items.all.length > this.items.POST_MATCH.length ) {
    		this.el.ul.removeClass("ONLY_POST_MATCH");
    		this.onlyPostMatchFlag = false;
    		this.setPosition(0);
        }
    },


    //***** Data Services *****//

    /**
     * @param  {Hash} json { siteHeaderSection: { matches: [ { matchName: "AST v LIV", id: 3285269, type: "FT", date: 1330552800 }, ... ]}}
     * @return {Array}     [ {matchId: 3285269, matchName: "AST v LIV", boxText: "FT", date: "29/02/12", time: "16:00", dateStatus: "fixture", timeStatus: "future"}, ... ]
     */
    reformatMatchData: function( json ) {
        var matches = [];

        // Keep in sync with: apps/premierleague/components/content/ticker/ticker.jsp
        if( json && json.siteHeaderSection && json.siteHeaderSection.matches instanceof Array ) {
            for( var i=0, n=json.siteHeaderSection.matches.length; i<n; i++ ) {
                matches.push( this.reformatMatchDataEntry(json.siteHeaderSection.matches[i]) );
            }
        } else {
            console.warn( this.klass+":reformatJson(json): json.siteHeaderSection.matches not defined: ", json, this );
        }
        //matches = matches.sort( function(a,b) { return Number(b.timestamp) - Number(a.timestamp); });
        return matches;
    },

    /**
     *  @see http://venus:20284/league-table/date-timeline/100/2010-2011/02-02-2011/CURRENT_STANDINGS.json
     *  @param  {Hash}  CURRENT_STANDINGS.json:siteHeaderSection.matches[i]
     *  @return {Hash}  modified version of the above
     */
    reformatMatchDataEntry: function( matchData ) {
        try {
            matchData.cssClass = "";

            // Add/Reformat Fields
            var timestamp = new Date(matchData.timestamp);
            var today = (new Date()).toString("dd/MM/yy");
            matchData.date = timestamp.toString("dd/MM/yy");
            matchData.time = timestamp.toString("HH:mm");
            if( today === matchData.date ) {
                matchData.date = "TODAY";
                if( matchData.matchState !== "SAME_MATCH_DAY" ) {
                    matchData.cssClass = "SAME_MATCH_DAY";
                }
            }


            matchData.matchName = "";
            var homeTeam = matchData.homeTeamCode;
            var awayTeam = matchData.awayTeamCode;
            if( matchData.score && matchData.matchState !== "PRE_MATCH"  ) {
                var homeScore = matchData.score.home;
                var awayScore = matchData.score.away;
                matchData.matchName = homeTeam + " " + homeScore + "-" + awayScore + " " + awayTeam;
            } else {
                matchData.matchName = homeTeam + " v " + awayTeam;
            }

            // Set boxText, normally time, but possibly LIVE, HT or FT
            // Ignore: PT, FHS, SHS keys
            matchData.boxText = "";
            if( matchData.matchStateKey === "FT"
             || matchData.detailedStateKey === "FT" ) {
                matchData.boxText = "FT";
            }
            // Full Time matches have both POST_MATCH && SAME_MATCH_DAY
            else if( matchData.matchState === "POST_MATCH" && matchData.detailedState === "SAME_MATCH_DAY" ) {
                matchData.boxText = "FT";
            }
            else if( matchData.matchState === "LIVE" && matchData.detailedState === "HALF_TIME" ) {
                matchData.boxText = "HT";
            }
            else if( matchData.matchState === "LIVE" ) {
                matchData.boxText = "LIVE";
            }
            else {
                matchData.boxText = matchData.time;
            }

            //// Add hashCode
            //matchData.hashCode = "";
            //for( var key in matchData ) {
            //    matchData.hashCode += String(matchData[key]);
            //}
      } catch(e) {
          console.log('EXCEPTION: ', this&&this.klass||'' ,' reformatMatchData: function(',matchData,') ',  e);
          console.dir(e);
      }
      return matchData;
    }
});

