import IActions from '../actions/IActions';
import IStorageManager from '../storage/IStorageManager';
import { default as ITabManager, IUpdateTabProps, IUpdateProps } from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class FetchNextEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _tabs: ITabManager
    private _actions: IActions

    constructor(storage: IStorageManager, tabs: ITabManager, actions: IActions) {
        this._storage = storage;
        this._tabs = tabs;
        this._actions = actions;
    }

    async handle(event: IEvent): Promise<IResponse> {
        // get the next article and save the actions
        const article = await this._actions.next(event.token);
        await this._storage.set({ actions: article.actions });

        if(!event.tabId) {
            // no tab ID specified, create a new tab
            const tab = await this._tabs.createTab(article.url);
            event.tabId = tab.id;
        } else {
            // update the tab URL and store the tab ID, before telling the popup to close
            await this._tabs.updateTab(event.tabId, { url: article.url } as IUpdateTabProps);
        }

        await this._storage.set({ tab_id: event.tabId });
        return { close: true };
    }
}

export default FetchNextEventHandler;