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

    async handle(event: IEvent): Promise<IResponse> {
        const items = await this._storage.get("actions");
        await this._actions.performAction(items["actions"][this._actionName]);
        await this._storage.remove("actions");
        return await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId, tabId: event.tabId, token: event.token });
    }
}

export default PerformActionEventHandler;