import { Map } from "immutable";
import { IArticleActions } from "../actions/IActions";
import { IStoreData } from "./IStorageManager";

class StoreDataMap implements IStoreData {
    private map: Map<string, any>;

    public constructor(token: string, tabId: number, actions: IArticleActions) {
        this.map = Map({
            access_token: token,
            tab_id: tabId,
            actions,
        });
    }

    public getToken(): string {
        return this.map.get("access_token");
    }

    public getActions(): IArticleActions {
        return this.map.get("actions");
    }

    public getTabId(): number {
        return this.map.get("tab_id");
    }

    public setToken(token: string) {
        const tabId = this.map.get("tab_id");
        const actions = this.map.get("actions");
        return new StoreDataMap(token, tabId, actions);
    }

    public setActions(actions: IArticleActions) {
        const tabId = this.map.get("tab_id");
        const token = this.map.get("access_token");
        return new StoreDataMap(token, tabId, actions);
    }

    public setTabId(tabId: number) {
        const token = this.map.get("access_token");
        const actions = this.map.get("actions");
        return new StoreDataMap(token, tabId, actions);
    }
}

export default StoreDataMap;
