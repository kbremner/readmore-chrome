jest.mock('../../src/events');
jest.mock('../../src/storage/StoreDataMap');

import InstalledEventHandler from '../../src/events/InstalledEventHandler';
import { default as IEventHandler, IEvent } from '../../src/events/IEventHandler';
import EventHandler from '../../src/events';
import StoreDataMap from '../../src/storage/StoreDataMap';
import { IStoreData } from '../../src/storage/IStorageManager';

let rootHandler: IEventHandler;
let eventHandler: InstalledEventHandler;
let storeData: IStoreData;

const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
  rootHandler = new EventHandler(null, null);
  storeData = new StoreDataMap(null, null, null);

  eventHandler = new InstalledEventHandler(rootHandler);
});

describe("If first install", () => {
    const EXPECTED_RESPONSE = { test: true };
    let result: any;
    beforeEach(async () => {
        rootHandler.handle = jest.fn(() => Promise.resolve(EXPECTED_RESPONSE));
        result = await eventHandler.handle({ type: "INSTALLED", command: "install", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("starts auth process", async () => {
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "PERFORM_AUTH", windowId: WINDOW_ID }, storeData);
    });

    test("returns result of auth process", () => {
        expect(result).toEqual(EXPECTED_RESPONSE);
    });
});

describe("If not first install", () => {
    let result: any;
    beforeEach(async () => {
        result = await eventHandler.handle({ type: "INSTALLED", command: "other", windowId: WINDOW_ID } as IEvent, storeData);
    });

    test("doesn't trigger any events", async () => {
        expect(rootHandler.handle).not.toHaveBeenCalled();
    });

    test("returns response with only the original data", async () => {
        expect(result).toEqual({ store: storeData });
    });
});