import TokenReceivedEventHandler from './TokenReceivedEventHandler';
import FetchNextEventHandler from './FetchNextEventHandler';
import PopupOpenedEventHandler from './PopupOpenedEventHandler';
import PerformActionEventHandler from './PerformActionEventHandler';
import IStorageManager from '../storage/IStorageManager';
import ITabManager from '../tabs/ITabManager';
import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from '../events/IEventHandler';

class RootEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _handlers: { [key: string] : IEventHandler }

    constructor(storage: IStorageManager, tabs: ITabManager, actions: IActions) {
        this._storage = storage;
        this._handlers = {
            "FETCH_NEXT": new FetchNextEventHandler(storage, tabs, actions),
            "HANDLE_ARCHIVE": new PerformActionEventHandler("archive", storage, actions, this),
            "HANDLE_DELETE": new PerformActionEventHandler("delete", storage, actions, this),
            "POPUP_OPENED": new PopupOpenedEventHandler(storage, tabs, this),
            "TOKEN_RECEIVED": new TokenReceivedEventHandler(storage, tabs, this)
        };
    }

    public handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        const handler = this._handlers[event.type];
        if(handler === undefined) {
            throw new Error(`Event type ${event.type} not supported`);
        }
        return handler.handle(event, token, tabId);
    }
}

export default RootEventHandler;