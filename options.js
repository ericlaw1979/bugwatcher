"use strict";

const arrTimespans = [[ "15 seconds", 15000], ["30 seconds", 30000], ["45 seconds", 45000], ["1 Minute", 60000],
                     [ "2 minutes", 120000], ["5 minutes", 300000], ["10 minutes", 600000], ["15 minutes", 900000],
                     ["30 minutes", 180000], ["One hour", 3600000], ["Two hours", 7200000], ["Four hours", 14400000]];

document.addEventListener('DOMContentLoaded', function() {

    const rangeUpdateInterval = document.getElementById("rangeUpdateInterval");
    const txtUpdateInterval = document.getElementById("txtUpdateInterval");
    rangeUpdateInterval.min = 0; rangeUpdateInterval.max = arrTimespans.length-1;

    chrome.storage.sync.get(null, function(prefs) 
    {
        let iMS = 60000;
        if (prefs) {
            iMS = prefs["iSyncMS"];
            if (iMS < 15000) iMS = 15000;
        }

        for (let ix = 0; ix < arrTimespans.length; ix++)
        {
            if (arrTimespans[ix][1] === iMS) {
              rangeUpdateInterval.value = ix;
              break;
            }
        }
//        document.getElementById("cbRotateImages").checked = !(prefs && (false === prefs["bRotateNonSecureImages"]));
 //       document.getElementById("cbWarnOnNonSecureDownloads").checked = (prefs && (true === prefs["bWarnOnNonSecureDownloads"]));
      txtUpdateInterval.value = arrTimespans[rangeUpdateInterval.value][0];
    });

    rangeUpdateInterval.addEventListener("input", function() { 
      txtUpdateInterval.value = arrTimespans[rangeUpdateInterval.value][0]; 
      saveChanges(); 
    }, false);

/*    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    for (i=0; i<checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', saveChanges, false);
    }*/

}, false);

function saveChanges() {
    var status = document.getElementById("txtStatus");
    status.textContent = "Saving...";
    const rangeUpdateInterval = document.getElementById("rangeUpdateInterval");
    chrome.storage.sync.set({"iSyncMS": arrTimespans[rangeUpdateInterval.value][1]}, null);
    status.textContent = "Saved";

    setTimeout(function() { status.innerHTML = "&nbsp;"; }, 450);
}
