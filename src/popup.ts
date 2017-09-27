/// <reference types="chrome" />
import TabManager from "./tabs";

const tabs = new TabManager();

document.addEventListener("DOMContentLoaded", (event) => {
    // if we've been redirected and there's an error var, we don't have access to user's account
    const authError = getQueryVariable("error");
    if (authError) {
        console.error("Failed to complete authentication:", authError);
        document.getElementById("auth-error-msg").style.display = null;
        document.getElementById("auth-retry").onclick = sendEvent.bind(null, { type: "PERFORM_AUTH" });
        return;
    }

    document.getElementById("react-root").style.display = null;

    // if we've been redirected to this page and there's an access token, need to store it
    const accessToken = getQueryVariable("xAccessToken");
    if (accessToken) {
        sendEvent({ type: "TOKEN_RECEIVED", token: accessToken });
    } else {
        document.getElementById("archive").onclick = sendEvent.bind(null, { type: "HANDLE_ARCHIVE" });
        document.getElementById("delete").onclick = sendEvent.bind(null, { type: "HANDLE_DELETE" });
        document.getElementById("next").onclick = sendEvent.bind(null, { type: "FETCH_NEXT" });
        document.getElementById("repo-link").onclick =
            () => tabs.createTab("https://github.com/defining-technology/readmore-chrome");
        document.getElementById("company-link").onclick = () => tabs.createTab("https://defining.tech");
        sendEvent({ type: "POPUP_OPENED" });
    }
});

async function sendEvent(event: any) {
    // start the spinner
    const spinner = document.getElementById("overlay-spinner");
    spinner.hidden = false;

    // get the current window
    // need to do this as the current/last-focused window from the
    // point of view of the background script is not always the
    // one the user is actually looking at... There are some
    // confusing rules around "current" window, so easiest thing
    // is to take it from the point of view of the popup.
    const currentWindow = await tabs.getCurrentWindow();
    event.windowId = currentWindow.id;

    chrome.runtime.sendMessage(event, (response) => {
        if (response.close) {
            // background script wants the popup to close
            close();
        } else if (!response.keepSpinner) {
            // make sure the spinner is no longer visible
            spinner.hidden = true;
        }
    });
}

// based on implementation at https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
    const query = window.location.search.substring(1); // skip the question mark
    const vars = query.split("&");
    for (let v of vars) {
        const pair = v.split("=");
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}
