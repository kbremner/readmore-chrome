import IActions from "../actions/IActions";
import { IStoreData } from "../storage/IStorageManager";
import { default as ITabManager, IUpdateProps, IUpdateTabProps } from "../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

class FetchNextEventHandler implements IEventHandler {
    private tabs: ITabManager;
    private actions: IActions;

    constructor(tabs: ITabManager, actions: IActions) {
        this.tabs = tabs;
        this.actions = actions;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // get the next article and save the actions
        const article = await this.actions.next(data.getToken());
        data = data.setActions(article.actions);

        if (!data.getTabId()) {
            // no tab ID specified, create a new tab
            const tab = await this.tabs.createTab(article.url);
            data = data.setTabId(tab.id);
        } else {
            // update the tab URL and store the tab ID, before telling the popup to close
            await this.tabs.updateTab(data.getTabId(), { url: article.url } as IUpdateTabProps);
        }

        return { close: true, store: data };
    }
}

export default FetchNextEventHandler;
