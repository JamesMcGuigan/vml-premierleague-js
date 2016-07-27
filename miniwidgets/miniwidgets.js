/**
 *  Initializes miniwidgets marked by html lookups, but without the whole UI widgets overhead
 *  NOTE: This is init code, any uncaught exceptions here will kill all the javascript on the page
 *  @param  {jQuery} rootNode   rootNode to search from, includes self
 *  @return {jQuery}            list of nodes marked as widget
 */
$.initMiniWidgets = function( rootNode ) {
    try {
        $('input.auto-clear', rootNode).each(function() {
            var def = this.value;
            this.onfocus = function() {
                if( this.value == def ) {
                    this.value = "";
                    this.style.color = "#333";
                }
            };
            this.onblur = function() {
                if( this.value == "" ) {
                    this.value = def;
                    this.style.color = "#999";
                }
            };
        });
    } catch( e ) {
        console.error("$.initMiniWidgets(): exception: $(input.auto-clear,",rootNode,"): " );
        console.dir(e);
    }



    try {
        $('a.ext,a[rel=external],a[href^=http]', rootNode).each(function() {
            if(!( this.getAttribute("href").match( $.getTopLevelDomain() ) )) {
                // rel="external" doesn't actually trigger a new window, we need target="_blank" for that
                this.setAttribute("rel", String(this.getAttribute("rel")).replace(/external|null/, '') + " external" );
                this.setAttribute("target","_blank");
            }
        });
    } catch( e ) {
        console.error("$.initMiniWidgets(): exception: $('a.ext,a[rel=external],a[href^=http]', rootNode).each(function() {");
        console.dir(e);
    }

};
