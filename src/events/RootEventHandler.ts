import TokenReceivedEventHandler from './TokenReceivedEventHandler';
import FetchNextEventHandler from './FetchNextEventHandler';
import PopupOpenedEventHandler from './PopupOpenedEventHandler';
import PerformActionEventHandler from './PerformActionEventHandler';
import InstalledEventHandler from './InstalledEventHandler';
import PerformAuthEventHandler from './PerformAuthEventHandler';
import { IStoreData } from '../storage/IStorageManager';
import ITabManager from '../tabs/ITabManager';
import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from '../events/IEventHandler';

class RootEventHandler implements IEventHandler {
    private _tabs: ITabManager
    private _handlers: { [key: string] : IEventHandler }

    constructor(tabs: ITabManager, actions: IActions) {
        this._tabs = tabs;
        this._handlers = {
            "FETCH_NEXT": new FetchNextEventHandler(tabs, actions),
            "HANDLE_ARCHIVE": new PerformActionEventHandler("archive", actions, this),
            "HANDLE_DELETE": new PerformActionEventHandler("delete", actions, this),
            "POPUP_OPENED": new PopupOpenedEventHandler(tabs, this),
            "TOKEN_RECEIVED": new TokenReceivedEventHandler(tabs, this),
            "INSTALLED": new InstalledEventHandler(this),
            "PERFORM_AUTH": new PerformAuthEventHandler(tabs)
        };
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        const handler = this._handlers[event.type];
        if(handler === undefined) {
            throw new Error(`Event type ${event.type} not supported`);
        }

        // enrich the event, as required
        if(event.windowId === undefined) {
            const window = await this._tabs.getCurrentWindow();
            event.windowId = window.id;
        }

        return await handler.handle(event, data);
    }
}

export default RootEventHandler;