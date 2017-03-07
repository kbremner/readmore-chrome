import { IStoreData } from "../storage/IStorageManager";
import ITabManager from "../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

class TokenReceivedEventHandler implements IEventHandler {
    private tabs: ITabManager;
    private eventHandler: IEventHandler;

    constructor(tabs: ITabManager, eventHandler: IEventHandler) {
        this.tabs = tabs;
        this.eventHandler = eventHandler;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // show an article in the current tab (which will be the popup that the server redirected to)
        const tab = await this.tabs.getCurrentTab(event.windowId);
        data = data
            .setTabId(tab.id)
            .setToken(event.token);
        const result = await this.eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId } as IEvent, data);
        return { keepSpinner: true, store: result.store };
    }
}

export default TokenReceivedEventHandler;
