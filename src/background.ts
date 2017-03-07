/// <reference types="chrome" />
import Actions from "./actions";
import EventHandler from "./events";
import { IEvent } from "./events/IEventHandler";
import StorageManager from "./storage";
import TabManager from "./tabs";

const storage = new StorageManager();
const tabs = new TabManager();
const actions = new Actions();
const eventHandler = new EventHandler(tabs, actions);

chrome.commands.onCommand.addListener(handleCommand);
chrome.runtime.onInstalled.addListener(handleInstall);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
    // response will be sent asynchronously
    return true;
});

async function handleCommand(command: string) {
    await handleMessage({ type: "COMMAND_RECEIVED", command }, null, () => { /* no-op */ });
}

async function handleInstall(details: chrome.runtime.InstalledDetails) {
    await handleMessage({ type: "INSTALLED", command: details.reason }, null, () => { /* no-op */ });
}

async function handleMessage(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void) {
    let result;
    let error;
    try {
        const data = await storage.getAll();
        result = await eventHandler.handle(request, data);
        await storage.update(result.store);
    } catch (err) {
        error = err;
    }

    try {
        result = result !== undefined ? result : error;
        sendResponse(result);
    } catch (err) {
        console.warn("Failed to send response", JSON.stringify(result), "\n", err);
    }
}
