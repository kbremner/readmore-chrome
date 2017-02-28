import IStorageManager from '../IStorageManager';

class MockStorageManager implements IStorageManager {
    get: (...keys: string[]) => Promise<any>
    set: (props: any) => Promise<any>
    remove: (...keys: string[]) => Promise<void>

    constructor() {
        this.get = jest.fn((keys) => Promise.resolve({}));
        this.set = jest.fn((props) => Promise.resolve(props));
        this.remove = jest.fn(() => Promise.resolve());
    }
}

export default MockStorageManager;