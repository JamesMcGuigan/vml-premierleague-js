<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Title component.

  Draws a title either store on the resource or from the page

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="org.apache.commons.lang.StringEscapeUtils,
        com.day.cq.commons.Doctype,
        com.day.cq.commons.DiffInfo,
        com.day.cq.commons.DiffService,
        org.apache.sling.api.resource.ResourceUtil" %><%

    // first calculate the correct title - look for our sources if not set in paragraph
    String title = properties.get(NameConstants.PN_TITLE, String.class);
    if (title == null || title.equals("")) {
        title = resourcePage.getPageTitle();
    }
    if (title == null || title.equals("")) {
        title = resourcePage.getTitle();
    }
    if (title == null || title.equals("")) {
        title = resourcePage.getName();
    }

    // check if we need to compute a diff
    String diffOutput = null;
    DiffInfo diffInfo = resource.adaptTo(DiffInfo.class);
    if (diffInfo != null) {
        DiffService diffService = sling.getService(DiffService.class);
        ValueMap map = ResourceUtil.getValueMap(diffInfo.getContent());
        String diffText = map.get(NameConstants.PN_TITLE, "");
        // if the paragraph has no own title, we use the current page title(!)
        if (diffText == null || diffText.equals("")) {
            diffText = title;
        }
        diffOutput = diffInfo.getDiffOutput(diffService, title, diffText, false);
        if (title.equals(diffOutput)) {
            diffOutput = null;
        }
    }
    String defType = currentStyle.get("defaultType", "large");

    // use image title if type is "small" but not if diff should be displayed
    if (properties.get("type", defType).equals("hidden")) {
    	// nada
    } else {
	    if ( diffOutput == null && properties.get("logo", defType).equals("barclays") ) {
	        %><h2 class="barclays"><%= StringEscapeUtils.escapeHtml(title) %></h2><%
	    
	    // not large title && barclays logo
        } else if ( diffOutput != null &&  properties.get("logo", defType).equals("barclays") ) {
            %><h2 class="barclays"><%= diffOutput %></h2><%

	    // large title && ea logo
        } else if ( diffOutput == null && properties.get("logo", defType).equals("ea") ) {
            %><h2 class="ea"><%= StringEscapeUtils.escapeHtml(title) %></h2><%
        
        // not large title && ea logo
        } else if ( diffOutput != null && properties.get("logo", defType).equals("ea") ) {
            %><h2 class="ea"><%= diffOutput %></h2><%
            
        // large title && tune logo
        } else if ( diffOutput == null &&  properties.get("logo", defType).equals("tune") ) {
            %><h2 class="tune"><%= StringEscapeUtils.escapeHtml(title) %></h2><%
            
        // not large title && ea logo
        } else if ( diffOutput != null && properties.get("logo", defType).equals("tune") ) {
            %><h2 class="tune"><%= diffOutput %></h2><%

	    } else if ( diffOutput == null ) {
	        %><h2><%= StringEscapeUtils.escapeHtml(title) %></h2><%
	
	    // we need to display the diff output
	    } else {
	        // don't escape diff output
	        %><h2><%= diffOutput %></h2><%
	
	    }
		
    }
    
    
    
    
%>