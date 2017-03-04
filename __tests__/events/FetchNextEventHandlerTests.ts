jest.mock('../../src/storage/StoreDataMap');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import FetchNextEventHandler from '../../src/events/FetchNextEventHandler';
import { default as IStorageManager, IStoreData } from '../../src/storage/IStorageManager';
import StoreDataMap from '../../src/storage/StoreDataMap';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import IActions from '../../src/actions/IActions';
import Actions from '../../src/actions';
import { default as IEventHandler, IEvent, IResponse } from '../../src/events/IEventHandler';

let storeData: IStoreData;
let updatedStore: IStoreData;
let updatedStore2: IStoreData;
let tabs: ITabManager;
let actions: IActions;
let eventHandler: FetchNextEventHandler;
let result: IResponse;

const ARCHIVE_URL = "archiveurl";
const ARTICLE_URL = "articleurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const NEW_TAB_ID = 22;
const ACCESS_TOKEN = "token";
const EXPECTED_RESPONSE = { test: true };
const NEXT_ACTION_RESULT = { actions: { archive: ARCHIVE_URL }, url: ARTICLE_URL };

beforeEach(async () => {
    tabs = new TabManager();
    actions = new Actions();
    storeData = new StoreDataMap(null, null, null);
    updatedStore = new StoreDataMap(null, null, null);
    updatedStore2 = new StoreDataMap(null, null, null);

    storeData.getToken = jest.fn(() => ACCESS_TOKEN);
    storeData.setActions = jest.fn(() => updatedStore);
    updatedStore.setTabId = jest.fn(() => updatedStore2);
    actions.next = jest.fn(() => Promise.resolve(NEXT_ACTION_RESULT));

    eventHandler = new FetchNextEventHandler(tabs, actions);
});

describe("when tab ID is set", () => {
    let result: IResponse;
    beforeEach(async () => {
        updatedStore.getTabId = jest.fn(() => TAB_ID);
        tabs.updateTab = jest.fn(() => Promise.resolve());
        result = await eventHandler.handle({ type: "FETCH_NEXT", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("gets next article", () => {
        expect(actions.next).toHaveBeenCalledTimes(1);
        expect(actions.next).toHaveBeenCalledWith(ACCESS_TOKEN);
    });

    test("adds the received actions to the store", () => {
        expect(storeData.setActions).toHaveBeenCalledTimes(1);
        expect(storeData.setActions).toHaveBeenCalledWith(NEXT_ACTION_RESULT.actions);
    });

    test("updates specified tab", () => {
        expect(tabs.updateTab).toHaveBeenCalledTimes(1);
        expect(tabs.updateTab).toHaveBeenCalledWith(TAB_ID, { url: ARTICLE_URL });
    });

    test("returns store with updated actions", () => {
        expect(result).toEqual({ close: true, store: updatedStore });
    });
});

describe("when tab ID is not set", () => {
    let result: IResponse;
    beforeEach(async () => {
        updatedStore.getTabId = jest.fn(() => undefined);
        tabs.createTab = jest.fn(() => Promise.resolve({ id: NEW_TAB_ID }));
        result = await eventHandler.handle({ type: "FETCH_NEXT", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("gets next article", () => {
        expect(actions.next).toHaveBeenCalledTimes(1);
        expect(actions.next).toHaveBeenCalledWith(ACCESS_TOKEN);
    });

    test("adds the received actions to the store", () => {
        expect(storeData.setActions).toHaveBeenCalledTimes(1);
        expect(storeData.setActions).toHaveBeenCalledWith(NEXT_ACTION_RESULT.actions);
    });

    test("creates a new tab", () => {
        expect(tabs.createTab).toHaveBeenCalledTimes(1);
        expect(tabs.createTab).toHaveBeenCalledWith(ARTICLE_URL);
    });

    test("stores ID of new tab", () => {
        expect(updatedStore.setTabId).toHaveBeenCalledTimes(1);
        expect(updatedStore.setTabId).toHaveBeenCalledWith(NEW_TAB_ID);
    });
    
    test("returns store with updated tab ID", () => {
        expect(result).toEqual({ close: true, store: updatedStore2 });
    });
});
