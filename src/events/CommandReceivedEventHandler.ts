import IStorageManager from '../storage/IStorageManager';
import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class CommandReceivedEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _tabs: ITabManager
    private _eventHandler: IEventHandler

    constructor(storage: IStorageManager, tabs: ITabManager, eventHandler: IEventHandler) {
        this._storage = storage;
        this._tabs = tabs;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent): Promise<IResponse> {
        // didn't get window ID from a popup, so need to get the ID of the current window
        const window = await this._tabs.getCurrentWindow();
        event.windowId = window.id;

        try {
            const isCurrent = await this._tabs.isCurrentTab(event.tabId, event.windowId);
            if(!isCurrent) {
                // not the current tab, so need to focus our tab and make sure the correct window is focussed
                const tab = await this._tabs.updateTab(event.tabId, { active: true } as IUpdateTabProps);
                await this._tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps);
            }

            // tab is focused, but the user pressed a particular shortcut to execute
            // a specific command, so we should execute that command
            event.type = event.command;
            return await this._eventHandler.handle(event);
        } catch(err) {
            // tab doesn't exist anymore, so remove the stored tab ID
            await this._storage.remove("tab_id");
            // if the user requested the next article, fetch it
            if(event.command === "FETCH_NEXT") {
                event.type = event.command;
                event.tabId = undefined;
                return await this._eventHandler.handle(event);
            }
        }
    }
}

export default CommandReceivedEventHandler;