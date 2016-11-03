<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globaldatavars.jsp"%>

<%@page import="com.premierleague.cmsimportutil.api.DataArray"%>
<%@page import="com.premierleague.cmsimportutil.api.DataObject"%>
<%@page import="com.premierleague.cmsimportutil.impl.slingjson.DataArrayJSONImpl"%>
<%@page import="com.premierleague.cmsimportutil.util.DataObjectUtil"%>
<%@page import="com.premierleague.content.api.ReferenceManager"%>
<%@page import="com.premierleague.content.impl.ReferenceManagerImpl"%>
<%@page import="java.lang.Exception"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="org.apache.commons.lang.time.DateUtils"%>
<%@page import="org.apache.sling.commons.json.JSONArray"%>
<%@page import="com.premierleague.content.util.PageErrorHandler"%>

<%--
// Keep code in perfect sync with: etc/designs/premierleague/clientlibs/js/widgets/jquery.ticker.js
// This widget is heavily cached
// Display the cached time to no javascript clients
// Re-ender the time in javascript according to Date and Last Modified Dates in the header
// We initially load all matchday items (even if more than 9), these are continually polled for updates
// Archive and Fixture items are loaded via AJAX on clicking forward/back on the ticker
// TODO: Are our calculations for matchday valid in New Zealand +12
// NOTE: Logic for hiding .TX ticket icons is implemented in CSS - 
//       /jcr_root/etc/designs/premierleague/clientlibs/css/icons.css

