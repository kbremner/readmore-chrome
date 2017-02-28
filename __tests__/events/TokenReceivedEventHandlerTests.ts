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

const ARCHIVE_URL = "someurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const NEW_ACCESS_TOKEN = "new-token";

beforeEach(async () => {
    storage = new StorageManager();
    tabs = new TabManager();
    actions = new Actions();
    rootHandler = new EventHandler(storage, tabs, actions);

    eventHandler = new TokenReceivedEventHandler(storage, tabs, rootHandler);
    response = await eventHandler.handle({ type: "TOKEN_RECEIVED", token: NEW_ACCESS_TOKEN, windowId: WINDOW_ID } as IEvent, ACCESS_TOKEN, TAB_ID);
});

test("Stores the access token", async () => {
    expect(storage.set).toHaveBeenCalledTimes(1);
    expect(storage.set).toHaveBeenCalledWith({ access_token: NEW_ACCESS_TOKEN });
});

test("Returns an empty response so the popup doesn't close", async() => {
    expect(response).toEqual({});
});

test("Fetches the next article", async () => {
    expect(rootHandler.handle).toHaveBeenCalledTimes(1);
    expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID } as IEvent, NEW_ACCESS_TOKEN, undefined);
});