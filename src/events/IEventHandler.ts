interface IEventHandler {
    handle(event: IEvent, token: string, tabId: number): Promise<IResponse>
}

export interface IEvent {
    type: string
    windowId: number
    token?: string
}

export interface IResponse {
    close?: boolean
}

export default IEventHandler;