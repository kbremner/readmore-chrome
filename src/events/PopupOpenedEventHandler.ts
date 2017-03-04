import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

class PopupOpenedEventHandler implements IEventHandler {
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(tabs: ITabManager, eventHandler: IEventHandler) {
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        try {
            const isCurrent = await this._tabs.isCurrentTab(data.getTabId(), event.windowId);
            if(isCurrent) {
                // no action taken, return an empty response
                return { store: data };
            }

            // not the current tab, so need to focus our tab and make sure the correct window is focussed
            const tab = await this._tabs.updateTab(data.getTabId(), { active: true } as IUpdateTabProps);
            await this._tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps);

            // tab has been focussed, so the popup can now close (if not already closed)
            return { close: true, store: data };
        } catch(err) {
            // tab doesn't exist anymore, load the next article
            data = data.setTabId(null);
            return await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId }, data);
        }
    }
}

export default PopupOpenedEventHandler;