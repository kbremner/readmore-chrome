import { default as IActions, IArticle } from '../IActions';

class MockActions implements IActions {
    next: (token: string) => Promise<IArticle>
    performAction: (actionUrl: string) => Promise<{}>

    constructor() {
        this.next = jest.fn(() => Promise.resolve({}));
        this.performAction = jest.fn(() => Promise.resolve({}));
    }
}

export default MockActions;