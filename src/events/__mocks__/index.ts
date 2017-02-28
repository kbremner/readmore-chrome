import { default as IEventHandler, IEvent, IResponse } from '../IEventHandler';
import IStorageManager from '../../storage/IStorageManager';
import ITabManager from '../../tabs/ITabManager';
import IActions from '../../actions/IActions';

class MockEventHandler implements IEventHandler {
    handle: (event: IEvent) => Promise<IResponse>

    constructor(storage: IStorageManager, tabs: ITabManager, actions: IActions) {
        this.handle = jest.fn(() => Promise.resolve());
    }
}

export default MockEventHandler;