/*** 
    // Key Legend
    FX  - fixture
    PP  - match postponed
    TM  - teamsheets announced
    IN  - match in progress
    FHS - first half started
    HT  - half time
    SHS - second half started
    FT  - full time
    RS  - result
    AR  - archived result
    
    TX  - tickets available
    TV  - on tv, has broadcaster
    YP  - yahoo preview available
    YH  - yahoo highlights available
    
    
    //New data Structure
    {
        matchState: "POST_MATCH",
        matchStateKey: "RS",
        detailedState: "FULLY_ARCHIVED",
        detailedStateKey: "AR",
        matchId: 3293495,
        timestamp: 1281985200000,
        score: {
              home: 3,
              away: 0
        }
        homeTeamId: "12",
        awayTeamId: "31",
        homeTeamName: "Man Utd",
        awayTeamName: "Newcastle"
    }
--%>    


<%-- <div class="parsys ticker"> [CQ5 Insertion] --%>
<%-- TODO: Ajax urls are hard coded into javascript file --%>
<div class="ticker" widget="ticker" visible="9">
    <div class="ticker-arrow ticker-arrow-next disabled" unselectable="on"></div>
    <div class="ticker-arrow ticker-arrow-prev disabled" unselectable="on"></div>
    <ul class="ticker-filter">
        <li class="selected" filter="*">All</li>
        <li filter=".PRE_MATCH">Fixtures</li>
        <li filter=".POST_MATCH">Results</li>
    </ul>
    <div class="ticker-tape">
        <%
            try {
                DataArray tickerData = dataUtils.getDataArray("siteHeaderSection.matches");
                String matchRoot = properties.get("matchRoot", "/en-gb/matchday/matches");
                
                // By default, non-js CSS will hide POST_MATCH results
                // We scan the list of results and check if they are all in POST_MATCH state
                // If true we add the ONLY_POST_MATCH css flag, so we the CSS will not show an empty ticker
                //
                // NOTE: .POST_MATCH.SAME_MATCH_DAY is considered a .LIVE match, and not counted for this check
                String onlyPostMatchClass = "ONLY_POST_MATCH";
                for( int i = 0; i < tickerData.length(); i++ ) {
                    DataObject match = tickerData.getDataObject(i);
                    if( !match.getString("matchState").equals("POST_MATCH")
                      || match.getString("matchState").equals("SAME_MATCH_DAY") ) {
                    	onlyPostMatchClass = "";
                        break;
                    }
                } 
        %>
        <ul class="<%=onlyPostMatchClass%>">
            <% for( int i = 0; i < tickerData.length(); i++ ) { %>
            <%  
                DataObjectUtils match = tickerData.getDataObjectUtils(i);                                       
                String cssClass = "";

                Date timestamp = new Date( match.getLong("timestamp") );                
                String today = (new SimpleDateFormat("dd/MM/yy")).format( new Date() );
                String date  = (new SimpleDateFormat("dd/MM/yy")).format( timestamp );
                String time  = (new SimpleDateFormat("HH:mm")).format( timestamp );
                if( date.equals(today) ) {
                    date = "TODAY";
                    if(! match.getString("matchState").equals("SAME_MATCH_DAY") ) {
                        cssClass = "SAME_MATCH_DAY";
                    }
                }

                String matchName = "";
                String homeTeam = match.getString("homeTeamCode");
                String awayTeam = match.getString("awayTeamCode");
                
                if( !match.isNull("score") && !match.getString("matchState").equals("PRE_MATCH") ) {
                    String homeScore = match.getString("score.home");
                    String awayScore = match.getString("score.away");
                    matchName = homeTeam + " " + homeScore + "-" + awayScore + " " + awayTeam;  
                } else {
                    matchName = homeTeam + " v " + awayTeam;
                }

                // Set boxText, normally time, but possibly LIVE or FT
                // Ignore: PT, FHS, SHS keys
                String boxText = "";
                if( match.getString("matchStateKey").equals("FT") 
                 || match.getString("detailedStateKey").equals("FT") ) {
                    boxText = "FT";
                }
                // Full Time matches have both POST_MATCH && SAME_MATCH_DAY
                else if( match.getString("matchState").equals("POST_MATCH") && match.getString("detailedState").equals("SAME_MATCH_DAY") ) {
                    boxText = "FT";
                }
                else if( match.getString("matchState").equals("LIVE") && match.getString("detailedState").equals("HALF_TIME") ) {
                    boxText = "HT";
                }
                else if( match.getString("matchState").equals("LIVE") ) {
                    boxText = "LIVE";
                } 
                else {
                    boxText = time;
                }
            %>
            <li matchId="<%=match.getString("matchId")%>" class="ticker-match <%= match.getString("matchState")%> <%= match.getString("matchStateKey")%> <%= match.getString("detailedState")%> <%= match.getString("detailedStateKey")%> <%=cssClass%>">
                <a href="<%=matchRoot%>/<%=match.getString("matchCmsAliasData.season","")%>/<%=match.getString("matchCmsAliasData.competition","")%>.html/<%=match.getString("matchCmsAliasData.teams","")%>">
                    <div class="ticker-box" ><span field="boxText" widget="localeDate" timestamp="<%= match.getString("timestamp") %>" format="HH:mm"   ><%= boxText %></span></div>
                    <div class="ticker-date"><span field="date"    widget="localeDate" timestamp="<%= match.getString("timestamp") %>" format="dd/MM/yy"><%= date %></span></div>
                    <div class="ticker-matchName"><span field="matchName"><%= matchName %></span></div>
                    <div class="ticker-icons"><span class='icon'></span><span class='icontext'></span></div>
                    <div class="ticker-broadcaster"></div>
                </a>
            </li>
            <% } %>
        </ul>
        <%
            } catch( Exception e ) {
				PageErrorHandler.error(request, response, out, e, this.getClass());
            }
        %>       
    </div>
    <script type="text/x-jquery-tmpl" class="template">
        <li matchId="\${matchId}" class="ticker-match ticker-match-refereshed \${matchState} \${matchStateKey} \${detailedState} \${detailedStateKey} \${cssClass}">
        {{if matchCmsAliasData}}
            <a href="/en-gb/matchday/matches/\${matchCmsAliasData.season}/\${matchCmsAliasData.competition}.html/\${matchCmsAliasData.teams}">
        {{/if}}
                <div class="ticker-box" ><span field="boxText">\${boxText}</span></div>
                <div class="ticker-date"><span field="date"   >\${date}</span></div>
                <div class="ticker-matchName"><span field="matchName">\${matchName}</span></div>
                <div class="ticker-icons"><span class='icon'></span><span class='icontext'></span></div>
                <div class="ticker-broadcaster"></div>
        {{if matchCmsAliasData}}
            </a>
        {{/if}}
        </li>
    </script>        
</div>
<%--</div>--%>
