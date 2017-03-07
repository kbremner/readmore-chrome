jest.mock("../../src/events");
jest.mock("../../src/actions");
jest.mock("../../src/tabs");

import Actions from "../../src/actions";
import { default as IActions, IArticleActions } from "../../src/actions/IActions";
import EventHandler from "../../src/events";
import { default as IEventHandler, IEvent, IResponse } from "../../src/events/IEventHandler";
import PerformActionEventHandler from "../../src/events/PerformActionEventHandler";
import { default as IStorageManager, IStoreData } from "../../src/storage/IStorageManager";
import StoreDataMap from "../../src/storage/StoreDataMap";
import TabManager from "../../src/tabs";
import ITabManager from "../../src/tabs/ITabManager";

let storeData: IStoreData;
let tabs: ITabManager;
let actions: IActions;
let rootHandler: IEventHandler;
let eventHandler: PerformActionEventHandler;
let result: IResponse;

const ARCHIVE_URL = "someurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const EXPECTED_RESPONSE = { test: true };

beforeEach(async () => {
    tabs = new TabManager();
    actions = new Actions();
    rootHandler = new EventHandler(tabs, actions);
    storeData = new StoreDataMap(ACCESS_TOKEN, TAB_ID, { archive: ARCHIVE_URL } as IArticleActions);

    // update storage.get to return sensible defaults for these tests
    rootHandler.handle = jest.fn(() => Promise.resolve(EXPECTED_RESPONSE));

    eventHandler = new PerformActionEventHandler("archive", actions, rootHandler);
    result = await eventHandler.handle({ type: "HANDLE_ARCHIVE", windowId: WINDOW_ID } as IEvent, storeData);
});

test("performs archive with url from storage", () => {
    expect(actions.performAction).toHaveBeenCalledTimes(1);
    expect(actions.performAction).toHaveBeenCalledWith(ARCHIVE_URL);
});

test("fetches next article with store that has no actions", () => {
    const expectedStore = storeData.setActions(null);
    expect(rootHandler.handle).toHaveBeenCalledTimes(1);
    expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID }, expectedStore);
});

test("returns result of FETCH_NEXT event", () => {
    expect(result).toEqual(EXPECTED_RESPONSE);
});
