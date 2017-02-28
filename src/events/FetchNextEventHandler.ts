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

    async handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        // get the next article and save the actions
        const article = await this._actions.next(token);
        await this._storage.set({ actions: article.actions });

        // get the ID of the current tab if we don't have an open tab
        // (currently assume that given tab ID has already been validated, e.g. PopupOpenedEventHandler)
        if(!tabId) {
            const tab = await this._tabs.getCurrentTab(event.windowId);
            tabId = tab.id;
        }

        // update the tab URL and store the tab ID, before telling the popup to close
        await this._tabs.updateTab(tabId, { url: article.url } as IUpdateTabProps);
        await this._storage.set({ tab_id: tabId });
        return { close: true };
    }
}

export default FetchNextEventHandler;