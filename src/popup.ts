/// <reference types="chrome" />
import TabManager from './tabs';

const tabs = new TabManager();

document.addEventListener("DOMContentLoaded", (event) => {
    // if we've been redirected and there's an error var, we don't have access to user's account
    const auth_error = getQueryVariable("error");
    if(auth_error) {
        console.error("Failed to complete authentication:", auth_error);
        document.getElementById("react-root").textContent = "Failed to complete authentication. Did you grant access to your pocket account?";
        return;
    }

    // start the spinner
    document.getElementById("overlay-spinner").hidden = false;

    // if we've been redirected to this page and there's an access token, need to store it
    const access_token = getQueryVariable("xAccessToken");
    if(access_token) {
        sendEvent({ type: "TOKEN_RECEIVED", token: access_token });
    } else {
        document.getElementById("archive").onclick = sendEvent.bind(null, { type: "HANDLE_ARCHIVE" });
        document.getElementById("delete").onclick = sendEvent.bind(null, { type: "HANDLE_DELETE" });
        document.getElementById("next").onclick = sendEvent.bind(null, { type: "FETCH_NEXT" });
        document.getElementById("repo-link").onclick = () => tabs.createTab("https://github.com/defining-technology/readmore-chrome");
        document.getElementById("company-link").onclick = () => tabs.createTab("https://defining.tech");
        sendEvent({ type: "POPUP_OPENED" }, () => document.getElementById("overlay-spinner").hidden = true);
    }
});

function sendEvent(event: any, callback?: (response: any) => void) {
    document.getElementById("overlay-spinner").hidden = false;
    chrome.windows.getCurrent(window => {
        event.windowId = window.id;
        chrome.runtime.sendMessage(event, (response) => {
            if(response.close) {
                close();
            } else if(callback) {
                callback(response);
            }
        })
    });
}

// based on implementation at https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
    const query = window.location.search.substring(1); // skip the question mark
    const vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if(decodeURIComponent(pair[0]) == variable){
            return decodeURIComponent(pair[1]);
        }
    }
}