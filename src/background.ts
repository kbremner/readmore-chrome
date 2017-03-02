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
    await eventHandler.handle({ type: "COMMAND_RECEIVED", command } as IEvent);
}

async function handleInstall(details: chrome.runtime.InstalledDetails) {
    await eventHandler.handle({ type: "INSTALLED", command: details.reason } as IEvent);
}

async function handleMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
    try {
        const result = await eventHandler.handle(request);
        sendResponse(result);
    } catch(err) {
        sendResponse(err);
    }
}