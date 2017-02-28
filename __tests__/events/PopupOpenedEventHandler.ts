jest.mock('../../src/storage');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import PopupOpenedEventHandler from '../../src/events/PopupOpenedEventHandler';
import IStorageManager from '../../src/storage/IStorageManager';
import StorageManager from '../../src/storage';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import IActions from '../../src/actions/IActions';
import Actions from '../../src/actions';
import { default as IEventHandler, IEvent } from '../../src/events/IEventHandler';
import EventHandler from '../../src/events';

let storage: IStorageManager;
let tabs: ITabManager;
let actions: IActions;
let rootHandler: IEventHandler;
let eventHandler: PopupOpenedEventHandler;

const ARCHIVE_URL = "someurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
  storage = new StorageManager();
  tabs = new TabManager();
  actions = new Actions();
  rootHandler = new EventHandler(storage, tabs, actions);

  // update methods to return sensible defaults for these tests
  tabs.isCurrentTab = jest.fn((tabId, windowId) => Promise.resolve(windowId === WINDOW_ID && tabId === TAB_ID));

  eventHandler = new PopupOpenedEventHandler(storage, tabs, rootHandler);
});

describe("if tab ID is current tab", () => {
    test("returns empty response", async () => {
        const response = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, ACCESS_TOKEN, TAB_ID);
        expect(response).toEqual({});
    });
});

describe("if tab with ID does not exist", () => {
    test("fetches next article without specifying tab ID", async () => {
        tabs.isCurrentTab = jest.fn(() => { throw new Error("test error"); });

        const response = await eventHandler.handle({ type: "POPUP_OPENED", windowId: WINDOW_ID } as IEvent, ACCESS_TOKEN, TAB_ID);

        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID }, ACCESS_TOKEN, undefined);
    });
});

