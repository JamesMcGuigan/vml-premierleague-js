<%@include file="/libs/foundation/global.jsp"%>
<%@page import="com.premierleague.content.api.ReferenceManager"%>
<%@page import="com.premierleague.content.impl.ReferenceManagerImpl"%>
<%@page import="com.premierleague.cmsimportutil.api.DataObject"%>
<%@page import="com.premierleague.cmsimportutil.util.DataObjectUtil"%>

<a href="<%=ReferenceManagerImpl.getInstance(resourceResolver, currentPage.getPageManager()).getMatchRef().getMatchTabUrl(3285918)%>">Match Link</a>

<% //DataObject data = DataObjectUtil.getPageData(request, currentPage, resourceResolver); %>
<% //data %>

<div class="sectionTitle">
    <h2>Club Form Guide</h2>
    <ul class="legend">
        <li><span class="color-square" style="background:#ff9a02"></span>Wolverhampton Wolves</li>
        <li><span class="color-square" style="background:#cd0000"></span>Arsenal</li>
        <li><span class="color-square" style="background:#011b58"></span>Tottenham Hotspur</li>
    </ul>
</div>
<table class="matchdata" widget="svgLineChart" svgheight="220">
    <thead>
        <tr>
            <th class="label" split="/">Points / Matches Played</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
        </tr>
    </thead>
    <tbody>
        <tr color="#ff9a02">
            <th>Wolverhampton Wolves</th>
            <td>0</td>
            <td>1</td>
            <td>4</td>
            <td>4</td>
            <td>5</td>
            <td>5</td>
        </tr>
        <tr color="#cd0000">
            <th>Arsenal</th>
            <td>3</td>
            <td>6</td>
            <td>9</td>
            <td>9</td>
            <td>10</td>
            <td>13</td>
        </tr>
        <tr color="#011b58">
            <th>Tottenham Hotspur</th>
            <td>1</td>
            <td>4</td>
            <td>7</td>
            <td>10</td>
            <td>11</td>
            <td>11</td>
        </tr>
    </tbody>
</table>

<div class="sectionTitle">
    <h2>Who do you think will win the match</h2>
    <ul class="legend">
        <li class="label">LEGEND</li>
        <li><span class="color-square" style="background:#d5302a"></span>Liverpool</li>
        <li><span class="color-square" style="background:#999999"></span>Draw</li>
        <li><span class="color-square" style="background:#202986"></span>Everton</li>
    </ul>
</div>
<div widget="svgWrapper" svgheight="220">
    <table class="matchdata">
        <thead>
            <tr>
                <th></th>
                <th color="#d5302a">Liverpool</th>
                <th color="#cfcfcf">Draw</th>
                <th color="#202986">Everton</th>
            </tr>
        </thead>
        <tbody>
            <tr widget="svgPieDoughnut" offset="left">
                <th>Liverpool Fans</th>
                <td>80%</td>
                <td>15%</td>
                <td>5%</td>
            </tr>
            <tr widget="svgPieDoughnut" offset="center">
                <th>All Fans</th>
                <td>50%</td>
                <td>17%</td>
                <td>33%</td>
            </tr>
            <tr widget="svgPieDoughnut" offset="right" anticlockwise="false">
                <th>Everton Fans</th>
                <td>10%</td>
                <td>36%</td>
                <td>54%</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="sectionTitle">
    <h2>How confident are you in a win for your team?</h2>
</div>
<div class="svg-wrapper">
    <table class="matchdata" widget="svgBarChart" svgheight="140">
        <thead>
            <tr>
                <th></th>
                <th>Not Very Confident</th>
                <th>Quite Confident</th>
                <th>Very Confident</th>
            </tr>
        </thead>
        <tbody>
            <tr color="#d5302a">
                <th>Liverpool</th>
                <td>10%</td>
                <td>56%</td>
                <td>34%</td>
            </tr>
            <tr color="#202986">
                <th>Everton</th>
                <td>36%</td>
                <td>53%</td>
                <td>11%</td>
            </tr>
        </tbody>
    </table>
</div>


<div class="sectionTitle">
    <h2>Last Meeting</h2>
</div>
<div widget="svgWrapper" svgheight="190">
    <div src="/etc/designs/premierleague/clientlibs/img/ea_sports_logo.png" width="73" height="13" widget="svgImage" offset="center top:-10"></div>
    <table class="matchdata">
        <thead>
            <tr>
                <th class="label">Possession</th>
                <th>1st Half</th>
                <th>2nd Half</th>
            </tr>
        </thead>
        <tbody class="matchdata-stats">
            <tr widget="svgPieChart" colors="#d5302a,#b01a26" svgwidth="140" offset="left:30; bottom:15">
                <th>Liverpool</th>
                <td>76%</td>
                <td>88%</td>
            </tr>
            <tr widget="svgPieChart" colors="#202986,#131c53" svgwidth="140" offset="right:30; bottom:15">
                <th>Everton</th>
                <td>24%</td>
                <td>22%</td>
            </tr>
        </tbody>
    </table>
    <table class="matchdata" widget="svgShotsOnGoal" offset="center; bottom:15">
        <thead>
            <tr>
                <th class="label">Shots on Goal</th>
                <th>On Target</th>
                <th>Off Target</th>
            </tr>
        </thead>
        <tbody>
            <tr class="svgBarChart" color="#d5302a">
                <th>Liverpool</th>
                <td>4</td>
                <td>6</td>
            </tr>
            <tr class="svgBarChart" color="#202986">
                <th>Everton</th>
                <td>7</td>
                <td>4</td>
            </tr>
        </tbody>
    </table>
</div>
<div>
    <table class="matchdata" widget="svgHorizontalBar" width="896">
        <thead>
            <tr>
                <th class="ignore">&nbsp;</th>
                <th>Corners</th>
                <th>Tackles</th>
                <th>Fouls</th>
                <th>Yellow Cards</th>
                <th>Red Cards</th>
            </tr>
        </thead>
        <tbody>
            <tr name="Liverpool" color="#d5302a">
                <th>Liverpool</th>
                <td>5</td>
                <td>24</td>
                <td>8</td>
                <td>4</td>
                <td>0</td>
            </tr>
            <tr name="Everton" color="#202986">
                <th>Everton</th>
                <td>8</td>
                <td>21</td>
                <td>11</td>
                <td>4</td>
                <td>0</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th>Total</th>
                <td>13</td>
                <td>45</td>
                <td>19</td>
                <td>8</td>
                <td>0</td>
            </tr>
        </tfoot>
    </table>
</div>
