import IActions from "../actions/IActions";
import { IStoreData } from "../storage/IStorageManager";
import { default as IEventHandler, IEvent, IResponse } from "./IEventHandler";

class PerformActionEventHandler implements IEventHandler {
    private actionName: string;
    private eventHandler: IEventHandler;
    private actions: IActions;

    constructor(actionName: string, actions: IActions, eventHandler: IEventHandler) {
        this.actionName = actionName;
        this.actions = actions;
        this.eventHandler = eventHandler;
    }

    public async handle(event: IEvent, data: IStoreData): Promise<IResponse> {
        await this.actions.performAction(data.getActions()[this.actionName]);
        data = data.setActions(null);
        return await this.eventHandler.handle({ type: "FETCHNEXT", windowId: event.windowId } as IEvent, data);
    }
}

export default PerformActionEventHandler;
