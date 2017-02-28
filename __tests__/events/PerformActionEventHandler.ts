jest.mock('../../src/storage');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs');

import PerformActionEventHandler from '../../src/events/PerformActionEventHandler';
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
let eventHandler: PerformActionEventHandler;

const ARCHIVE_URL = "someurl";
const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
  storage = new StorageManager();
  tabs = new TabManager();
  actions = new Actions();
  rootHandler = new EventHandler(storage, tabs, actions);

  // update storage.get to return sensible defaults for these tests
  storage.get = jest.fn(() => Promise.resolve({ "actions": { "archive": ARCHIVE_URL } }));

  eventHandler = new PerformActionEventHandler("archive", storage, actions, rootHandler);
  await eventHandler.handle({ type: "HANDLE_ARCHIVE", windowId: WINDOW_ID } as IEvent, ACCESS_TOKEN, TAB_ID);
});

test("performs archive with url from storage", () => {
  expect(actions.performAction).toHaveBeenCalledTimes(1);
  expect(actions.performAction).toHaveBeenCalledWith(ARCHIVE_URL);
});

describe("after performing action", () => {
  test("fetches next article", async () => {
    expect(rootHandler.handle).toHaveBeenCalledTimes(1);
    expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: WINDOW_ID }, ACCESS_TOKEN, TAB_ID);
  });

  test("removes actions", () => {
    expect(storage.remove).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledWith("actions");
  });
});