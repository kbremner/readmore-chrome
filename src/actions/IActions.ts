interface IActions {
    next(accessToken: string): Promise<IArticle>
    performAction(actionUrl: string): Promise<{}>
}

export interface IArticle {
    url: string
    actions: IArticleActions
}

export interface IArticleActions {
    archive: string,
    delete: string
}

export default IActions;