<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globalvars.jsp"%>

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
<%@page import="org.apache.sling.commons.json.JSONArray,com.day.cq.wcm.api.WCMMode"%>
<%@page import="com.day.cq.dam.commons.util.DamUtil"%>
<%@page import="com.day.cq.dam.api.Asset" %>
<%@page import="com.day.cq.dam.api.Rendition" %>
<%
    int[] count = {1,2,3,4,5};
    String firstSlide = properties.get("linkroot1", String.class);

    if (firstSlide == null) { //|| !slides.hasNext()) {
        if (WCMMode.fromRequest(request) == WCMMode.EDIT ||
            WCMMode.fromRequest(request) == WCMMode.DESIGN) {
            %>
        <div class="auth-msg-box">
            <span class="auth-msg-box-message">Please add some articles to this slideshow.</span>
        </div> 
            <%
        } else {
            // Add the error message to the HTML code as a comment for debugging purposes.
            %><!-- "Error: No images have been added to this slide show." --><%
        }
        return;
    }
    %>        
<div class="slideshow" widget="slideshow">
    <h1>Premier League - Home Page</h1>
    <div class="image-wrapper">
    <%        
    //int count = 0;
    Page slidePage = null;
    for (int index : count) {
        try {
            slidePage = pageManager.getContainingPage(properties.get("linkroot" + index, String.class)); 
            if (slidePage != null) {  
                String   fileRef  = slidePage.getPath();
                ValueMap values   = slidePage.getProperties();
                String   imgPath  = values.get("./image/fileReference","");
                %>
                <div class="slide<%= index %> image" position="<%= index - 1 %>" style="background-image:url(<%= imgPath %>)">
                    <a class="block" href="<%= fileRef %>.html">
                        <p><%= slidePage.getPageTitle() %></p>
                    </a>
                </div>
                <%
            }
        } catch (NullPointerException e) {
            continue;
        }
    }
    %>
    </div>
    <div class="sidebar">
        <ul class="buttons">
        <%
        for (int index : count) {
            try {
                slidePage = pageManager.getContainingPage(properties.get("linkroot" + index, String.class)); 
                if (slidePage != null) {  
                	String   fileRef  = slidePage.getPath();
                %>
            <li position="<%=index-1%>">
                <a href="<%= fileRef %>.html"><%=slidePage.getPageTitle()%></a>
            </li> 
                <%
                }
            } catch (NullPointerException e) {
                continue;
            }
        }
        %>
        </ul>
    </div>
    <%
    String heading      = properties.get("heading",   "Fantasy Premier League");
    String lblUsername  = properties.get("username",  "Email");
    String lblPassword  = properties.get("password",  "Password");
    String lblLogin     = properties.get("cta",       "Log in");
    String lblLogin1    = properties.get("link1",     "Register");
    String lblLogin2    = properties.get("link2",     "Forgotten login details?");
    String lblTeam      = properties.get("team",      "My Team");
    String lblTransfers = properties.get("transfers", "Transfers");
    String lblLeagues   = properties.get("leagues",   "My Leagues");
    String lblLogout    = properties.get("logout",    "Logout");
    
    
    final String urlLogin       = "http://fantasy.premierleague.com/accounts/login/";
    final String urlFail        = "http://fantasy.premierleague.com/?fail";
    final String urlReset       = ssoAppUrl + "/login/reset_password.html";
    final String urlRegister    = ssoAppUrl + "/register/index.html";
    final String urlLogout      = ssoAppUrl + "/login/logout.html";
    final String urlMyTeam      = "http://fantasy.premierleague.com/my-team/";
    final String urlMyTransfers = "http://fantasy.premierleague.com/transfers/";
    final String urlMyLeagues   = "http://fantasy.premierleague.com/my-leagues/";
    
    
    
    
    %>
    <%-- PRE LOGGED IN HTML --%>
    <div class="login">
        <h2><%=heading%></h2>
        <form id="form" name="form" method="post" action="<%=ssoAppUrl%>/redirectLogin">
                <label><%=lblUsername%></label>
                <input type="text" name="email" id="username" />
                <label><%=lblPassword%></label>
                <input type="password" name="password" id="password" />
                <input type="hidden" value="<%=urlLogin%>" name="success">
                <input type="hidden" value="<%=urlFail %>" name="fail">
                <button type="submit"><%=lblLogin%></button>              
        </form>
        <span class="login-links">
           <a href="<%=urlRegister%>" class="ctalink"><%=lblLogin1%></a>
           <a href="<%=urlReset%>"    class="ctalink"><%=lblLogin2%></a>
        </span>
        <span class="masthead">&nbsp;</span>
    </div>
    <%-- POST LOGGED IN HTML --%>
    <div class="login loggedin" style="display:none;">
        <h2><%=heading%></h2>
        <p class="memberName"></p>
        <span class="login-links">
            <a class="ctalink" href="<%=urlMyTeam     %>"><%=lblTeam     %></a>
            <a class="ctalink" href="<%=urlMyTransfers%>"><%=lblTransfers%></a>
            <a class="ctalink" href="<%=urlMyLeagues  %>"><%=lblLeagues  %></a>
            <a class="ctalink" href="<%=urlLogout     %>"><%=lblLogout   %></a>
        </span>
        <span class="masthead">&nbsp;</span>
    </div>
    
    <div class="social-links">
        <div class="facebook">
            <div class="col1">
                <img src="<%=designPath%>/images/home/home_facebook.png" width="45" height="45" alt="Facebook Logo" />
            </div>
            <div class="col2">
                <h3>Premier League</h3>
                <div class="fb-like" data-href="http://www.facebook.com/premierleague" data-send="false" data-layout="button_count" data-width="150" data-show-faces="false" data-font="arial"></div>
            </div>
        </div>
        <div class="twitter">
            <div class="col1">
                <img src="<%=designPath%>/images/home/home_twitter.png" width="45" height="45" alt="Twitter Logo" border="0"/>
            </div>
            <div class="col2">
                <h3>Premier League</h3>
                <a href="http://twitter.com/premierleague" class="twitter-follow-button" data-show-screen-name="false" data-text-color="000000"></a>
                <script src="//platform.twitter.com/widgets.js" type="text/javascript"></script>
            </div>
        </div>
    </div>
</div>