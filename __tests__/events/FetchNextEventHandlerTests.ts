jest.mock('../../src/storage');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import FetchNextEventHandler from '../../src/events/FetchNextEventHandler';
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
let eventHandler: FetchNextEventHandler;
let response: any;

const ARCHIVE_URL = "someurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const NEXT_ACTION_RESULT = { actions: { archive: "archiveurl", delete: "deleteurl" }, url: "articleurl" };

beforeEach(async () => {
    storage = new StorageManager();
    tabs = new TabManager();
    actions = new Actions();
    rootHandler = new EventHandler(storage, tabs, actions);

    actions.next = jest.fn(() => Promise.resolve(NEXT_ACTION_RESULT));

    eventHandler = new FetchNextEventHandler(storage, tabs, actions);
    response = await eventHandler.handle({ type: "FETCH_NEXT", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);
});

test("Executes the next action", () => {
    expect(actions.next).toHaveBeenCalledTimes(1);
    expect(actions.next).toHaveBeenCalledWith(ACCESS_TOKEN);
});

test("Stores the actions from the action result", () => {
    expect(storage.set).toHaveBeenCalledWith({ actions: NEXT_ACTION_RESULT.actions });
});

test("updates the URL of the tab with the specified ID", () => {
    expect(tabs.updateTab).toHaveBeenCalledTimes(1);
    expect(tabs.updateTab).toHaveBeenCalledWith(TAB_ID, { url: NEXT_ACTION_RESULT.url });
});

test("Stores the tab ID from the event", () => {
    expect(storage.set).toHaveBeenCalledWith({ tab_id: TAB_ID });
});

test("Result tells popup to close", () => {
    expect(response).toEqual({ close: true });
});


