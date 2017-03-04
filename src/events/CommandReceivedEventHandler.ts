import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

class CommandReceivedEventHandler implements IEventHandler {
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(tabs: ITabManager, eventHandler: IEventHandler) {
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        try {
            const isCurrent = await this._tabs.isCurrentTab(data.getTabId(), event.windowId);
            if(!isCurrent) {
                // not the current tab, so need to focus our tab and make sure the correct window is focussed
                const tab = await this._tabs.updateTab(data.getTabId(), { active: true } as IUpdateTabProps);
                await this._tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps);
            }

            // tab is focused, but the user pressed a particular shortcut to execute
            // a specific command, so we should execute that command
            event.type = event.command;
            return await this._eventHandler.handle(event, data);
        } catch(err) {
            // tab doesn't exist anymore, so remove the stored tab ID
            data = data.setTabId(null);
            // if the user requested the next article, fetch it
            if(event.command === "FETCH_NEXT") {
                event.type = event.command;
                return await this._eventHandler.handle(event, data);
            }
            return { store: data };
        }
    }
}

export default CommandReceivedEventHandler;