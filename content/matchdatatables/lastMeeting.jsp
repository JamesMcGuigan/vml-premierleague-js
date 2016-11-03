<%@page import="com.premierleague.cmsimportutil.api.DataArray"%>
<%@page import="com.premierleague.cmsimportutil.api.DataObject"%>
<%@page import="com.premierleague.cmsimportutil.impl.slingjson.DataArrayJSONImpl"%>
<%@page import="com.premierleague.cmsimportutil.util.DataObjectUtil"%>
<%@page import="com.premierleague.content.api.ReferenceManager"%>
<%@page import="com.premierleague.content.impl.ReferenceManagerImpl"%>
<%@page import="java.lang.Exception"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%@page import="java.util.Map"%>
<%@page import="java.util.LinkedHashMap"%>
<%@page import="org.apache.commons.lang.time.DateUtils"%>
<%--@page import="org.apache.sling.commons.json.JSONArray"--%>


<%
    DataObject dataObject  = DataObjectUtil.getPageData(request, currentPage, resourceResolver);
    DataObject matchResult = dataObject.getDataObject("matchPastMeetingsSection").getDataObject("lastEncounterStats").getDataObject("matchResult");
    DataObject matchStats  = dataObject.getDataObject("matchPastMeetingsSection").getDataObject("lastEncounterStats").getDataObject("matchStatistics");    
    DataObject homeStats   = matchStats.getDataObject("homeTeamStats");
    DataObject awayStats   = matchStats.getDataObject("awayTeamStats");
    
    String homeTeamName = matchResult.getDataObject("homeTeam").getString("name");
    String awayTeamName = matchResult.getDataObject("awayTeam").getString("name");
%>
<p>matchStats: <%= matchStats %></p>

<%
    Map<String, String> fieldNames = new LinkedHashMap<String, String>() {{
        //put("corners",       "Corners");
        put("fouls",         "Fouls");
        //put("possession",    "Possession");
        //put("shotsOnTarget", "Shots On Target");
        put("yellowCards",   "Yellow Cards");
        put("redCards",      "Red Cards");
    }};
%>

<%-- matchStats --%>
<%= homeStats.names() %>

<div class="sectionTitle">
    <h2>SVG Graphics</h2>
</div>
<div>
    <table class="matchdata" widget="svgHorizontalBar" width="896">
        <thead>
            <tr>
                <th class="ignore">&nbsp;</th>
                <% for( String key: fieldNames.keySet() ) { %>
                    <th><%= fieldNames.get(key) %></th>
                <% } %>
            </tr>
        </thead>
        <tbody>
            <tr name="Liverpool" color="#d5302a">
                <th><%= homeTeamName %></th>
                <% for( String key: fieldNames.keySet() ) { %>
                    <td><%= homeStats.get(key) %></td>
                <% } %>
            </tr>
            <tr name="Everton" color="#202986">
                <th><%= awayTeamName %></th>
                <% for( String key: fieldNames.keySet() ) { %>
                    <td><%= awayStats.get(key) %></td>
                <% } %>
            </tr>
        </tbody>
    </table>
</div>