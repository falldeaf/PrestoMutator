//////////////////////////////
// CONTEXT MENU ITEMS
//////////////////////////////

chrome.contextMenus.create({

    title: "Open ID in Presto",
    contexts:["selection"],
    onclick: openPresto,
});

chrome.contextMenus.create({

    title: "Open ID in Adobe Analytics",
    contexts:["selection"],
    onclick: openAdobe,
});

chrome.contextMenus.create({

    title: "Open ID on Front End",
    contexts:["selection"],
    onclick: openFront,
});

///////////////////////////
// FUNCTION: Get the Geronimo JSON data and call the success function with JSON object as argument
// ARGS- (id : Presto ID),
//       (success: Callback with JSON data)
function getJSON(id, success) {
  var json = "";

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          json = xhr.responseText;                         // Response
          json = JSON.parse(json);                             // Parse JSON
    		  success(json);
      }
  };

  xhr.open('GET', 'http://geronimo-api.production.gannettdigital.com/api/v1/' + id);
  xhr.send();
}

///////////////////////////
// FUNCTION: Check whether we're logged in to Presto. This is the one area that's a little hacky. After getting the return HTML from
// the back end, check the source for the substring '"roles":' in the publicConfig json string (This only shows up if we're logged in)
// ARGS- (answer: Callback with boolean, True if we're currently logged in to Presto)
function loggedIN(answer) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
        if(this.responseText.indexOf('"roles":') !== -1) {
          answer(true);
        } else {
          answer(false);
        }
  };

  xhr.open('GET', "https://presto.gannettdigital.com/");
  xhr.send();
}

///////////////////////////
// FUNCTION: This function opens a Presto site search with a site_code specified, to insure that the correct site is selected
// ARGS- (site_code : Presto site code [example: "PTCN"]),
//       (success: Callback)
function setSite(site_code, success) {
  console.log("Site code = " + site_code);
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        success();
      }
  };

  xhr.open('GET', "https://presto.gannettdigital.com/#!/" + site_code + "/search?initload=true");
  xhr.send();
}

///////////////////////////
// FUNCTION: Is this a properly formatted Presto ID? [all numbers, 9 digits]
// ARGS- (site_code : Presto site code [example: "PTCN"]),
//       (success: Callback)
function checkID(id) {
  var isnum = ( /^\d+$/.test(id) && id.length == 9 );
  if(!isnum) alert("Invalid ID (Please highlight only a 9 digit Presto ID)");
  return isnum;
}

///////////////////////////
// FUNCTION: This function is a redirect. It opens a URL in the specified tab, and once that URL is fully loaded
// the redirect URL is opened in the same Tab
// ARGS- (tab : the tab ID, if passed a -1, create a new tab),
//       (newURL: the URL to open first and wait until fully loaded),
//       (redirect: the URL to load after first tab has been opened and loaded)
function redirectUrl(tab, newURL, redirect) {
//tab is -1, create new, otherwise, update only
  if(tab == -1) {
    chrome.tabs.create({ url: newURL }, function(tab) {
      redirectTab(tab, redirect);
    });
  } else {
    chrome.tabs.update(tab, { url: newURL }, function(tab) {
      redirectTab(tab, redirect);
    });
  }

}

///////////////////////////
// FUNCTION (INTERNAL): do not call directly - callback function redirectURL function, this function adds a listener for the tab and watches for a 'complete'
// signal before opening redirect URL
// ARGS- (tab : tab ID),
//       (redirect: URL to redirect to)
function redirectTab(tab, redirect) {
  chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
    if (info.status === 'complete' && tabId === tab.id) {
      chrome.tabs.onUpdated.removeListener(listener);
        //console.log(tab.url);
        chrome.tabs.update(tab.id, {url: redirect});
    }
  });
}


//////////////////////////
// CONTEXT MENU ACTIONS
//////////////////////////

function openFront(info, tab) {
  if(checkID(info.selectionText)) {
    getJSON(info.selectionText, function(json) {
      var newURL = json.readModel.pageUrl;
      chrome.tabs.create({ url: newURL });
    });
  }
}

function openAdobe(info, tab) {
  if(checkID(info.selectionText)) {
    var newURL = "https://sc5.omniture.com/sc15/reports/index.html?r=Report.MostPopularCustomInsight&a=Report.Standard&rp=page_ids_are_hashes|true;view|1;period|11707;period_from|08/01/17;period_to|08/31/17;granularity|day;range_period|0;chart_type|gt_horiz_bar;row|0;force_width|1;page_type|44;sort|hits;std_events[0]|hits;std_events[1]|18;std_events[2]|50;event_on_graph[18]|1;event_on_graph[50]|1;event_on_graph[hits]|1;detail_depth|50;search[rows][0][string]|" + info.selectionText + ";show_percents|1;chart_item_count|5;dont_reset_reserved_vars|1;share_link|1";
    chrome.tabs.create({ url: newURL });
  }
}

function openPresto(info, tab) {
  if(checkID(info.selectionText)) { //Check if Presto ID is valid
    loggedIN(function(li) {  //Check if we're logged in
      getJSON(info.selectionText, function(json) { // Get Geronimo API JSON

            var newURL = "https://presto.gannettdigital.com/#!/stories/edit/" + json.readModel.id;
            var sc = json.readModel.associatedAssets[0].siteCode;
            if(li) { //We are (l)ogged (I)n
              redirectUrl(-1, "https://presto.gannettdigital.com/#!/" + sc + "/search", newURL); // Switch to correct Site Code
            } else { //We are NOT (l)ogged (I)n
              chrome.tabs.create({ url: "https://presto.gannettdigital.com/" }, function(tab) { //open a new tab
                var csid = setInterval(function() { //start setInterval and save the UID
                  console.log("Current tab is " + tab.url);
                  chrome.tabs.get(tab.id, function(tab){ //get the info for the tab we just opened
                    if(tab.url.indexOf("search") !== -1) { //If the tab that we just just opened contains 'search' in it, the sitecode search has been execute and we're ready to load the edit page
                      console.log("search is in the URL!" + tab.url);
                      clearInterval(csid);//Stop checking the tab URL
                      redirectUrl(tab.id, "https://presto.gannettdigital.com/#!/" + sc + "/search", newURL);//open the edit page
                    }
                  }); // end of get tab
                }, 200); // end of setInterval
              }); //end of create tab
            }//end logged in? check

      });//end getjson
    });//end loggedIN

  }//end of checkID
}

/*

// Some older cruft from a previous iteration of the extension for Endplay CMS

chrome.browserAction.onClicked.addListener(function(tab) {
	domains = [ "www.tcpalm.com/",
			   	"www.reporternews.com/",
				"www.independentmail.com/",
				"www.caller.com/",
			   	"www.courierpress.com/",
			   	"www.kitsapsun.com/",
			   	"www.knoxnews.com/",
			   	"www.naplesnews.com/",
			   	"www.redding.com/",
			   	"www.gosanangelo.com/",
			   	"www.commercialappeal.com/",
			   	"www.timesrecordnews.com/",
			   	"www.vcstar.com/" ];

	var re = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/;
	var path = re.exec(tab.url)[3];
	var domain = re.exec(tab.url)[2];

	//alert("d:" + domain + "  p:" + path);

	if(domains.indexOf(domain) > -1) {

		//javascript:location.href='https://scripps-cms.endplay.com/web/tcp-staging'+window.location.pathname
		chrome.tabs.update(tab.id, {url: 'https://scripps-cms.endplay.com/web/' + tab.favIconUrl.split("/")[6] + '-staging/' + path}, function(){});
	}
});
*/
