"use strict";

{
const iSyncMS = 10000;
const cCommentsAtLoad = document.querySelectorAll('.issuecommentheader').length;
let idTimer = window.setTimeout( updateClock, iSyncMS);
let cUpdates = 0;

// Refetch this page from the server to see if any items have been added.
function checkForUpdates() {
  const oReq = new XMLHttpRequest();
  oReq.addEventListener("load",  function(e) { 
    let newDoc = e.target.response;
    let arrCommentsNow = newDoc.querySelectorAll('.issuecommentheader');
    let cCommentsNow = arrCommentsNow.length;

    // Issue Unchanged?
    if (cCommentsNow == cCommentsAtLoad) return;

    document.getElementById("uiSyncInfobar").innerText = "This issue has been updated; it now has " + cCommentsNow + ((cCommentsNow == 1) ? " comment": " comments") + ". Sync paused.";
    //document.getElementById("uiLastSync").classList.add('needs-sync');
    document.body.classList.add('needs-sync');

    let uiNewComments = document.createElement("div");
    uiNewComments.innerText = "NEW COMMENTS GO HERE";
    document.getElementById("cursorarea").appendChild(uiNewComments);

    idTimer = null;
    // TODO: Copy comments and store them away to fill in later https://gist.github.com/ebidel/3581825
    }, false);

    const fnErr = function() { document.getElementById("uiSyncInfobar").innerText = "Sync failed." };

    oReq.responseType = 'document';
    oReq.addEventListener("error", fnErr, false);
    oReq.addEventListener("timeout", fnErr, false);

    oReq.open("GET", document.location.href, true);         // TODO: Sanity check?
    oReq.setRequestHeader("Cache-Control", "max-age=0");
    oReq.setRequestHeader("X-Client", "BugWatcher Chrome Extension");
    oReq.timeout = 5000;
    oReq.send();
//*[@id="hc1"]
}

const uiLastSync = document.createElement("th");
uiLastSync.id = "uiLastSync";

const uiUserbar = document.getElementById("userbar");
const oNow = new Date();
const sLang = navigator.languages[0] || "en-US";
uiLastSync.innerHTML = "Loaded<br />" + oNow.toLocaleTimeString(sLang, { hour12: false });
uiLastSync.title = "This page was last loaded at " + oNow.toLocaleString() + "\nwith " + cCommentsAtLoad + " comments.";
uiUserbar.parentNode.insertBefore(uiLastSync, uiUserbar);

const uiAddComment = document.getElementById("addCommentTextArea");
const uiSyncInfobar = document.createElement("div");
uiSyncInfobar.id = "uiSyncInfobar";
uiSyncInfobar.innerHTML = "<i>This issue last sync'd at " + oNow.toLocaleString() + " <span id=uiAgo></span> </i>";
//"<b>Warning</b>: This bug has been modified since you loaded this page. <a style='text-decoration:none' href='#'>Peek</a>";
uiAddComment.parentNode.insertBefore(uiSyncInfobar, uiAddComment);
uiSyncInfobar.addEventListener('click', function(e) { checkForUpdates(); }, false);


function updateClock() {

    if (idTimer) idTimer = window.setTimeout( updateClock, iSyncMS);

    // Bail fast if hidden
    if (document.hidden) return;

    let uiAgo = document.getElementById("uiAgo");
    uiAgo.innerText = new Date() + " (" + ++cUpdates + ") ";

    checkForUpdates();
}

// TODO:
// Add "peek" option that pulls comments into markup in the right place
// Add "Refresh keep draft comment"
// Ping with backoff; stop pinging when user is away (somehow)
// "Monitor" checkbox in the bug UI
}