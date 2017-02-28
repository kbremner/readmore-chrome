import { default as ITabManager, ITab, IWindow, IUpdateProps, IUpdateTabProps } from '../ITabManager';

class MockTabManager implements ITabManager {
    isCurrentTab: (tabId: number, windowId: number) => Promise<boolean>
    updateTab: (tabId: number, props: IUpdateTabProps) => Promise<ITab>
    updateWindow: (windowId: number, props: IUpdateProps) => Promise<IWindow>
    createTab: (url: string) => Promise<ITab>
    getCurrentTab: (windowId: number) => Promise<ITab>

    constructor() {
        this.isCurrentTab = jest.fn((tabId, windowId) => Promise.resolve(true));
        this.updateTab = jest.fn((tabId, props) => Promise.resolve({ id: 1, windowId: 2 } as ITab));
        this.updateWindow = jest.fn((windowId, props) => Promise.resolve({ id: 2 } as IWindow));
        this.createTab = jest.fn(url => Promise.resolve({ id: 1, windowId: 2 } as ITab));
        this.getCurrentTab = jest.fn(windowId => Promise.resolve({ id: 1, windowId: 2 } as ITab));
    }
}

export default MockTabManager;