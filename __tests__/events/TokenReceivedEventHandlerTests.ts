jest.mock("../../src/events");
jest.mock("../../src/tabs");

import EventHandler from "../../src/events";
import { default as IEventHandler, IEvent, IResponse } from "../../src/events/IEventHandler";
import TokenReceivedEventHandler from "../../src/events/TokenReceivedEventHandler";
import { IStoreData } from "../../src/storage/IStorageManager";
import StoreDataMap from "../../src/storage/StoreDataMap";
import TabManager from "../../src/tabs";
import ITabManager from "../../src/tabs/ITabManager";

let storeData: IStoreData;
let otherStoreData: IStoreData;
let tabs: ITabManager;
let rootHandler: IEventHandler;
let eventHandler: TokenReceivedEventHandler;
let response: IResponse;

const WINDOW_ID = 12;
const TAB_ID = 21;
const OTHER_TAB_ID = 123;
const ACCESS_TOKEN = "token";
const NEW_ACCESS_TOKEN = "new-token";

beforeEach(async () => {
    storeData = new StoreDataMap(ACCESS_TOKEN, null, null);
    otherStoreData = new StoreDataMap(null, null, null);
    tabs = new TabManager();
    rootHandler = new EventHandler(null, null);

    rootHandler.handle = jest.fn(() => Promise.resolve({ test: true, store: otherStoreData }));
    tabs.getCurrentTab = jest.fn(() => Promise.resolve({ id: TAB_ID }));

    eventHandler = new TokenReceivedEventHandler(tabs, rootHandler);
    response = await eventHandler.handle(
        { type: "TOKEN_RECEIVED", token: NEW_ACCESS_TOKEN, windowId: WINDOW_ID },
        storeData);
});

test("returns result telling the popup to keep the spinner up", () => {
    expect(response.keepSpinner).toBe(true);
});

test("returns result with store returned by handling of FETCH_NEXT event", () => {
    expect(response.store).toEqual(otherStoreData);
});

test("gets the current tab", () => {
    expect(tabs.getCurrentTab).toHaveBeenCalledTimes(1);
    expect(tabs.getCurrentTab).toHaveBeenCalledWith(WINDOW_ID);
});

describe("fetches the next article", () => {
    test("once", () => {
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect((rootHandler.handle as any).mock.calls[0][0]).toEqual({ type: "FETCH_NEXT", windowId: WINDOW_ID });
    });

    test("with store containing ID of current tab", () => {
        const storeForEvent = (rootHandler.handle as any).mock.calls[0][1] as IStoreData;
        expect(storeForEvent.getTabId()).toEqual(TAB_ID);
    });

    test("with store containing new token", () => {
        const storeForEvent = (rootHandler.handle as any).mock.calls[0][1] as IStoreData;
        expect(storeForEvent.getToken()).toEqual(NEW_ACCESS_TOKEN);
    });
});
