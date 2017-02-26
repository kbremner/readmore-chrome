interface IStorageManager {
    get(...keys: string[]): Promise<{ [key: string]: any }>
    set(props: { [key: string]: any }): Promise<{ [key: string]: any }>
    remove(...keys: string[]): Promise<{}>
}

export default IStorageManager;