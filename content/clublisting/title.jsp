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

--%>
<%@include file="/libs/foundation/global.jsp"%>
 <%@page import="java.util.GregorianCalendar"%>
        <%@page import="java.util.Calendar"%>
        <%@page import="java.util.Iterator"%>
        <%@page import="java.util.Map"%>

<%


String borderHTML = "";
String dateTime = properties.get("dateTime", "");

String type = properties.get("type","large");

String size = ("large".equals(type)) ? "2" : "3";
        
String noborder = properties.get("border", "");
if (noborder.equals("on")) {
    borderHTML = " class=\"noborder\"";
} else {
    borderHTML = "";
}
%>
<h<%= size %><%=borderHTML%>>
<%= properties.get("title", "Title") %></h<%= size %>>
<%
 if(dateTime != null && (dateTime.equals("true") || dateTime.equals("on"))){
         org.apache.sling.jcr.resource.JcrPropertyMap currentPageProps = (org.apache.sling.jcr.resource.JcrPropertyMap)currentPage.getProperties();                
         Iterator propIt = currentPageProps.entrySet().iterator();

         while (propIt.hasNext()){
             Map.Entry pairs = (Map.Entry)propIt.next();
             if ((pairs.getKey()).equals("cq:lastModified")){
                 GregorianCalendar gc  = (GregorianCalendar)pairs.getValue();%>
                 
    <b>First Published : <%=getDayName(gc.get(Calendar.DAY_OF_WEEK))%> 
                    <%=gc.get(Calendar.DAY_OF_MONTH)%> 
                    <%=getMonthname(gc.get(Calendar.MONTH))%> 
                    <%=gc.get(Calendar.YEAR)%> </b> 
                  <%  
             }
         }
         }
     %>   
        
<%!
    public String getMonthname(int month){ 
        String[] monthName = {"January", "February", 
        "March", "April", "May", "June", "July", 
        "August", "September", "October", "November", 
        "December"}; 
         
        return monthName[month]; 
    }

  public String getDayName(int weekDay){ 
    String[] dayName = {"Monday","Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday","Sunday", }; 
    return dayName[weekDay]; 
}
%>