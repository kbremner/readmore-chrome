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
        try {
            await this.actions.performAction(data.getActions()[this.actionName]);
        } catch (err) {
            // We were unable to perform the required action.
            // At this point, the best course of action is
            // to assume that the user has revoked our
            // access rights, requiring us to re-authenticate.
            console.error(`Failed to perform action ${this.actionName}`, err);
            return await this.eventHandler.handle({
                type: "PERFORM_AUTH",
                windowId: event.windowId,
            } as IEvent, data);
        }

        data = data.setActions(null);
        return await this.eventHandler.handle({ type: "FETCH_NEXT", windowId: event.windowId } as IEvent, data);
    }
}

export default PerformActionEventHandler;
