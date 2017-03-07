import { default as IActions, IArticle } from "../IActions";

class MockActions implements IActions {
    public next: (token: string) => Promise<IArticle>;
    public performAction: (actionUrl: string) => Promise<{}>;

    constructor() {
        this.next = jest.fn(() => Promise.resolve({}));
        this.performAction = jest.fn(() => Promise.resolve({}));
    }
}

export default MockActions;
