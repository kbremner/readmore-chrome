import ITabManager from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

/*
 * Handles auth handshake with read more server
 */
class PerformAuthEventHandler implements IEventHandler {
    private _tabs: ITabManager

    constructor(tabs: ITabManager) {
        this._tabs = tabs;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // Need to open a tab for the user to start the oauth process,
        // redirecting them back to the extension when oauth flow has been completed
        const redirect_url = chrome.extension.getURL('html/popup.html');
        await this._tabs.createTab(`$baseUri/api/pocket/authorize?redirectUrl=${encodeURIComponent(redirect_url)}`);
        return { close: true, store: data };
    }
}

export default PerformAuthEventHandler;