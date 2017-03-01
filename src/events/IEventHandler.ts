interface IEventHandler {
    handle(event: IEvent): Promise<IResponse>
}

export interface IEvent {
    type: string
    windowId: number
    token: string
    tabId?: number
    command?: string
}

export interface IResponse {
    close?: boolean
}

export default IEventHandler;