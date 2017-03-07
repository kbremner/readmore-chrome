import { IStoreData } from "../storage/IStorageManager";
import ITabManager from "../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

/*
 * Handles auth handshake with read more server
 */
class PerformAuthEventHandler implements IEventHandler {
    private tabs: ITabManager;

    constructor(tabs: ITabManager) {
        this.tabs = tabs;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // Need to open a tab for the user to start the oauth process,
        // redirecting them back to the extension when oauth flow has been completed
        const redirecturl = chrome.extension.getURL("html/popup.html");
        await this.tabs.createTab(`$baseUri/api/pocket/authorize?redirectUrl=${encodeURIComponent(redirecturl)}`);
        return { close: true, store: data };
    }
}

export default PerformAuthEventHandler;
