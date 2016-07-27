/* 
 *  MODAL JS
 *  VML KC 2011
 *  
 *  DESCRIPTION: 
 *      A jquery.DOMWindow extension to render specific media types.  It's pretty much a pre-processor for
 *      DOMWindow that formats the media being displayed to a user.
 *  DEPENDENCIES:
 *      jquery.DOMWindow (http://swip.codylindley.com/DOMWindowDemo.html) 
 *      swfObject ()
 */

$.ui.basewidget.subclass('ui.mediamodal', {

    klass: "$.ui.mediamodal",

    //MOST of these options are the DOMWindow jquery plugin defaults
    options: {
        anchoredClassName:'',
        anchoredSelector:'',
        borderColor:'#333',
        borderSize:'0',
        draggable:0,
        eventType:null, //click, blur, change, dblclick, error, focus, load, mousedown, mouseout, mouseup etc...
        fixedWindowY:100,
        functionCallOnOpen:null,
        functionCallOnClose:null,
        height:-1,
        loader:0,
        loaderHeight:0,
        loaderImagePath:'',
        loaderWidth:0,
        modal:0,
        overlay:1,
        overlayColor:'#000',
        overlayOpacity:'85',
        positionLeft:0,
        positionTop:0,
        positionType:'centered', // centered, anchored, absolute, fixed
        width:-1,
        windowclass:'',
        windowBGColor:'#000',
        windowBGImage:null, // http path
        windowHTTPType:'get',
        windowPadding:0,
        windowSource:'inline', //inline, ajax, iframe
        windowSourceID:'',
        windowSourceURL:'',
        windowSourceAttrURL:'href',
        eventManager: null,
        mediaType: '', 
        modalheight: -1,
        modalwidth: -1,
        autoHeight: false,
        flashVars: '',
        onAuthSuccess: '',
        _tmpl_yahoo_video : function( flash_vars ) {
            return ' ' +
            '<div class="video-container"> ' +
            '   <div class="epl_top_container"> ' +
            '       <div class="spon_left"> <script language="JavaScript" type="text/javascript" src="http://uk.adserver.yahoo.com/a?f=2144372856&p=&l=EVL2&c=r"></script></div> ' +
            '       <div class="spon_right"> <script language="JavaScript" type="text/javascript" src="http://uk.adserver.yahoo.com/a?f=2144372856&p=&l=EVL&c=r"></script> </div> ' +
            '       <div class="epl_clear"> </div> '+
            '   </div> ' +
            '   <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="500" id="yahoovideoplayer1"> ' +
            '       <param name="allowScriptAccess" value="always" /> '+
            '       <param name="allowfullscreen" value="true" /> '+
            '       <param name="movie" value="http://d.yimg.com/nl/premier-league/site/player.swf"/> '+
            '       <param name="flashVars" value="'+ flash_vars +'"/> '+
            '       <param name="browseCarouselUI" value="hide"> '+
            '       <param name="wmode" value="transparent"/> '+
            '       <embed allowfullscreen="true" id="yahoovideoplayer1" src="http://d.yimg.com/nl/premier-league/site/player.swf" type="application/x-shockwave-flash" allowscriptaccess="always" flashvars="'+ flash_vars +'" width="640" height="500"/> '+
            '   </object> '+
            '</div>';
        }
    },

    _create : function() {
        this.el = {};
        this.options.hash = {};
        this.el.targets = this.element.find( 'a' );
        this.options = $.getAttributeHash( this.element, this.options );
        /*- Convert any modalheight and modalwidth parameters to 
            height and width ( done to protect the styling of the dom ) -*/
        this.options.height = parseInt( this.options.modalheight, 10 );
        this.options.width = parseInt( this.options.modalwidth, 10 );
    },

    _init : function() {

        var self        = this;
        var $targets    = $( this.el.targets );
        
        $targets.click( function( e ) {

            e.preventDefault();
            var $target = $( this );

            // Media Types allowed for the modal
            switch( self.options.mediaType ){
                case 'video':
                    self.open_video( $target, self.options, self ); break;
                case 'game':
                    self.open_game( $target, self.options, self ); break;
                case 'photo':
                    self.open_photo( $target, self.options, self ); break;
                case 'audio': break;
                default:
                    self.open_html( $target, self.options, self ); break;
            }

        });
        
    },

    _commonOnOpen : function( defaults ) {
        var liquidHeight = defaults.autoHeight === "true" || defaults.autoHeight === true;
        
        if( liquidHeight )
            $( '#DOMWindow' ).height( 'auto' ); 

        if( $( '#defaultDOMWindowClose' ).length <= 0 ){
            var $closeWindowLink = $("<a/>", {
                "id"    : "defaultDOMWindowClose",
                "class" : "closeDOMWindow",
                "href"  : "#",
                text    : "Close"
            });
            $closeWindowLink.appendTo( $( '#DOMWindow' ) );
        }

        // Pass defaults to the dom so the login modal can read them
        $( '#DOMWindow' ).data( 'mediamodal', defaults );
    },

    _hasExtension : function( expected_ext, target ) {
        
        // get file extension
        var filepath = target.attr( 'href' );
        var ext = filepath.substr( filepath.lastIndexOf( '.' ) + 1 );
        
        //if var ext != 'expected_ext', change the mediamodal load to a "pseudo-html-mediamodal" type 
        //by setting the media defaults before calling this, and then follow the html-media-type actions
        if( ext !== expected_ext ) { return false; }
        return true;

    },

    _psudoHtmlMedia : function( trigger, defaults, self ) {

        defaults.windowSource = 'iframe';
        defaults.autoHeight = true;
        return self.open_html( trigger, defaults, self );

    },

    open_html : function( trigger, defaults, self ) { 
        
        var html_url = trigger.attr( 'href' );

        //htmlmedia default width and height
        if( defaults.height === -1 ) defaults.height = 560;
        if( defaults.width === -1 ) defaults.width = 640;

        //htmlmedia default class name - only inserted if there is none set
        if( defaults.windowclass === '' ){
            defaults.windowclass = 'modal_html';
        }

        //htmlmedia types for inline, iframe, or the default (ajax)
        if( defaults.windowSourceID !== '' ) {

            var debug_msg = 'this is an inline html call';

        } else if( defaults.windowSource === 'iframe' ) {

            defaults.windowSourceURL = html_url;
            var debug_msg = 'this is an iframe html call';

        } else {

            defaults.windowSource = 'ajax';
            defaults.windowSourceURL = html_url;
            var debug_msg = 'this is an AJAX html call';

        }

        defaults.functionCallOnOpen = function() {

            //common tasks
            self._commonOnOpen( defaults );

            //check if the site loaded the page or if it failed
            if( $( '#DOMWindow' ).children().length < 0 ){
                console.error( 'ERROR: The url ('+defaults.windowSourceURL+') did not load' );
                $.closeDOMWindow();
            }

        };

        return $.openDOMWindow( defaults );
    },

    open_photo : function( trigger, defaults, self ) {

        defaults.windowclass = 'modal_video';

        if( defaults.height === -1 ) defaults.height = 560;
        if( defaults.width === -1 ) defaults.width = 640;

        defaults.functionCallOnOpen = function() {
            //insert the image, preload, then fade in the image
            $( '<img/>', { src: $( trigger ).attr( 'href' ), alt:'' } )
                .fadeTo( 0, 0 )
                .load( function() {
                    $( '#DOMWindow' ).append( this );
                    self._commonOnOpen( defaults ); //common tasks
                    $( this ).fadeTo( 800, 1 );
                });
        };

        return $.openDOMWindow( defaults );
    },

    open_video : function( trigger, defaults, self ) {

        var flash_vars = trigger.attr( 'rel' );
        defaults.windowclass = 'modal_video';
        
        if( defaults.height === -1 ) defaults.height = 475;
        if( defaults.width === -1 ) defaults.width = 776;

        //insert the template with the proper playlist and selected video (via flash vars)
        defaults.functionCallOnOpen = function() {
            self._commonOnOpen( defaults ); //common tasks
            var tmpl = defaults._tmpl_yahoo_video( flash_vars );
            $( '#DOMWindow' ).append( tmpl );
        };

        return $.openDOMWindow( defaults );

    },

    open_game : function( trigger, defaults, self ) {
        var game_url = $( trigger ).attr( 'href' );
        defaults.windowclass  = 'modal_game';

        //default height/width for a game if none specified
        if( defaults.height === -1 ) defaults.height = 475;
        if( defaults.width === -1 ) defaults.width = 776;

        //if the game is not an swf, change the mediamodal load to a "pseudo-html-mediamodal" type 
        //by setting the media defaults to the game defaults, and then follow the html-media-type actions
        
        if( !self._hasExtension( 'swf', trigger ) ) {
            defaults.windowSource = 'iframe';
            self.open_html( trigger, defaults, self );
            return;
        }
        
        defaults.functionCallOnOpen = function() {

            var flashvars = {};
            var attributes = {};
                attributes.id = 'flashContent';
            var params = {};
                params.allowscriptaccess = 'always';
                params.wmode = 'transparent';

            self._commonOnOpen( defaults ); //common tasks

            //container for the swf that will be generated below
            $( '#DOMWindow' ).append( $( '<div>', { id: 'flashContent' } ) );

            //set the url base of the game ( so the swf loads external files properly )
            //assumes that the base will always be the same url directory as the swf.
            if( game_url.lastIndexOf( '/' ) !== -1 ) {
                params.base = game_url.substring( 0, game_url.lastIndexOf( '/' ) + 1 );
            }

            //extend and/or override flashvars
            if( defaults.flashVars !== '' ) {
                $.extend( flashvars, eval( defaults.flashVars ) );
            }

            //embed the swf in the domwindow content
            swfobject.embedSWF(
                game_url, 
                "flashContent", 
                defaults.width, defaults.height, 
                "10.0.0", 
                "/flash/expressInstall.swf", 
                flashvars, params, attributes );
        };

        return $.openDOMWindow( defaults );
    }
});

