import IActions from "../actions/IActions";
import { IStoreData } from "../storage/IStorageManager";
import { default as ITabManager, IUpdateProps, IUpdateTabProps } from "../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

class FetchNextEventHandler implements IEventHandler {
    private tabs: ITabManager;
    private actions: IActions;
    private eventHandler: IEventHandler;

    constructor(tabs: ITabManager, actions: IActions, eventHandler: IEventHandler) {
        this.tabs = tabs;
        this.actions = actions;
        this.eventHandler = eventHandler;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // get the next article and save the actions
        let article;
        try {
            article = await this.actions.next(data.getToken());
        } catch (err) {
            // We were unable to retrieve the next article.
            // At this point, the best course of action is
            // to assume that the user has revoked our
            // access rights, requiring us to re-authenticate.
            console.error("Failed to fetch next article", err);
            return await this.eventHandler.handle({
                type: "PERFORM_AUTH",
                windowId: event.windowId,
            } as IEvent, data);
        }

        data = data.setActions(article.actions);

        if (!data.getTabId()) {
            // no tab ID specified, create a new tab
            const tab = await this.tabs.createTab(article.url);
            data = data.setTabId(tab.id);
        } else {
            // update the tab URL and store the tab ID, before
            // telling the popup to close
            await this.tabs.updateTab(data.getTabId(), {
                url: article.url,
            } as IUpdateTabProps);
        }

        return { close: true, store: data };
    }
}

export default FetchNextEventHandler;
