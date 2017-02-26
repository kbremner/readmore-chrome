/// <reference types="chrome" />
import StorageManager from './storage';
import TabManager from './tabs';
import Actions from './actions';
import EventHandler from './events';

const storage = new StorageManager();
const tabs = new TabManager();
const actions = new Actions();
const eventHandler = new EventHandler(storage, tabs, actions);

chrome.runtime.onInstalled.addListener(details => {
    if(details.reason != "install") {
        return; // only want to handle install
    }

    storage.get('access_token')
        .then(props => {
            if(props['access_token'] === undefined) {
                // no token, so need to open a tab for the user to start the oauth process,
                // redirecting them back to the extension when oauth flow has been completed
                const redirect_url = chrome.extension.getURL('html/popup.html');
                return tabs.createTab(`$baseUri/api/pocket/authorize?redirectUrl=${encodeURIComponent(redirect_url)}`);
            }
        });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    storage.get("access_token", "tab_id")
        .then(items => eventHandler.handle(request, items["access_token"], items["tab_id"]))
        .then(sendResponse)
        .catch(sendResponse);
        
    // response sent asynchronously
    return true;
});