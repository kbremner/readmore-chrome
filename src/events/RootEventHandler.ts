import IActions from "../actions/IActions";
import { default as IEventHandler, IEvent, IResponse } from "../events/IEventHandler";
import { IStoreData } from "../storage/IStorageManager";
import ITabManager from "../tabs/ITabManager";
import FetchNextEventHandler from "./FetchNextEventHandler";
import InstalledEventHandler from "./InstalledEventHandler";
import PerformActionEventHandler from "./PerformActionEventHandler";
import PerformAuthEventHandler from "./PerformAuthEventHandler";
import PopupOpenedEventHandler from "./PopupOpenedEventHandler";
import TokenReceivedEventHandler from "./TokenReceivedEventHandler";

class RootEventHandler implements IEventHandler {
    private tabs: ITabManager;
    private handlers: { [key: string]: IEventHandler };

    constructor(tabs: ITabManager, actions: IActions) {
        this.tabs = tabs;
        this.handlers = {
            FETCH_NEXT: new FetchNextEventHandler(tabs, actions),
            HANDLE_ARCHIVE: new PerformActionEventHandler("archive", actions, this),
            HANDLE_DELETE: new PerformActionEventHandler("delete", actions, this),
            INSTALLED: new InstalledEventHandler(this),
            PERFORM_AUTH: new PerformAuthEventHandler(tabs),
            POPUP_OPENED: new PopupOpenedEventHandler(tabs, this),
            TOKEN_RECEIVED: new TokenReceivedEventHandler(tabs, this),
        };
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        const handler = this.handlers[event.type];
        if (handler === undefined) {
            throw new Error(`Event type ${event.type} not supported`);
        }

        // enrich the event, as required
        if (event.windowId === undefined) {
            const window = await this.tabs.getCurrentWindow();
            event.windowId = window.id;
        }

        return await handler.handle(event, data);
    }
}

export default RootEventHandler;
