jest.mock('../../src/events');

import InstalledEventHandler from '../../src/events/InstalledEventHandler';
import { default as IEventHandler, IEvent } from '../../src/events/IEventHandler';
import EventHandler from '../../src/events';

let rootHandler: IEventHandler;
let eventHandler: InstalledEventHandler;

const WINDOW_ID = 12;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";

beforeEach(async () => {
  rootHandler = new EventHandler(null, null, null);

  eventHandler = new InstalledEventHandler(rootHandler);
});

describe("If first install", () => {
    test("starts auth process", async () => {
        const expectedResponse = { val: true };
        rootHandler.handle = jest.fn(() => Promise.resolve(expectedResponse));

        const result = await eventHandler.handle({ type: "INSTALLED", command: "install", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);

        expect(result).toEqual(expectedResponse);
        expect(rootHandler.handle).toHaveBeenCalledTimes(1);
        expect(rootHandler.handle).toHaveBeenCalledWith({ type: "PERFORM_AUTH", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID });
    });
});

describe("If not first install", () => {
    test("does nothing", async () => {
        const result = await eventHandler.handle({ type: "INSTALLED", command: "other", token: ACCESS_TOKEN, windowId: WINDOW_ID, tabId: TAB_ID } as IEvent);

        expect(result).toEqual({});
        expect(rootHandler.handle).not.toHaveBeenCalled();
    });
});