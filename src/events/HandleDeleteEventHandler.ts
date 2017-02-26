import IStorageManager from '../storage/IStorageManager';
import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class HandleDeleteEventHandler implements IEventHandler {
    private _storage: IStorageManager
    private _eventHandler: IEventHandler
    private _actions: IActions

    constructor(storage: IStorageManager, actions: IActions, eventHandler: IEventHandler) {
        this._storage = storage;
        this._actions = actions;
        this._eventHandler = eventHandler;
    }

    handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        return this._storage.get("actions")
            .then(items => this._actions.performAction(items["actions"].delete))
            .then(() => this._storage.remove("actions"))
            .then(() => this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId }, token, tabId));
    }
}

export default HandleDeleteEventHandler;