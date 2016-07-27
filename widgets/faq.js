$.displayFaqItems = function(data) {
	var items = "";
	var category = $("#filter-faq-select option:selected").val();
	var sort = $("#sort-faq-select option:selected").val();
	var url = $("#faq-ajax-url").text();

	$.each(data, function(index, obj) {
		var tgs = "";
		if (obj.tagNames) {
			$.each(obj.tagNames, function(idx, tag) {
				tgs += ' ' + tag;
			});
		}
		var div = '<div class="faq-item ' + tgs + '">';
		div += '<a href="' + obj.path + '.html">';
		div += obj.question + '</a><br/>';
		div += '<p>' + obj.description + '</p>';
		div += '<span class="tag-association">Tags:';
		if (obj.tagTitles) {
			$.each(obj.tagTitles, function(idx, tag) {
				div += '&nbsp;<a href="#' + obj.tagNames[idx] + '" class="faqtag">' + tag + '</a> ,';
			});
			// Remove the last comma from the tag list
			div = div.replace(/,$/, "");
			//
		}
		div += '</span>';
		div += '</div>';
		items += div;

	});
	$("#faq-list").empty().append(items);
};

$("a.faqtag").live("click",function(e){
	$("#filter-faq-select").val(this.href.split('#').pop());
	$("#filter-faq-select").change();
	return false;
});

$.loadFaqItems = function() {
	var category = $("#filter-faq-select option:selected").val();
	var sort = $("#sort-faq-select option:selected").val();
	var url = $("#faq-ajax-url").text();
	url = url + "?category=" + category + "&sort=" + sort;

	$.getJSON(url, function(data) {
		$.displayFaqItems(data);
	});
};

$(document).ready(function() {
	var faq_options = $("#filter-faq-select option");
	if (faq_options.length > 0) { 
		faq_options.sort(function(a, b) {
			if (a.text.toLowerCase() === 'all')
				return -1;
			else if (b.text.toLowerCase() === 'all')
				return 1;
			else if (a.text > b.text)
				return 1;
			else if (a.text < b.text)
				return -1;
			else
				return 0;
		});
	
		$("#filter-faq-select").empty().append(faq_options);
		$("#filter-faq-select option[value='all']").attr("selected", "selected");
		$("#filter-faq-select").change(function(e) { return $.loadFaqItems();});
		$("#sort-faq-select").change(function(e) { return $.loadFaqItems();});
		$.loadFaqItems();
	}
});
