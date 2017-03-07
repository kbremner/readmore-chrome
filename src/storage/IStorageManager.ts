import { IArticleActions } from "../actions/IActions";

interface IStorageManager {
    getAll(): Promise<IStoreData>;
    update(data: IStoreData): Promise<void>;
}

export interface IStoreData {
    getToken(): string;
    getActions(): IArticleActions;
    getTabId(): number;

    setToken(token: string): IStoreData;
    setActions(actions: IArticleActions): IStoreData;
    setTabId(tabId: number): IStoreData;
}

export default IStorageManager;
