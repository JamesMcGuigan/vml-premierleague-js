<%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="java.util.Iterator,
        com.day.cq.wcm.api.PageFilter,
        com.day.cq.wcm.api.Page,
        com.day.cq.wcm.api.PageManager,
        com.day.cq.wcm.api.WCMMode" %><%

    String listroot = properties.get("listroot", currentPage.getPath());
    Page rootPage = slingRequest.getResourceResolver().adaptTo(PageManager.class).getPage(listroot);
    if (rootPage != null) {
        Iterator<Page> children = rootPage.listChildren(new PageFilter(request));

        // disable WCM for included components
        WCMMode mode = WCMMode.DISABLED.toRequest(request);
        try {
            while (children.hasNext()) {
            	Page child = children.next();
                String title = child.getTitle() == null ? child.getName() : child.getTitle();
                String date = child.getProperties().get("date","");
                //String pathtoinclude=child.getPath() + ".teaser.html";
                %><div class="item">
                    <a href="<%= child.getPath() %>.html"><b><%= title %></b></a>
                    <span><%= date %></span><br/>
                    <%= child.getProperties().get("jcr:description","") %><br/>
                </div><%
            }
        } finally {
            mode.toRequest(request);
        }
    }
%>