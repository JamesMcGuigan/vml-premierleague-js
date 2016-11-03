<%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globalvars.jsp"%>
<%@include file="/apps/premierleague/components/contentpage/globaldatavars.jsp"%>
<%@ page import="javax.jcr.*, java.util.*,
        com.day.cq.wcm.api.PageFilter,
        com.day.cq.wcm.api.Page,
        com.day.cq.wcm.api.PageManager,
        com.day.cq.wcm.api.WCMMode,
        org.apache.sling.api.request.RequestPathInfo,
        com.day.cq.commons.PathInfo,
        com.premierleague.content.api.match.MatchViewContext" %><%
        
   String protocol = request.getProtocol();
   String adServer = "http://adserver.adtech.de/";
   
   String adUrl = "|3.0|327|";
   
   String adCode = "3213761|0|1";
   
   String adWidth = "468";
   String adHeight = "60";
   
   adServer = (protocol.equals("HTTP/1.1")) ? adServer : "https://secserv.adtech.de/";
   
   String adType = properties.get("adType","banner");
   
   // n.b. may not work once internationalised!
   boolean kidsSection = false;
   if (currentPage.getDepth() > 3) {
       kidsSection = (currentPage.getAbsoluteParent(3).getName().toString().equals("kids"));
   }
   String adPrefix = "";

   if ("mpu".equals(adType)) {
        adPrefix = kidsSection ? "3523068" : "3213762";
	    adCode = adPrefix + "|0|170";
        adWidth = "300";
        adHeight = "250";
   } else if ("leaderboard".equals(adType)) {
    	adPrefix = kidsSection ? "3523069" : "3213760";
    	adCode = adPrefix + "|0|225";
        adWidth = "728";
        adHeight = "90";
    } else if ("sky".equals(adType)) {
    	adPrefix = kidsSection ? "3523067" : "3213759";
    	adCode = adPrefix + "|0|168";
        adWidth = "120";
        adHeight = "600";
    }
   
   %>

<script type="text/javascript">

	if (window.adgroupid == undefined) {
	    window.adgroupid = Math.round(Math.random() * 1000);
	}
	document.write('<scr'+'ipt type="text/javascript" src="<%= adServer %>addyn<%= adUrl %><%= adCode %>|ADTECH;cookie=info;loc=100;target=_blank;sub1=[subst];grp='+window.adgroupid+';misc='+new Date().getTime()+'"></scri'+'pt>');

</script>
<noscript>
    <a href="<%= adServer %>adlink<%= adUrl %><%= adCode %>|ADTECH;loc=300;sub1=[subst]" target="_blank"><img 
    src="<%= adServer %>adserv<%= adUrl %><%= adCode %>|ADTECH;cookie=info;loc=300" 
    border="0" 
    width="<%= adWidth %>" 
    height="<%= adHeight %>"/></a>
</noscript>