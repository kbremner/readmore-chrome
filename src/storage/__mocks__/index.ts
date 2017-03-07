import { default as IStorageManager, IStoreData } from "../IStorageManager";

class MockStorageManager implements IStorageManager {
    public getAll: () => Promise<IStoreData>;
    public update: (data: IStoreData) => Promise<void>;

    constructor() {
        this.getAll = jest.fn((keys) => Promise.resolve({}));
        this.update = jest.fn((data) => Promise.resolve());
    }
}

export default MockStorageManager;
