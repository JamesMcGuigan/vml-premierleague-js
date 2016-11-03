<%@include file="/libs/foundation/global.jsp"%>

<%@page import="com.premierleague.cmsimportutil.api.DataArray"%>
<%@page import="com.premierleague.cmsimportutil.api.DataObject"%>
<%@page import="com.premierleague.cmsimportutil.impl.slingjson.DataArrayJSONImpl"%>
<%@page import="com.premierleague.cmsimportutil.util.DataObjectUtil"%>
<%@page import="com.premierleague.content.api.ReferenceManager"%>
<%@page import="com.premierleague.content.impl.ReferenceManagerImpl"%>
<%@page import="java.lang.Exception"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%@page import="org.apache.commons.lang.time.DateUtils"%>
<%@page import="org.apache.sling.commons.json.JSONArray"%>
<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globalvars.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globaldatavars.jsp"%>

<%
	// clubId is hard coded to test this component on any page.
	
	//int clubId = Integer.valueOf(dataUtils.getString("clubViewContext.clubId"));
	//int clubId = 1006;//arsenal
	int clubId = 1006;
	String latitude = clubReferenceService.getEditorialPropertyValue(clubId,"latitude");
	String longitude = clubReferenceService.getEditorialPropertyValue(clubId,"longitude");
	
	String stadiumAddressOne = clubReferenceService.getEditorialPropertyValue(clubId,"stadiumAddr1");
	String stadiumAddressTwo = clubReferenceService.getEditorialPropertyValue(clubId,"stadiumAddr2");
	
	String latitudeFirst = clubReferenceService.getEditorialPropertyValue(clubId,"latitudeFirst");
	String latitudeSecond = clubReferenceService.getEditorialPropertyValue(clubId,"latitudeSecond");
	String latitudeThird = clubReferenceService.getEditorialPropertyValue(clubId,"latitudeThird");
	String latitudeFourth = clubReferenceService.getEditorialPropertyValue(clubId,"latitudeFourth");
	String latitudeFifth = clubReferenceService.getEditorialPropertyValue(clubId,"latitudeFifth");
	
	
	String longitudeFirst = clubReferenceService.getEditorialPropertyValue(clubId,"longitudeFirst");
	String longitudeSecond = clubReferenceService.getEditorialPropertyValue(clubId,"longitudeSecond");
	String longitudeThird = clubReferenceService.getEditorialPropertyValue(clubId,"longitudeThird");
	String longitudeFourth = clubReferenceService.getEditorialPropertyValue(clubId,"longitudeFourth");
	String longitudeFifth = clubReferenceService.getEditorialPropertyValue(clubId,"longitudeFifth");
	
	
	String lableFirst = clubReferenceService.getEditorialPropertyValue(clubId,"lableFirst");
	String lableSecond = clubReferenceService.getEditorialPropertyValue(clubId,"lableSecond");
	String lableThird = clubReferenceService.getEditorialPropertyValue(clubId,"lableThird");
	String lableFourth = clubReferenceService.getEditorialPropertyValue(clubId,"lableFourth");
	String lableFifth = clubReferenceService.getEditorialPropertyValue(clubId,"lableFifth");

    // if lattitude and longitude for stadium is not availble , make First point of Interest's lattitude and longtude as stadium's lat/long 
    
    if(latitude.equals("") || latitude == ""){
    	
    	latitude=latitudeFirst;
    }
    
    if(longitude.equals("") || longitude == ""){
        
    	longitude=longitudeFirst;
    }

%>

<div class="googlemaps" widget="googlemaps" lat="<%=latitude%>" lon="<%=longitude%>">
    <cq:include path="title" resourceType="premierleague/components/fixtures/title" />
    <div class="search">
        <form name="form1">
            <input type="text" name="postcode"></input>
            <input type="submit" value="Get Directions"></input> 
        </form>
    </div>
    <div class="logos">
    </div>    
    <div class="map" style="width:100%; height: 420px;">
    </div>
    <div class="directions">
    </div>
</div>
