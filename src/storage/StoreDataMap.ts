import { Map } from 'immutable';
import { IArticleActions } from '../actions/IActions';
import { IStoreData } from './IStorageManager';

class StoreDataMap implements IStoreData {
    private _map: Map<string, any>;

    public constructor(token: string, tabId: number, actions: IArticleActions) {
        this._map = Map({
            access_token: token,
            tab_id: tabId,
            actions
        });
    }

    getToken(): string {
        return this._map.get("access_token");
    }

    getActions(): IArticleActions {
        return this._map.get("actions");
    }

    getTabId(): number {
        return this._map.get("tab_id");
    }

    setToken(token: string) {
        const tabId = this._map.get("tab_id");
        const actions = this._map.get("actions");
        return new StoreDataMap(token, tabId, actions);
    }

    setActions(actions: IArticleActions) {
        const tabId = this._map.get("tab_id");
        const token = this._map.get("access_token");
        return new StoreDataMap(token, tabId, actions);
    }

    setTabId(tabId: number) {
        const token = this._map.get("access_token");
        const actions = this._map.get("actions");
        return new StoreDataMap(token, tabId, actions);
    }
}

export default StoreDataMap;