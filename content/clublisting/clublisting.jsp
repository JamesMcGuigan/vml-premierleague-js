/**
 *  TODO: remove - use /jcr_root/apps/premierleague/components/clubs/clublogos/clublogos.jsp instead
 */
<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globalvars.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globaldatavars.jsp"%>
<%@page import="com.premierleague.content.api.club.ClubReferenceService"%>
<%@page import="java.util.List"%>
<%@page import="java.util.ArrayList"%>
<%@page import="com.premierleague.content.impl.ClubReferenceServiceLocalisedImpl"%>
<%@page import="com.premierleague.content.util.PageErrorHandler"%>

<div class="clublisting">
<ul class="column">
<%
try {  
    String linkTo = properties.get("linkTo","");
    
    DataArray clubList = dataUtils.getDataArray( "siteHeaderSection.clubList" );
    for( int i = 0; i < clubList.length(); i++ ) {
        DataObjectUtils club = clubList.getDataObjectUtils(i);
        String clubName = club.getString("clubName");
        Integer clubId  = club.getInt("clubId");
        String clubLogo = clubReferenceService.getClubLogo(clubId, 23, 23);
        
        String clubUrl  = "";
        if( linkTo.equals("players") ) {
            clubUrl = "/content/premierleague/en-gb/clubs/profile.squads.html/"+clubName;
        } else if( linkTo.equals("kids") ) {
            clubUrl = "/content/premierleague/en-gb/kids/clubs/profile.overview.html/"+clubName;
        } else if( linkTo.equals("clubs") ) {
            clubUrl = clubReferenceService.getClubTabUrl(clubId);
        } else {
            clubUrl = clubReferenceService.getClubTabUrl(clubId);
        }
        
        if( i != 0 && i % 5 == 0 ) {
           %></ul><ul class='column'><%
        }
        %>
            <li clubId="<%=clubId%>">
                <a href="<%=clubUrl%>">
                    <img  class="logo" src="<%=clubLogo%>" style="width:23px; height:23px"/>
                    <span class="name"><%=clubName%></span>
                </a>
            </li>
        <%
    }
%>
</ul>
</div>
<%    
} catch( Exception e ) {
	PageErrorHandler.error(request, response, out, e, this.getClass());
}
%>
