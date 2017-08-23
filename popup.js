//Give immediate focus to the site search box
$(window).load(function(){
  $("#psearchbox").focus();
});

//This opens the extension options but the current iteration has no options, yet.
function optionsPage() {
  chrome.runtime.openOptionsPage();
}

//Start a new site search in Presto
function newSearch() {
  var newURL = "https://presto.gannettdigital.com/#!/PTCN/search?keyword=" + $('#psearchbox').val();
  chrome.tabs.create({ url: newURL });
}

//Open a new page in Presto at the 'create new story' button area
function newStory() {
  var newURL = "https://presto.gannettdigital.com/#!/stories/";
  chrome.tabs.create({ url: newURL });
}

//This should open to the create new media are but will probably make more sense when media is integrated into Presto Next
function newMedia() {
  var newURL = "https://presto.gannettdigital.com/#!/PTCN/legacy-media-manager";
  chrome.tabs.create({ url: newURL });
}

//Watch for the enter key and submit a Presto search when seen
$("#psearchbox").keyup(function(event){
    if(event.keyCode == 13){
        $("#newsearch").click();
    }
});

//Buttons!
document.getElementById('newsearch').addEventListener('click', newSearch);
document.getElementById('newstory').addEventListener('click', newStory);
document.getElementById('newmedia').addEventListener('click', newStory);
//document.getElementById('pref').addEventListener('click', optionsPage);
