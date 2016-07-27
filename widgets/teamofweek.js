$.ui.basewidget.subclass('ui.teamofweek', {
    klass: '$.ui.teamofweek',
    // TODO: Ajax Prefix not passing through
    options: {
        teamNodes:      ["gk","de1","de2","de3","de4","de5","mf1","mf2","mf3","mf4","mf5","st1","st2","st3"],
        //towTab:         "",
        ajaxPrefix:     "",
        ajaxPostfix:    "_jcr_content.infinity.json",
        targetSelector: ".target"
    },
    _create: function() {
        this.el = {};
        
        this.el.form       = this.element.findAndSelf("form");
        this.el.target     = this.element.find(this.options.targetSelector);
        this.el.season     = this.el.form.find("select[name=season]");
        this.el.week       = this.el.form.find("select[name=week]");
        this.el.ajaxPrefix = this.el.form.find("input[name=ajaxPrefix]");
    },
    _init: function() {
        //this.el.inputs.bind("change", $.proxy(this.onChange, this) );
        //if( this.options.hideSubmit ) {
        //    this.el.submit.hide();
        //}
        
        var self = this;
        this.el.form.bind("submit", function() {
            self.onSubmit();
            return false;
        });
        this.onSubmit();
    },
    getAjaxUrl: function() {
        var ajaxUrl = this.options.ajaxPrefix
            //+ "/" + this.options.towTab
            + "/" + this.el.season.val()
            + "/" + this.el.week.val()
            + "/" + this.options.ajaxPostfix;
        
        //ajaxUrl = ajaxUrl.replace("/"+this.options.towTab+"/"+this.options.towTab, "/"+this.options.towTab );
        //ajaxUrl = ajaxUrl.replace("\/\/","/");
        
        return ajaxUrl; 
    },
    onSubmit: function() {
        var self = this;
        this.renderSpinner();
        $.ajax({
            url:      this.getAjaxUrl(),
            type:     "GET",
            dataType: "text",
            success: function( data ){
                self.renderData( data );
            }
        });     
    },    
    renderSpinner: function() {
        if( this.el.target.is(":empty") ) {
            this.el.target.html("<div class='spinner'><span>Loading...</span></div>");
        }
    },
    renderData: function(data) {
        var JSON = (jQuery.parseJSON(data));
        //var append = $.el("div").addClass("team-wrapper");
        //var thisSpan = $.el("span").addClass("key");
        //thisSpan.append("<p>Latest points 63 &nbsp; Index rank (116)</p>");
        //append.append(thisSpan);
        
        // $(teamNodes).each(function(i,v){
        /*
        var html = "<div class='team-wrapper'>";
            + "<span class='key'>"
            + "<p>Latest points 63 &nbsp; Index rank (116)</p>"
            + "</span>";
        
        */
        //CHECK TO SEE WHICH TAB IS BEING RENDER - BECAUSE FPL DOES NOT HAVE A RANK
        whichTab = this.options.ajaxPrefix;
        whichTab = whichTab.substring(whichTab.length-3,whichTab.length);

        var html = '';
        rowMemberCount=0;   
        lastNode='';
        htmlHolder='';
        
        for(i=0; i<this.options.teamNodes.length; i++ ) {
            var teamNode = this.options.teamNodes[i];
            var currentNodeRow = teamNode.substring(0, 2);
            if (currentNodeRow==lastNode) {
            	// Nothing
            } else if(html != ""){
                //new row
                htmlHolder 	  += '<div class="rows_' + rowMemberCount + '">'+html+'</div>';
                html 		   = '';
                rowMemberCount =0;
            }

            var player = JSON[teamNode]; 
            
            if (player && player.player != "N/D" && player.player != '') {
                html += "<div class='"+teamNode+"'>";
                if(player.image.fileReference){
                    html += '<img src="'+player.image.fileReference+'" alt="" />';
                }
                else{
                    html += '<img src="'+player.kitref+'" alt="" />';
                }
                if (player.player) {
                    html += "<p>"+player.player+"</p>";
                }
                if (player.score){
                    html += "<p>"+player.score;
                }
                if (player.rank && whichTab != 'fpl'){
                    html +=" ("+player.rank+")</p>";
                }
                if (player.score || (player.rank && whichTab != 'fpl')) {
                	html +="</p>";
                }
                html +="</div>";
                rowMemberCount++;
            }
            //do the first record
            if (i==0) {
                //new row
                htmlHolder += '<div class="rows_' + rowMemberCount + '">'+html+'</div>';
                html = '';
                rowMemberCount=0;
            }
            //do the last row
            if (i==this.options.teamNodes.length-1) {
                htmlHolder += '<div class="rows_' + rowMemberCount + '">'+html+'</div>';
            }
            lastNode = currentNodeRow;
        };
        html += "</div>";
        var tempHtmlHolderForRender = "<div class='team-wrapper'></span>"+htmlHolder+"</div>";    
        this.el.target.empty().html(tempHtmlHolderForRender);
    }
});
