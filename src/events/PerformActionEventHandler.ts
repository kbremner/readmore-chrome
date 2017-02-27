import IStorageManager from '../storage/IStorageManager';
import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';

class PerformActionEventHandler implements IEventHandler {
    private _actionName: string
    private _storage: IStorageManager
    private _eventHandler: IEventHandler
    private _actions: IActions

    constructor(actionName: string, storage: IStorageManager, actions: IActions, eventHandler: IEventHandler) {
        this._actionName = actionName;
        this._storage = storage;
        this._actions = actions;
        this._eventHandler = eventHandler;
    }

    handle(event: IEvent, token: string, tabId: number): Promise<IResponse> {
        return this._storage.get("actions")
            .then(items => this._actions.performAction(items["actions"][this._actionName]))
            .then(() => this._storage.remove("actions"))
            .then(() => this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId }, token, tabId));
    }
}

export default PerformActionEventHandler;