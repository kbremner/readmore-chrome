import { default as ITabManager, IUpdateTabProps, IUpdateProps } from './ITabManager';
import { handleLastError } from '../chrome';

class ChromeTabManager implements ITabManager {
    async isCurrentTab(tabId: number, windowId: number) {
        /* 
         * We can't just ask if the tab's window is focused, as the
         * window is not focused when the popup is shown...
         * The popup gives us the ID of the window it is open in,
         * so we can check if the tab is active in that window.
         */
        const results = await this.queryTabs({ windowId, active: true });
        return results.findIndex(tab => tab.id === tabId) !== -1;
    }

    private getWindow(windowId: number) {
        return new Promise<chrome.windows.Window>((resolve, reject) => {
            chrome.windows.get(windowId, window => handleLastError(resolve, reject, window));
        });
    }

    private getTab(tabId: number) {
        return new Promise<chrome.tabs.Tab>((resolve, reject) => {
            chrome.tabs.get(tabId, tab => handleLastError(resolve, reject, tab));
        });
    }

    private queryTabs(queryInfo: chrome.tabs.QueryInfo) {
        return new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
            chrome.tabs.query(queryInfo, tabs => handleLastError(resolve, reject, tabs));
        });
    }

    updateTab(tabId: number, props: IUpdateTabProps) {
        return new Promise<chrome.tabs.Tab>((resolve, reject) => {
            chrome.tabs.update(tabId, props, tab => handleLastError(resolve, reject, tab));
        });
    }

    updateWindow(windowId: number, props: IUpdateProps) {
        let updateProps = props as any;
        // convert active property to focused
        updateProps.focused = props.active; 
        delete updateProps.active;
        return new Promise<chrome.windows.Window>((resolve, reject) => {
            chrome.windows.update(windowId, updateProps, window => handleLastError(resolve, reject, window));
        });
    }

    createTab(url: string) {
        return new Promise<chrome.tabs.Tab>((resolve, reject) => {
            chrome.tabs.create({ url, active: true }, newTab => handleLastError(resolve, reject, newTab));
        });
    }

    getCurrentTab(windowId: number) {
        return new Promise<chrome.tabs.Tab>((resolve, reject) => {
            chrome.tabs.query({ active: true, windowId: windowId }, tabs => handleLastError(resolve, reject, tabs[0]));
        });
    }

    getCurrentWindow() {
        return new Promise<chrome.windows.Window>((resolve, reject) => {
            chrome.windows.getCurrent(window => handleLastError(resolve, reject, window));
        });
    }
}

export default ChromeTabManager;