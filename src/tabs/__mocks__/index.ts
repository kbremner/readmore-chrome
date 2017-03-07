import { default as ITabManager, ITab, IUpdateProps, IUpdateTabProps, IWindow } from "../ITabManager";

class MockTabManager implements ITabManager {
    public isCurrentTab: (tabId: number, windowId: number) => Promise<boolean>;
    public updateTab: (tabId: number, props: IUpdateTabProps) => Promise<ITab>;
    public updateWindow: (windowId: number, props: IUpdateProps) => Promise<IWindow>;
    public createTab: (url: string) => Promise<ITab>;
    public getCurrentTab: (windowId: number) => Promise<ITab>;
    public getCurrentWindow: () => Promise<IWindow>;

    constructor() {
        this.isCurrentTab = jest.fn((tabId, windowId) => Promise.resolve(true));
        this.updateTab = jest.fn((tabId, props) => Promise.resolve({ id: 1, windowId: 2 } as ITab));
        this.updateWindow = jest.fn((windowId, props) => Promise.resolve({ id: 2 } as IWindow));
        this.createTab = jest.fn((url) => Promise.resolve({ id: 1, windowId: 2 } as ITab));
        this.getCurrentTab = jest.fn((windowId) => Promise.resolve({ id: 1, windowId: 2 } as ITab));
        this.getCurrentWindow = jest.fn(() => Promise.resolve({ id: 2 } as IWindow));
    }
}

export default MockTabManager;
