import IStorageManager from '../storage/IStorageManager';
import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class PopupOpenedEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(storage: IStorageManager, tabs: ITabManager, eventHandler: IEventHandler) {
        this._storage = storage;
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        // if it's not focussed, do that
        return this._tabs.isCurrentTab(tabId, event.windowId)
            .then(isCurrent => isCurrent
                        ? {} // empty response
                        : this._tabs.updateTab(tabId, { active: true } as IUpdateTabProps)
                            .then(tab => this._tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps))
                            .then(() => { return { close: true } }))
            // tab doesn't exist anymore, load the next article
            .catch(err => this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId }, token, undefined));
    }
}

export default PopupOpenedEventHandler;