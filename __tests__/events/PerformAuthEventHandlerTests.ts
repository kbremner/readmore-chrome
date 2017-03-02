jest.mock('../../src/tabs');

import PerformAuthEventHandler from '../../src/events/PerformAuthEventHandler';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import { default as IEventHandler, IEvent } from '../../src/events/IEventHandler';

let tabs: ITabManager;
let eventHandler: PerformAuthEventHandler;

const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const POPUP_URL = "chrome-extension://abcd/html/popup.html";
const ENCODED_POPUP_URL = encodeURIComponent(POPUP_URL);

beforeEach(async () => {
    tabs = new TabManager();
    eventHandler = new PerformAuthEventHandler(tabs);
    window.chrome = {
        extension: {
            getURL: jest.fn((url) => POPUP_URL)
        }
    } as any;
});

test("opens tab to start auth process", async () => {
    await eventHandler.handle({ type: "PERFORM_AUTH", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID });
    expect(tabs.createTab).toHaveBeenCalledTimes(1);
    expect(tabs.createTab).toHaveBeenCalledWith("$baseUri/api/pocket/authorize?redirectUrl=" + ENCODED_POPUP_URL);
});

test("tells popup to close", async () => {
    const result = await eventHandler.handle({ type: "PERFORM_AUTH", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID });
    expect(result).toEqual({ close: true });
});