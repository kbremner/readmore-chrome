import ITabManager from '../tabs/ITabManager';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

/*
 * Handles auth handshake with read more server
 */
class InstalledEventHandler implements IEventHandler {
    private _rootHandler: IEventHandler

    constructor(rootHandler: IEventHandler) {
        this._rootHandler = rootHandler;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        if(event.command === "install") {
            // first time install, so trigger the auth process
            return this._rootHandler.handle({ type: "PERFORM_AUTH", windowId: event.windowId } as IEvent, data);
        }
        // not first time install, return an empty response
        return { store: data };
    }
}

export default InstalledEventHandler;