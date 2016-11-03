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

  Logo component

  Includes an image from the design and draws a link to the home page.

--%><%@include file="/libs/foundation/global.jsp"%><%
%><%@ page import="com.day.text.Text,
                   com.day.cq.wcm.foundation.Image,
                   com.day.cq.commons.Doctype" %><%

    long absParent = currentStyle.get("absParent", 2L);
    String home = Text.getAbsoluteParent(currentPage.getPath(), (int) absParent);
    String alt = currentStyle.get("altText", toString());
    Resource res = currentStyle.getDefiningResource("imageReference");
    if (res == null) {
        res = currentStyle.getDefiningResource("image");
    }
    %><a href="<%= home %>.html"><%
    if (res == null) {
        %>Home<%
    } else {
        Image img = new Image(res);
        img.setItemName(Image.NN_FILE, "image");
        img.setItemName(Image.PN_REFERENCE, "imageReference");
        img.setSelector("img");
        img.setDoctype(Doctype.fromRequest(request));
        img.setAlt(alt);
        img.setTitle(alt);
        img.draw(out);
    }
    %></a>