import ITabManager from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

/*
 * Handles auth handshake with read more server
 */
class InstalledEventHandler implements IEventHandler {
    private _rootHandler: IEventHandler

    constructor(rootHandler: IEventHandler) {
        this._rootHandler = rootHandler;
    }

    async handle(event: IEvent): Promise<IResponse> {
        if(event.command === "install") {
            // first time install, so trigger the auth process
            return this._rootHandler.handle({ type: "PERFORM_AUTH", token: event.token, windowId: event.windowId, tabId: event.tabId } as IEvent);
        }
        // not first time install, return an empty response
        return {};
    }
}

export default InstalledEventHandler;