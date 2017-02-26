/// <reference types="chrome" />
import { handleLastError } from '../chrome';
import IStorageManager from './IStorageManager';

class ChromeStorageManager implements IStorageManager {
    private _storage: chrome.storage.LocalStorageArea

    public constructor(storage = chrome.storage.local) {
        this._storage = storage;
    }

    public get(...keys: string[]): Promise<{ [key: string]: any }> {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            this._storage.get(keys, (items) => handleLastError(resolve, reject, items));
        });
    }

    public set(props: { [key: string]: any }) {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            this._storage.set(props, () => handleLastError(resolve, reject, props));
        });
    }

    public remove(...keys: string[]) {
        return new Promise((resolve, reject) => {
            this._storage.remove(keys, () => handleLastError(resolve, reject, undefined));
        });
    }
}

export default ChromeStorageManager;