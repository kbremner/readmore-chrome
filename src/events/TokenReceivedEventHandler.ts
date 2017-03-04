import ITabManager from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

class TokenReceivedEventHandler implements IEventHandler {
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(tabs: ITabManager, eventHandler: IEventHandler) {
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // show an article in the current tab (which will be the popup that the server redirected to)
        const tab = await this._tabs.getCurrentTab(event.windowId);
        data = data
            .setTabId(tab.id)
            .setToken(event.token);
        const result = await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId } as IEvent, data);
        return { keepSpinner: true, store: result.store };
    }
}


export default TokenReceivedEventHandler;