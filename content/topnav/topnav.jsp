<%@include file="/libs/foundation/global.jsp"%><% 
%><%@ page import="java.util.Iterator, 
                    com.day.text.Text, 
                    com.day.cq.wcm.api.PageFilter, 
                    com.day.cq.wcm.api.Page,
                    com.day.cq.wcm.api.WCMMode,
                    org.apache.commons.lang.StringEscapeUtils" %><% 
    // get starting point of navigation 
    Page navRootPage = currentPage.getAbsoluteParent(2); 
    
    if (navRootPage == null && currentPage != null) { 
        navRootPage = currentPage;
    } 
    if (navRootPage != null){ 
        %><ul id="navigation" widget="meganav" target="#meganav"><%
    	Iterator<Page> children = navRootPage.listChildren(new PageFilter(request));
        while (children.hasNext()) { 
            try {
                Page child = children.next(); 
                String navType = child.getProperties().get("megaNavType",""); 
                String path    = child.getPath() + ".html";
                String ajax    = navType.equals("") ? "" : "ajax=\""+child.getPath()+".nav.html\"";
                String name    = StringEscapeUtils.escapeHtml(child.getName());
                String title   = StringEscapeUtils.escapeHtml(child.getTitle());
               
                // FIXME: Probably better to compare node paths rather than names?
                String className = ""; // "haschildren"
                if(!( ajax.equals("") )) {
                    className += " expandable";
                }
                if( name.equals(currentPage.getName()) ) {
                    className += " currentpage";
                }
                        
                %>
                <li class="<%=className%>" <%=ajax%> name="<%=name%>" type="<%=navType%>">
                    <a href="<%=path%>"><%=title%></a>
                </li>
                <%
            } catch(Exception e) {
                //out.println(e.getMessage());   
            }
        } 
        %></ul><%
    }
%></div><%-- Exit out of .topnav wrapper defined externally --%><%
    %><div id="meganav" class="meganav"><%
        
    navRootPage = currentPage.getAbsoluteParent(3);
    if (navRootPage != null) {
        String megaNavType  = navRootPage.getProperties().get("megaNavType",null);        
        String childNavPath = navRootPage.getPath() + ".nav.html";
        String childName    = navRootPage.getName();
        
        if (navRootPage != null && megaNavType != null) {
        %><div class="meganav-inner meganav-<%= childName %> meganav-initial" url="<%=childNavPath%>">
            <sling:include path="<%=childNavPath%>"/>
        </div><%
        }
    }
    %></div><%
    
%><div><%-- Reopen .topnav wrapper defined externally --%>
