import { default as ITabManager, IUpdateTabProps, IUpdateProps } from './ITabManager';
import { handleLastError } from '../chrome';

class ChromeTabManager implements ITabManager {
    isCurrentTab(tabId: number, windowId: number) {
        return this.queryTabs({ windowId: windowId, active: true})
            .then(tabs => tabs.findIndex(tab => tab.id == tabId) !== -1);
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
}

export default ChromeTabManager;