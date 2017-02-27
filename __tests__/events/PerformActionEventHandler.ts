jest.mock('../../src/storage');
jest.mock('../../src/events');
jest.mock('../../src/actions');
jest.mock('../../src/tabs', );

import PerformActionEventHandler from '../../src/events/PerformActionEventHandler';
import IStorageManager from '../../src/storage/IStorageManager';
import { default as IEventHandler, IEvent } from '../../src/events/IEventHandler';
import IActions from '../../src/actions/IActions';

let storage: IStorageManager;
let actions: IActions;
let rootHandler: IEventHandler;
let eventHandler: PerformActionEventHandler;
beforeEach(() => {
  storage = {
    get: jest.fn(() => Promise.resolve({ "actions": { "archive": "someurl" } })),
    set: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve())
  } as IStorageManager;
  actions = {
    next: jest.fn(() => Promise.resolve()),
    performAction: jest.fn(() => Promise.resolve())
  } as IActions;
  rootHandler = {
    handle: jest.fn(() => Promise.resolve())
  } as IEventHandler;
  
  eventHandler = new PerformActionEventHandler("archive", storage, actions, rootHandler);
});

test("retrieves actions before performing action", () => {
  const result = eventHandler.handle({ windowId: 12} as IEvent, "token", 21);

  result.then(() => {
    expect(storage.get).toHaveBeenCalledTimes(1);
    expect(storage.get).toHaveBeenCalledWith("actions");
  });
});

describe("after performing action", () => {
  test("fetches next article", () => {
    const result = eventHandler.handle({ windowId: 12} as IEvent, "token", 21);

    result.then(() => {
      expect(rootHandler.handle).toHaveBeenCalledTimes(1);
      expect(rootHandler.handle).toHaveBeenCalledWith({ type: "FETCH_NEXT", windowId: 12 }, "token", 21);
    });
  });

  test("removes actions", () => {
    const result = eventHandler.handle({ windowId: 12} as IEvent, "token", 21);

    result.then(() => {
      expect(storage.remove).toHaveBeenCalledTimes(1);
      expect(storage.remove).toHaveBeenCalledWith("actions");
    });
  });
});