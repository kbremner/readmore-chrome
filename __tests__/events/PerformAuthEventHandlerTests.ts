jest.mock('../../src/tabs');

import PerformAuthEventHandler from '../../src/events/PerformAuthEventHandler';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import { default as IEventHandler, IEvent, IResponse } from '../../src/events/IEventHandler';
import { IStoreData } from '../../src/storage/IStorageManager';
import StoreDataMap from '../../src/storage/StoreDataMap';

let tabs: ITabManager;
let storeData: IStoreData;
let eventHandler: PerformAuthEventHandler;
let result: IResponse;

const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const POPUP_URL = "chrome-extension://abcd/html/popup.html";
const ENCODED_POPUP_URL = encodeURIComponent(POPUP_URL);

beforeEach(async () => {
    tabs = new TabManager();
    storeData = new StoreDataMap(ACCESS_TOKEN, TAB_ID, null);
    eventHandler = new PerformAuthEventHandler(tabs);
    window.chrome = {
        extension: {
            getURL: jest.fn((url) => POPUP_URL)
        }
    } as any;
    result = await eventHandler.handle({ type: "PERFORM_AUTH", windowId: WINDOW_ID }, storeData);
});

test("opens tab to start auth process", () => {
    expect(tabs.createTab).toHaveBeenCalledTimes(1);
    expect(tabs.createTab).toHaveBeenCalledWith("$baseUri/api/pocket/authorize?redirectUrl=" + ENCODED_POPUP_URL);
});

test("tells popup to close", () => {
    expect(result.close).toBe(true);
});

test("doesn't update the store", () => {
    expect(result.store).toEqual(storeData);
});