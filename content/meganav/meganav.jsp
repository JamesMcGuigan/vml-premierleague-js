<%@include file="/libs/foundation/global.jsp"%><% 
%><%@ page import="java.util.Iterator, 
                    com.day.text.Text, 
                    com.day.cq.wcm.api.PageFilter, 
                    com.day.cq.wcm.api.Page,
                   org.apache.commons.lang.StringEscapeUtils" %>
<%@page import="com.premierleague.content.util.PageErrorHandler"%>
<%                    
   String megaNavType    = currentPage.getProperties().get("megaNavType","");
   String megaNavInclude = megaNavType + ".jsp";
%>
<% try { %>
    <% if( !megaNavType.equals("") ) { %>    
        <cq:include script="<%= megaNavInclude %>" />
    <% }
  } catch( Exception e ) { 
	PageErrorHandler.error(request, response, out, e, this.getClass());
  } %>
