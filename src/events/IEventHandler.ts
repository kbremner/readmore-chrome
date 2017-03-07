import { IStoreData } from "../storage/IStorageManager";

interface IEventHandler {
    handle(event: IEvent, data: IStoreData): Promise<IResponse>;
}

export interface IEvent {
    type: string;
    windowId: number;
    token?: string;
    command?: string;
}

export interface IResponse {
    close?: boolean;
    keepSpinner?: boolean;
    store: IStoreData;
}

export default IEventHandler;
