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

    async handle(event: IEvent): Promise<IResponse> {
        try {
            const isCurrent = await this._tabs.isCurrentTab(event.tabId, event.windowId);
            if(isCurrent) {
                // no action taken, return an empty response
                return {};
            }

            // not the current tab, so need to focus our tab and make sure the correct window is focussed
            const tab = await this._tabs.updateTab(event.tabId, { active: true } as IUpdateTabProps);
            await this._tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps);

            // tab has been focussed, so the popup can now close (if not already closed)
            return { close: true };
        } catch(err) {
            // tab doesn't exist anymore, load the next article
            return await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId, tabId: undefined, token: event.token });
        }
    }
}

export default PopupOpenedEventHandler;