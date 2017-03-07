import IActions from "../../actions/IActions";
import ITabManager from "../../tabs/ITabManager";
import { default as IEventHandler, IEvent, IResponse } from "../IEventHandler";

class MockEventHandler implements IEventHandler {
    public handle: (event: IEvent) => Promise<IResponse>;

    constructor(tabs: ITabManager, actions: IActions) {
        this.handle = jest.fn(() => Promise.resolve());
    }
}

export default MockEventHandler;
