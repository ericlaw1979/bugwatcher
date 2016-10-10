"use strict";

{
    let iSyncMS = 60000;
    let cCommentsAtLoad = document.querySelectorAll('.issuecommentheader').length;
    let idTimer = null;
    let cUpdates = 0;

    UpdatePollingInterval(() => { 
        console.log('BugWatcher: Scheduling first poll for ' + iSyncMS + "ms from now.");
        idTimer = window.setTimeout(updateClock, iSyncMS); 
    });

    function UpdatePollingInterval(cont)
    {
      chrome.storage.sync.get(null, function(prefs) {
        if (prefs) {
          const iMS = prefs["iSyncMS"];
          if ((iMS > 9999) && (iSyncMS != iMS))
          {
            iSyncMS = iMS;
            console.log("BugWatcher: Adjusting poll interval to " + iSyncMS);
          }
        }
        if (cont) cont(iSyncMS);
      });
    }

    function Now() {
      return (new Date()).toLocaleTimeString(sLang, { hour12: false });
    }

    // Refetch this page from the server to see if any items have been added.
    function checkForUpdates() {

      const uiInfoBar = document.getElementById("uiSyncInfobar");
      const uiAgo = document.getElementById("uiAgo");

      if (uiAgo) {
        uiAgo.innerText = (uiAgo.innerText + " [Rechecking now...]");
      }

      console.log("BugWatcher: checking for updates at " + Now());
      UpdatePollingInterval();

      const oReq = new XMLHttpRequest();
      oReq.addEventListener("load",  function(e) { 
        // Update Top-Notice
        uiLastSync.innerHTML = "Sync'd<br />" + Now();

        // Update Infobar
        if (uiAgo) uiAgo.innerText = Now() + " (" + ++cUpdates + ") ";

        let newDoc = e.target.response;
        let arrCommentsNow = newDoc.querySelectorAll('.issuecomment');
        let cCommentsNow = arrCommentsNow.length;

        if (cCommentsNow < cCommentsAtLoad) {
            console.log("BugWatcher: Assertion failed; CommentsAtLoad: " + cCommentsAtLoad + ", CommentsNow: " + cCommentsNow);
            uiInfoBar.innerText = "Sync error! CommentsAtLoad: " + cCommentsAtLoad + ", CommentsNow: " + cCommentsNow;
            return;
        }

        // Issue Unchanged?
        if (cCommentsNow == cCommentsAtLoad) {
            if (!idTimer) {
              uiInfoBar.innerText = "Issue was updated since original load; it now has "
                                  + cCommentsNow + ((cCommentsNow == 1) ? " comment": " comments") + ". Sync paused; last check at " + Now();
            }
          return;
        }

        idTimer = null;
        uiInfoBar.innerText = "This issue has been updated; it now has "
                            + cCommentsNow + ((cCommentsNow == 1) ? " comment": " comments") + ". Sync paused at " + Now();
        //document.getElementById("uiLastSync").classList.add('needs-sync');
        document.body.classList.add('needs-sync');

        let uiNewComments = document.getElementById("uiNewComments");
        if (!uiNewComments) {
            uiNewComments = document.createElement("div");
            uiNewComments.id = "uiNewComments";
            uiNewComments.classList.add('future-comments');
            let uiFutureHeading = document.createElement('div');
            uiFutureHeading.innerHTML = "<h2>New Comments Preview</h2>";
            uiNewComments.appendChild(uiFutureHeading);
            document.getElementById("cursorarea").appendChild(uiNewComments);
        }

        var frag = document.createDocumentFragment();

        // Inspired by https://gist.github.com/ebidel/3581825
        [].forEach.call(arrCommentsNow, function(cmt, i) {
          let txtHeader = cmt.querySelector('.issuecommentheader');
          const iCommentNumber = /Comment ([0-9]+)/.exec(txtHeader.innerText)[1];
          if (iCommentNumber <= cCommentsAtLoad) return;
          let txtBody = cmt.querySelector('.issuecommentbody');
          let divNew = document.createElement('div');
          divNew.appendChild(txtHeader);
          divNew.appendChild(txtBody);
          frag.appendChild(divNew);
        });
        uiNewComments.appendChild(frag);

        cCommentsAtLoad = cCommentsNow;

        }, false);


        oReq.responseType = 'document';
        oReq.addEventListener("error", fnErr, false);
        oReq.addEventListener("timeout", fnErr, false);

        oReq.open("GET", document.location.href, true);         // TODO: Sanity check?
        oReq.setRequestHeader("Cache-Control", "max-age=0");
        oReq.setRequestHeader("X-Client", "BugWatcher Chrome Extension by elawrence@");
        oReq.timeout = 9500;    // "Nine and a half-seconds out to be enough for anybody."
        oReq.send();
    }

    const uiLastSync = document.createElement("th");
    uiLastSync.id = "uiLastSync";

    const uiUserbar = document.getElementById("userbar");
    const oNow = new Date();
    const sLang = navigator.languages[0] || "en-US";
    uiLastSync.innerHTML = "Loaded<br />" + oNow.toLocaleTimeString(sLang, { hour12: false });
    uiLastSync.title = "This page was first loaded at " + oNow.toLocaleString() + "\nwith " + cCommentsAtLoad + " comments.";
    uiUserbar.parentNode.insertBefore(uiLastSync, uiUserbar);

    let uiAddComment = document.getElementById("addCommentTextArea");

    // Handle case where user is not logged in and thus there's no addComment box to insert before
    if (!uiAddComment) {
        let uiTable = document.getElementById("meta-container");
        let uiRow = uiTable.insertRow(-1);
        uiRow.insertCell();
        let uiCol = uiRow.insertCell();
        uiAddComment = document.createElement("span");
        uiCol.appendChild(uiAddComment);
    }

    const uiSyncInfobar = document.createElement("div");
    uiSyncInfobar.id = "uiSyncInfobar";
    uiSyncInfobar.innerHTML = "<i>This issue last sync'd at <span id=uiAgo>" + Now() + "</span> </i>";
    //"<b>Warning</b>: This bug has been modified since you loaded this page. <a style='text-decoration:none' href='#'>Peek</a>";
    uiAddComment.parentNode.insertBefore(uiSyncInfobar, uiAddComment);
    uiSyncInfobar.addEventListener('click', function(e) { checkForUpdates(); }, false);

    uiAddComment.addEventListener('paste', function(e) { 
        // alert("pasted: " + e.clipboardData.types);
        if (e.clipboardData.types.indexOf('Files') < 0) return;
        var items = e.clipboardData.items;
        for (var i = 0; i < items.length; ++i) {

            if (items[i].kind == 'file' &&
                items[i].type.indexOf('image/') !== -1) {

                var blob = items[i].getAsFile();
                window.URL = window.URL || window.webkitURL;
                var blobUrl = window.URL.createObjectURL(blob);

                var img = document.createElement('img');
                img.src = blobUrl;
                uiAddComment.parentNode.appendChild(img);
            }
            else
                alert("Can't handle " + items[i].kind);
        }
        e.preventDefault(); // We are already handling the data from the clipboard, we do not want it inserted into the document
    }, false);


    function updateClock() {

        // Bail if cancelled
        if (!idTimer) return;

        idTimer = window.setTimeout(updateClock, iSyncMS);

        // Bail fast if hidden. This will only fully work after this bug in Chrome 
        // is fixed: https://bugs.chromium.org/p/chromium/issues/detail?id=532128
        if (document.hidden) {
        // console.log("Skipping update while hidden!"); 
          return; 
        }

        checkForUpdates();
    }

    // TODO:
    // "Monitor" checkbox in the bug UI
}