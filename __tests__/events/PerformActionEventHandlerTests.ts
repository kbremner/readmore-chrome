jest.mock('../../src/storage/StoreDataMap');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import PerformActionEventHandler from '../../src/events/PerformActionEventHandler';
import { default as IStorageManager, IStoreData } from '../../src/storage/IStorageManager';
import StoreDataMap from '../../src/storage/StoreDataMap';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import IActions from '../../src/actions/IActions';
import Actions from '../../src/actions';
import { default as IEventHandler, IEvent, IResponse } from '../../src/events/IEventHandler';
import EventHandler from '../../src/events';

let storeData: IStoreData;
let updatedStore: IStoreData;
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
    storeData = new StoreDataMap(null, null, null);
    updatedStore = new StoreDataMap(null, null, null);

    // update storage.get to return sensible defaults for these tests
    storeData.getActions = jest.fn(() => { return { "archive": ARCHIVE_URL }; });
    storeData.setActions = jest.fn(() => updatedStore);
    rootHandler.handle = jest.fn(() => Promise.resolve(EXPECTED_RESPONSE));

    eventHandler = new PerformActionEventHandler("archive", actions, rootHandler);
    result = await eventHandler.handle({ type: "HANDLE_ARCHIVE", windowId: WINDOW_ID } as IEvent, storeData);
});

test("performs archive with url from storage", () => {
    expect(actions.performAction).toHaveBeenCalledTimes(1);
    expect(actions.performAction).toHaveBeenCalledWith(ARCHIVE_URL);
});

describe("after performing action", () => {
    test("fetches next article with updated store", async () => {
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect((rootHandler.handle as any).mock.calls[0]).toEqual([{ type: "FETCH_NEXT", windowId: WINDOW_ID }, updatedStore]);
    });

    test("removes actions", () => {
        expect(storeData.setActions).toHaveBeenCalledTimes(1);
        expect(storeData.setActions).toHaveBeenCalledWith(null);
    });

    test("returns result of FETCH_NEXT event", async () => {
        expect(result).toEqual(EXPECTED_RESPONSE);
    });
});