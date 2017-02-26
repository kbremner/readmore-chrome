interface IActions {
    next(accessToken: string): Promise<IArticle>
    performAction(actionUrl: string): Promise<{}>
}

export interface IArticle {
    url: string
    actions: { delete: string, archive: string }
}

export default IActions;