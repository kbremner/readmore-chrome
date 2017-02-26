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

    handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        return this._storage.set({ access_token: event.token })
            .then(items => this._tabs.getCurrentTab(event.windowId))
            .then(tab => this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId } as IEvent, event.token, tab.id))
            // return empty response so tab isn't closed
            .then(() => ({} as IResponse));
    }
}


export default TokenReceivedEventHandler;