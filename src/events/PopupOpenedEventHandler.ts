import { IStoreData } from "../storage/IStorageManager";
import { default as ITabManager, IUpdateProps, IUpdateTabProps } from "../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

class PopupOpenedEventHandler implements IEventHandler {
    private tabs: ITabManager;
    private eventHandler: IEventHandler;

    constructor(tabs: ITabManager, eventHandler: IEventHandler) {
        this.tabs = tabs;
        this.eventHandler = eventHandler;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        try {
            const isCurrent = await this.tabs.isCurrentTab(data.getTabId(), event.windowId);
            if (isCurrent) {
                // no action taken, return an empty response
                return { store: data };
            }

            // not the current tab, so need to focus our tab and make sure the correct window is focussed
            const tab = await this.tabs.updateTab(data.getTabId(), { active: true } as IUpdateTabProps);
            await this.tabs.updateWindow(tab.windowId, { active: true } as IUpdateProps);

            // tab has been focussed, so the popup can now close (if not already closed)
            return { close: true, store: data };
        } catch (err) {
            // tab doesn"t exist anymore, load the next article
            data = data.setTabId(null);
            return await this.eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId }, data);
        }
    }
}

export default PopupOpenedEventHandler;
