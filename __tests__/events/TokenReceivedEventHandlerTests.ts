jest.mock('../../src/storage');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import TokenReceivedEventHandler from '../../src/events/TokenReceivedEventHandler';
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
let eventHandler: TokenReceivedEventHandler;
let response: any;

const WINDOW_ID = 12;
const TAB_ID = 21;
const OTHER_TAB_ID = 123;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
    storage = new StorageManager();
    tabs = new TabManager();
    actions = new Actions();
    rootHandler = new EventHandler(storage, tabs, actions);

    tabs.getCurrentTab = jest.fn((windowId) => { return { id: OTHER_TAB_ID, windowId }; });

    eventHandler = new TokenReceivedEventHandler(storage, tabs, rootHandler);
    response = await eventHandler.handle({ type: "TOKEN_RECEIVED", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);
});

test("Stores the access token", async () => {
    expect(storage.set).toHaveBeenCalledTimes(1);
    expect(storage.set).toHaveBeenCalledWith({ access_token: ACCESS_TOKEN });
});

test("Response tells popup not to close but to keep spinner up", async() => {
    expect(response).toEqual({ keepSpinner: true });
});

test("Fetches the next article with the ID of the current tab", async () => {
    expect(rootHandler.handle).toHaveBeenCalledTimes(1);
    expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", token: ACCESS_TOKEN, tabId: OTHER_TAB_ID, windowId: WINDOW_ID } as IEvent);
});