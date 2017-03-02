import TokenReceivedEventHandler from './TokenReceivedEventHandler';
import FetchNextEventHandler from './FetchNextEventHandler';
import PopupOpenedEventHandler from './PopupOpenedEventHandler';
import PerformActionEventHandler from './PerformActionEventHandler';
import CommandReceivedEventHandler from './CommandReceivedEventHandler';
import InstalledEventHandler from './InstalledEventHandler';
import PerformAuthEventHandler from './PerformAuthEventHandler';
import IStorageManager from '../storage/IStorageManager';
import ITabManager from '../tabs/ITabManager';
import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from '../events/IEventHandler';

class RootEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _tabs: ITabManager
    private _handlers: { [key: string] : IEventHandler }

    constructor(storage: IStorageManager, tabs: ITabManager, actions: IActions) {
        this._storage = storage;
        this._tabs = tabs;
        this._handlers = {
            "COMMAND_RECEIVED": new CommandReceivedEventHandler(storage, tabs, this),
            "FETCH_NEXT": new FetchNextEventHandler(storage, tabs, actions),
            "HANDLE_ARCHIVE": new PerformActionEventHandler("archive", storage, actions, this),
            "HANDLE_DELETE": new PerformActionEventHandler("delete", storage, actions, this),
            "POPUP_OPENED": new PopupOpenedEventHandler(storage, tabs, this),
            "TOKEN_RECEIVED": new TokenReceivedEventHandler(storage, tabs, this),
            "INSTALLED": new InstalledEventHandler(this),
            "PERFORM_AUTH": new PerformAuthEventHandler(tabs)
        };
    }

    public async handle(event: IEvent): Promise<IResponse> {
        const handler = this._handlers[event.type];
        if(handler === undefined) {
            throw new Error(`Event type ${event.type} not supported`);
        }
       
        // enrich the event, as required
        if(event.token === undefined) {
            const items = await this._storage.get("access_token");
            event.token = items["access_token"];
        }
        if(event.tabId === undefined) {
            const items = await this._storage.get("tab_id");
            event.tabId = items["tab_id"];
        }
        if(event.windowId === undefined) {
            const window = await this._tabs.getCurrentWindow();
            event.windowId = window.id;
        }

        return await handler.handle(event);
    }
}

export default RootEventHandler;