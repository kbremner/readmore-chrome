import IActions from '../actions/IActions';
import { default as IEventHandler, IEvent, IResponse } from './IEventHandler';
import { IStoreData } from '../storage/IStorageManager';

class PerformActionEventHandler implements IEventHandler {
    private _actionName: string
    private _eventHandler: IEventHandler
    private _actions: IActions

    constructor(actionName: string, actions: IActions, eventHandler: IEventHandler) {
        this._actionName = actionName;
        this._actions = actions;
        this._eventHandler = eventHandler;
    }

    async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        await this._actions.performAction(data.getActions()[this._actionName]);
        data = data.setActions(null);
        return await this._eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId } as IEvent, data);
    }
}

export default PerformActionEventHandler;