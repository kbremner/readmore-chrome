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

const WINDOW_ID = 12;
const TAB_ID = 21;
const OTHER_TAB_ID = 13;
const OTHER_WINDOW_ID = 31;
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

describe("if the tab ID is for the current tab", () => {
    test("returns empty response", async () => {
        const response = await eventHandler.handle({ type: "POPUP_OPENED", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);
        expect(response).toEqual({});
    });
});

describe("if tab with ID does not exist", () => {
    test("fetches next article without specifying tab ID", async () => {
        tabs.isCurrentTab = jest.fn(() => { throw new Error("test error"); });
        tabs.getCurrentTab = jest.fn(() => { return { id: OTHER_TAB_ID, windowId: WINDOW_ID }; });

        const response = await eventHandler.handle({ type: "POPUP_OPENED", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);

        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: OTHER_TAB_ID });
    });
});

describe("if the tab ID is for a tab other than the current tab", () => {
    let response;
    beforeEach(async () => {
        tabs.updateTab = jest.fn((tabId, props) => { return { id: tabId, windowId: OTHER_WINDOW_ID }; });
        response = await eventHandler.handle({ type: "POPUP_OPENED", token: ACCESS_TOKEN, windowId: OTHER_WINDOW_ID, tabId: OTHER_TAB_ID } as IEvent);
    });

    test("makes the tab active", () => {
        expect(tabs.updateTab).toHaveBeenCalledTimes(1);
        expect(tabs.updateTab).toHaveBeenCalledWith(OTHER_TAB_ID, { active: true });
    });

    test("focusses the tab's window", () => {
        expect(tabs.updateWindow).toHaveBeenCalledTimes(1);
        expect(tabs.updateWindow).toHaveBeenCalledWith(OTHER_WINDOW_ID, { active: true });
    });

    test("returns close response", () => {
        expect(response).toEqual({ close: true });
    });
});
