"use strict";

const oUI = document.createElement("th");
oUI.style.width = "100px";
oUI.style.padding = "5px";
oUI.style.background = "#C0FFB0";
const uiUserbar = document.getElementById("userbar");
const oNow = new Date();
oUI.innerText = oNow.toLocaleTimeString(navigator.language, { hour12: false });
oUI.title = "This page was last loaded at " + oNow.toLocaleString();
uiUserbar.parentNode.insertBefore(oUI, uiUserbar);


const uiAddComment = document.getElementById("addCommentTextArea");
const uiJustAbove = document.createElement("div");
uiJustAbove.style.background = "#FAFE63";
uiJustAbove.style.padding = "3px 5px";
uiJustAbove.innerHTML = "<b>Warning</b>: This bug has been modified since you loaded this page. <a style='text-decoration:none' href='#'>Peek</a>";
uiAddComment.parentNode.insertBefore(uiJustAbove, uiAddComment);


// TODO:
// Add "peek" option that pulls comments into markup in the right place
// Add "Refresh keep draft comment"
// Ping with backoff; stop pinging when user is away (somehow)
// "Monitor" checkbox in the bug UI
