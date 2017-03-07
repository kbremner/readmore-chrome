/// <reference types="chrome" />
import { handleLastError } from "../chrome";
import { default as IStorageManager, IStoreData } from "./IStorageManager";
import StoreDataMap from "./StoreDataMap";

class ChromeStorageManager implements IStorageManager {
    private storage: chrome.storage.LocalStorageArea;

    public constructor(storage = chrome.storage.local) {
        this.storage = storage;
    }

    public async getAll(): Promise<IStoreData> {
        const items = await this.get("access_token", "tab_id", "actions");
        return new StoreDataMap(items.access_token, items.tab_id, items.actions);
    }

    public async update(data: IStoreData): Promise<void> {
        await this.set({
            access_token: data.getToken(),
            actions: data.getActions(),
            tab_id: data.getTabId(),
        });
    }

    private get(...keys: string[]) {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            this.storage.get(keys, (items) => handleLastError(resolve, reject, items));
        });
    }

    private set(props: { [key: string]: any }) {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            this.storage.set(props, () => handleLastError(resolve, reject, props));
        });
    }
}

export default ChromeStorageManager;
