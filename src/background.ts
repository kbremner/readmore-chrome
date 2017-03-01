/// <reference types="chrome" />
import StorageManager from './storage';
import TabManager from './tabs';
import Actions from './actions';
import EventHandler from './events';
import { IEvent } from './events/IEventHandler';

const storage = new StorageManager();
const tabs = new TabManager();
const actions = new Actions();
const eventHandler = new EventHandler(storage, tabs, actions);

chrome.commands.onCommand.addListener(handleCommand);
chrome.runtime.onInstalled.addListener(handleInstall);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
    // response will be sent asynchronously
    return true;
});


async function handleCommand(command: string) {
    const items = await storage.get("access_token", "tab_id");
    const request = {
        type: "COMMAND_RECEIVED",
        command,
        tabId: items["tab_id"],
        token: items["access_token"]
    } as IEvent;
    await eventHandler.handle(request);
}

async function handleInstall(details: chrome.runtime.InstalledDetails) {
    if(details.reason != "install") {
        return; // only want to handle first-time install
    }

    const items = await storage.get("access_token");
    if(items["access_token"] === undefined) {
        // no token, so need to open a tab for the user to start the oauth process,
        // redirecting them back to the extension when oauth flow has been completed
        const redirect_url = chrome.extension.getURL('html/popup.html');
        await tabs.createTab(`$baseUri/api/pocket/authorize?redirectUrl=${encodeURIComponent(redirect_url)}`);
    }
}

async function handleMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
    const items = await storage.get("access_token", "tab_id");
    try {
        request.tabId = items["tab_id"];
        if(!request.token) {
            request.token = items["access_token"];
        }
        const result = await eventHandler.handle(request);
        sendResponse(result);
    } catch(err) {
        sendResponse(err);
    }
}