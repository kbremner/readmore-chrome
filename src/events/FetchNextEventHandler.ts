import IActions from '../actions/IActions';
import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

class FetchNextEventHandler implements IEventHandler {
    private _tabs: ITabManager
    private _actions: IActions

    constructor(tabs: ITabManager, actions: IActions) {
        this._tabs = tabs;
        this._actions = actions;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        // get the next article and save the actions
        const article = await this._actions.next(data.getToken());
        data = data.setActions(article.actions);

        if(!data.getTabId()) {
            // no tab ID specified, create a new tab
            const tab = await this._tabs.createTab(article.url);
            data = data.setTabId(tab.id);
        } else {
            // update the tab URL and store the tab ID, before telling the popup to close
            await this._tabs.updateTab(data.getTabId(), { url: article.url } as IUpdateTabProps);
        }

        return { close: true, store: data };
    }
}

export default FetchNextEventHandler;