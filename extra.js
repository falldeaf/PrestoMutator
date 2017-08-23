////////This code adds HTML and javascript to the front end. It needs to be updated and fixed to really work correcty
////////with the ajax nature of Presto's front end, though. Needs a complete overhaul.

var parser = document.createElement('a');
parser.href = window.location.href;
var contentID = parser.pathname.replace(/\/+$/, "").split("/").pop();

var json = "";

var xhr = new XMLHttpRequest();
xhr.onload = function() {
    json = xhr.responseText;                         // Response
    //json = json.replace(/^[^(]*\(([\S\s]+)\);?$/, '$1'); // Turn JSONP in JSON
    json = JSON.parse(json);                             // Parse JSON
    // ... enjoy your parsed json...
		injectionChecks(json);
};

xhr.open('GET', 'http://geronimo-api.production.gannettdigital.com/api/v1/' + contentID);
xhr.send();

//Get options:
/*
chrome.storage.sync.get( function(options) {
	console.log(options);

	if(options.favfix_v == null) {
		console.log('no options set!')
		chrome.storage.sync.set({
			fcontrol_v: true,
			cbeat_v: false,
		}, function() {
			chrome.storage.sync.get( function(options) {
				injectionChecks(options, action);
			});
		});
	} else {
		injectionChecks(options, action);
	}

});
*/

//This is the string that will contain the code to be injected
injectstring = "";

//Add control for front page edit button
function addEditButton()
{
	var full_url = "https://presto.gannettdigital.com/#!/stories/edit/" + tcpm_hash;

	var e = document.createElement('div');
	e.innerHTML = float_control_html("&laquo Back End", "stats", "back");
	e.id = "dog-edit-button";

	document.body.insertBefore(e,document.body.childNodes[1]);

	jQuery('#dog-edit-button').click(function(){
		location.href = full_url;
	});
	jQuery('#dog-stats').click(function(evt){
		evt.stopPropagation();
		location.href = "https://sc5.omniture.com/sc15/reports/index.html?r=Report.MostPopularCustomInsight&a=Report.Standard&rp=page_ids_are_hashes|true;view|1;period|11707;period_from|08/01/17;period_to|08/31/17;granularity|day;range_period|0;chart_type|gt_horiz_bar;row|0;force_width|1;page_type|44;sort|hits;std_events[0]|hits;std_events[1]|18;std_events[2]|50;event_on_graph[18]|1;event_on_graph[50]|1;event_on_graph[hits]|1;detail_depth|50;search[rows][0][string]|" + tcpm_cid + ";show_percents|1;chart_item_count|5;dont_reset_reserved_vars|1;share_link|1";
	});
	jQuery('#dog-close').click(function(evt){
		evt.stopPropagation();
		jQuery('#dog-edit-button').remove();
	});
}

//Add HTML for floating front page story box
function float_control_html(mlinktext, btext, imgclass) {

	var html = `
	<div class="` + imgclass + `-icon-dog main-icon-dog"></div>
	<div id="dog-main-link">` + mlinktext + `</div>
	<button id="dog-stats" class="dog-buttons">stats</button>
	<button id="dog-close" class="dog-buttons">close</button>
	`;

	return html;
}

function addVariables(vname, vcontent) {
	return "function add" + vname +"(){ window." + vname + " = '" + vcontent + "'; }";
}

//////ADD APPROPRIATE OPTIONS TO INJECTION STRING/////////////
//////////////////////////////////////////////////////////////
function injectionChecks(json) {

			injectstring += "(" + addVariables("tcpm_cid", contentID) + "());\n\n";
			injectstring += "(" + addVariables("tcpm_hash", json.readModel.id) + "());\n\n";

		//if(options.keepalive_v) {
			injectstring += float_control_html.toString() + "\n\n";
			injectstring += "(" + addEditButton.toString() + "());\n\n";
		//}

    console.log(injectstring);

	//////////: Inject Script! ://////////////
	//  .     |___________________________________
	//  |-----|- - -|''''|''''|''''|''''|''''|'##\|__
	//  |- -  |  cc 6    5    4    3    2    1 ### __]==----------------------
	//  |-----|________________________________##/|
	//  'jgs  |"""""""""""""""""""""""""""""""""""`
	//
	var script = document.createElement("script");
	script.textContent = injectstring + "\n\n";
	document.documentElement.appendChild(script);
}

//Requests and functions from the background script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "replace")
		replaceSelectionTextarea();
		//console.log(getIframeWithSelection(window).contentWindow.getSelection().anchorNode.firstChild);
      //replaceSelection();
});
