import { default as IEventHandler, IEvent, IResponse } from '../IEventHandler';
import ITabManager from '../../tabs/ITabManager';
import IActions from '../../actions/IActions';

class MockEventHandler implements IEventHandler {
    handle: (event: IEvent) => Promise<IResponse>

    constructor(tabs: ITabManager, actions: IActions) {
        this.handle = jest.fn(() => Promise.resolve());
    }
}

export default MockEventHandler;