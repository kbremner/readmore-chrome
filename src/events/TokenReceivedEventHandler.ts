import IStorageManager from '../storage/IStorageManager';
import ITabManager from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class TokenReceivedEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(storage: IStorageManager, tabs: ITabManager, eventHandler: IEventHandler) {
        this._storage = storage;
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent): Promise<IResponse> {
        await this._storage.set({ access_token: event.token });
        
        // updated the access token, now lets show an article in the current tab
        // (which will be the popup that the server redirected to)
        const tab = await this._tabs.getCurrentTab(event.windowId);
        await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId, tabId: tab.id, token: event.token } as IEvent);

        // Make sure to return an empty response so that the tab the popup was shown in isn't closed
        return { keepSpinner: true };
    }
}


export default TokenReceivedEventHandler;