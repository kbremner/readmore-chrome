jest.mock("../../src/events");
jest.mock("../../src/tabs");

import EventHandler from "../../src/events";
import { default as IEventHandler, IEvent, IResponse } from "../../src/events/IEventHandler";
import PopupOpenedEventHandler from "../../src/events/PopupOpenedEventHandler";
import { IStoreData } from "../../src/storage/IStorageManager";
import StoreDataMap from "../../src/storage/StoreDataMap";
import TabManager from "../../src/tabs";
import ITabManager from "../../src/tabs/ITabManager";

let storeData: IStoreData;
let tabs: ITabManager;
let rootHandler: IEventHandler;
let eventHandler: PopupOpenedEventHandler;

const WINDOW_ID = 12;
const TAB_ID = 21;
const OTHER_TAB_ID = 13;
const OTHER_WINDOW_ID = 31;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
    tabs = new TabManager();
    rootHandler = new EventHandler(null, null);
    eventHandler = new PopupOpenedEventHandler(tabs, rootHandler);
});

describe("When tab ID is current tab", () => {
    let result: IResponse;
    beforeEach(async () => {
        storeData = new StoreDataMap(ACCESS_TOKEN, TAB_ID, null);
        tabs.isCurrentTab = jest.fn(() => Promise.resolve(true));
        result = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("returns unmodified store", () => {
        expect(result.store).toBe(storeData);
    });
});

describe("When tab ID is not current tab", () => {
    let result: IResponse;
    beforeEach(async () => {
        storeData = new StoreDataMap(ACCESS_TOKEN, OTHER_TAB_ID, null);
        tabs.isCurrentTab = jest.fn(() => Promise.resolve(false));
        tabs.updateTab = jest.fn((id) => Promise.resolve({ id, windowId: OTHER_WINDOW_ID }));
        result = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("makes the tab active", async () => {
        expect(tabs.updateTab).toHaveBeenCalledTimes(1);
        expect(tabs.updateTab).toHaveBeenCalledWith(OTHER_TAB_ID, { active: true });
    });

    test("focuses the window", () => {
        expect(tabs.updateWindow).toHaveBeenCalledTimes(1);
        expect(tabs.updateWindow).toHaveBeenCalledWith(OTHER_WINDOW_ID, { active: true });
    });

    test("returns unmodified store", () => {
        expect(result.store).toBe(storeData);
    });

    test("response tells popup to close", () => {
        expect(result.close).toBe(true);
    });
});

describe("When updating the tab throws an error", () => {
    const expectedStore = new StoreDataMap(ACCESS_TOKEN, null, null);
    let result: IResponse;
    beforeEach(async () => {
        storeData = new StoreDataMap(ACCESS_TOKEN, OTHER_TAB_ID, null);
        tabs.isCurrentTab = jest.fn(() => Promise.resolve(false));
        tabs.updateTab = jest.fn(() => { throw new Error("test error"); });
        rootHandler.handle = jest.fn((event, store) => Promise.resolve({ test: true, store }));
        result = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("fetches next article after removing tab ID from store", () => {
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID }, expectedStore);
    });

    test("returns result from fetching next article", () => {
        expect(result).toEqual({ test: true, store: expectedStore });
    });
});

describe("When no tab ID is specified", () => {
    let result: IResponse;
    beforeEach(async () => {
        storeData = new StoreDataMap(ACCESS_TOKEN, null, null);
        tabs.isCurrentTab = jest.fn(() => Promise.resolve(false));
        tabs.updateTab = jest.fn((id) => Promise.resolve({ id, windowId: OTHER_WINDOW_ID }));
        rootHandler.handle = jest.fn((event, store) => Promise.resolve({ test: true, store }));
        result = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("fetches next article after removing tab ID from store", () => {
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID }, storeData);
    });

    test("returns result from fetching next article", () => {
        expect(result).toEqual({ test: true, store: storeData });
    });
});
