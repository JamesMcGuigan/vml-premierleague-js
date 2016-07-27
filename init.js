/**
 *  init.js - Application widget initialisation
 *  Loaded immediately after firebugx.js, jquery.js, globals.js
 */
if( typeof QUnit !== "undefined" && !QUnit.loadInitJs ) {
    // Do nothing
    $.noop();
} else {

    // TODO: implement $.ajaxPrefilter to add wrappers for success/complete 
    //       check for status="notmodified", and return cache as stored in HTML5 window.sessionStorage
    //       implement window.sessionStorage for HTML5 browsers 
    //          @see http://github.com/adamayres/jqueryplugins/tree/master/request-storage
    //          @see http://github.com/adamayres/jqueryplugins/tree/master/ajax-cache-response
    //      Question: How does eTag persistance compate with sessionStorage persistance?

    // Set Ajax defaults
    $.ajaxSetup({
        type:       "GET",
        dataType:   "json",
        ifModified: false    // returns data=undefined on 304 Not Modified
    });

    $.ajaxPrefilter( "json", function(options, originalOptions, xhr) {
        xhr.setRequestHeader("Accept", "application/json");
    });

    if( $.getCqEditMode() || $.getTopLevelDomain() === "localhost" ) {
        // define a global AJAX error handler...
        $(document).ajaxError(function(e, xhr, settings, exception) {
            console.warn('AJAX error in: ' + settings.url + ' \n'+'error:\n' + exception);
        });
    }

    // $.browser available flags: webkit, safari, opera, msie, mozilla
    // CSS: .browser-webkit, .browser-safari, .browser-opera, .browser-mozilla, 
    //      .browser-msie, .browser-msie6, .browser-msie7, .browser-msie8, .browser-msie9
    // NOTE: .ext-ie6 flags are only visible when CQ5 is loaded, don't use them for css to be published
    // Modernizr.js uses document.documentElement.className, so we should be safe to modify the DOM before $(document).ready()
    (function() {
        for( var name in $.browser ) {
            if( $.browser[name] === true && name !== "version" ) {
                var version    = parseInt($.browser.version,10);
                var compatMode = false;
                if( name === "msie" && version == 7 && navigator.appVersion.match(/Trident/) ) { version = 9; compatMode = true; }

                var className = " browser-"+name + " browser-"+name+version;              // browser-msie browser-msie6
                if( name === "msie" && version <= 6 ) { className += " browser-msie6";  } // treat all older version of IE as 6
                if( name === "msie" && version <= 7 ) { className += " browser-msie67"; } // common flag to keep the CSS short
                if( name === "msie" && compatMode   ) { className += " browser-msie9compatMode"; } 
                if( name === "msie" && compatMode   ) { $(document).ready(function(){     // Wait till DOM ready
                    if( $("body").hasClass("ext-ie7") ) {                                 // Check for CQ ext.js browser detect
                        $("body").removeClass("ext-ie7").addClass("ext-ie9 ext-ie9-compat");
                    }
                }); }

                document.documentElement.className += className; // $(html).addClass()
            }
        }
    })();
    
    // Add .beforeDocumentReady during load - removeClass needs to be run before $.initWidgets() - it breaks things due to $().width() === 0
    // Use class="hideBeforeDocumentReady" or CSS { visibility: hidden; } - DON'T use {display: none} as it messes up $().width()
    (function() {
        document.documentElement.className += " beforeDocumentReady"; // $(html).addClass()
        $(document).ready(function() { $(document.documentElement).removeClass("beforeDocumentReady"); });         
    })();


    $.updateLoggedInState = function() {
        try {
            var userCookie = $.cookie('pluser');
            if( userCookie ) {
                userCookie = userCookie.substring(1, userCookie.length-1);
                userCookie = Base64.decode(userCookie);
                window.userObject = JSON.parse(userCookie); // global! (for fanzone)
                $('div.login').hide();
                $('div.loggedin p.memberName').append('Welcome, '+userObject.user.firstName +' '+userObject.user.lastName);
                $('div.loggedin').show();
                $('.siteutils li.login','#masthead').hide();
                $('.siteutils li.logout,.siteutils li.myaccount','#masthead').show();
            }  
        } catch(e) {
            console.error("$.updateLoggedInState(): userCookie: ", userCookie, ", Exception:", e );
            console.dir( e );
        }
    };
    
    $(document).ready( function() {
        // Now we have access to the full set of libraries

        try {
            $.cqEditMode = $.getCqEditMode(); // @see libs/jquery.extensions.js
            
            // Refresh the page if we switch from CQ edit mode to CQ preview mode
            // This is needed to make the meganav refresh correctly
            // CQ will refresh the page for us on the transition the other way round
            if( $.cqEditMode ) {
                 setInterval(function () {
                    if( !$.getCqEditMode() ) {
                        location.reload();
                    }                    
                 }, 1000);
            }
        	

            /**
             *   Bind a custom event into which we fire values to trigger track events, e.g
             *   $('body').trigger("YWAEvent.track",["cf",22,"Facebook"])
             */
            window.YWABeacon = $.el('div');
            window.YWABeacon.bind("YWAEvent:track",$.ywaTrack);
            
            $.updateLoggedInState();

            // This is where all the action happens
            // @see libs/jquery.extensions.js - $.initWidgets(rootNode)
            // @see widgets/miniwidgets.js    - $.miniwidgets(rootNode)
            $.initWidgets( document.body );


        } catch(e) {
            console.error("init.js: Exception:", e );
            console.dir( e );
            debugger;
        }    
    });
    
}
