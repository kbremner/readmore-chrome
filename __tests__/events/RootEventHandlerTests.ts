jest.mock('../../src/tabs');
jest.mock('../../src/actions');
jest.mock('../../src/events/TokenReceivedEventHandler');
jest.mock('../../src/events/FetchNextEventHandler');
jest.mock('../../src/events/PopupOpenedEventHandler');
jest.mock('../../src/events/PerformActionEventHandler');
jest.mock('../../src/events/InstalledEventHandler');
jest.mock('../../src/events/PerformAuthEventHandler');

import RootEventHandler from '../../src/events/RootEventHandler';
import { IStoreData } from '../../src/storage/IStorageManager';
import StoreDataMap from '../../src/storage/StoreDataMap';
import ITabManager from '../../src/tabs/ITabManager';
import TabManager from '../../src/tabs';
import IActions from '../../src/actions/IActions';
import Actions from '../../src/actions';
import { default as IEventHandler, IEvent, IResponse } from '../../src/events/IEventHandler';

let storeData: IStoreData;
let tabs: ITabManager;
let actions: IActions;
let eventHandler: RootEventHandler;

const WINDOW_ID = 12;
const OTHER_WINDOW_ID = 13;
const TAB_ID = 21;
const ACCESS_TOKEN = "token";
const ARCHIVE_URL = "archive-url";
const DELETE_URL = "delete-url";
const EXPECTED_STORE = new StoreDataMap(ACCESS_TOKEN, TAB_ID, { archive: ARCHIVE_URL, delete: DELETE_URL });

beforeEach(async () => {
    storeData = new StoreDataMap(ACCESS_TOKEN, TAB_ID, null);
    tabs = new TabManager();
    actions = new Actions();
    eventHandler = new RootEventHandler(tabs, actions);
});

describe("For FETCH_NEXT event", testsForCommand("FETCH_NEXT"));
describe("For HANDLE_ARCHIVE event", testsForCommand("HANDLE_ARCHIVE"));
describe("For HANDLE_DELETE event", testsForCommand("HANDLE_DELETE"));
describe("For POPUP_OPENED event", testsForCommand("POPUP_OPENED"));
describe("For TOKEN_RECEIVED event", testsForCommand("TOKEN_RECEIVED"));
describe("For INSTALLED event", testsForCommand("INSTALLED"));
describe("For PERFORM_AUTH event", testsForCommand("PERFORM_AUTH"));

test("throws an error if event type not supported", async () => {
    try {
        await eventHandler.handle({ type: "INVALID" } as any, storeData);
        fail("Expected error");
    } catch(err) {
    }
});

function testsForCommand(commandName: string) {
    return () => {
        let result: IResponse;
        let handler: IEventHandler;
        beforeEach(() => {
            handler = (eventHandler as any).handlers[commandName];
            handler.handle = jest.fn(() => Promise.resolve({ test: true, store: EXPECTED_STORE }));
        });

        test("Adds window ID if not already present", async () => {
            tabs.getCurrentWindow = jest.fn(() => Promise.resolve({ id: OTHER_WINDOW_ID }));
            await eventHandler.handle({ type: commandName } as any, storeData);
            expect(handler.handle).toHaveBeenCalledWith({ type: commandName, windowId: OTHER_WINDOW_ID }, storeData);
        });

        describe("when called with a window ID", () => {
            beforeEach(async () => {
                result = await eventHandler.handle({ type: commandName, windowId: WINDOW_ID }, storeData);
            });

            test("calls correct event handler", () => {
                expect(handler.handle).toHaveBeenCalledTimes(1);
                expect(handler.handle).toHaveBeenCalledWith({ type: commandName, windowId: WINDOW_ID }, storeData);
            });

            test("returns result from event handler", () => {
                expect(result).toEqual({ test: true, store: EXPECTED_STORE });
            });
        });
    };
}

