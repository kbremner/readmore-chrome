interface ITabManager {
    isCurrentTab(tabId: number, windowId: number): Promise<boolean>;
    updateTab(tabId: number, props: IUpdateTabProps): Promise<ITab>;
    updateWindow(windowId: number, props: IUpdateProps): Promise<IWindow>;
    createTab(url: string): Promise<ITab>;
    getCurrentTab(windowId: number): Promise<ITab>;
    getCurrentWindow(): Promise<IWindow>;
}

export interface IUpdateProps {
    active: boolean;
}

export interface IUpdateTabProps extends IUpdateProps {
    url: string;
}

export interface ITab {
    id?: number;
    windowId?: number;
}

export interface IWindow {
    id: number;
}

export default ITabManager;
