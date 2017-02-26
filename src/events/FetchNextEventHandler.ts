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

    handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        return this._actions.next(token)
            // save the actions
            .then(resp => this._storage.set({ actions: resp.actions }).then(() => resp.url))
            .then(url => {
                const promise = tabId
                    ? Promise.resolve(tabId)
                    : this._tabs.getCurrentTab(event.windowId).then(tab => tab.id);
                return promise.then(id => this._tabs.updateTab(id, { url } as IUpdateTabProps));
            })
            // update the stored tab ID
            .then(newTab => this._storage.set({ tab_id: newTab.id }))
            .then(items => { return { close: true } });
    }
}

export default FetchNextEventHandler;