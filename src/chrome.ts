export function handleLastError<T>(
    resolve: (value?: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    result: T) {
    const err = chrome.runtime.lastError;
    if (err) {
        reject(err); // Couldn't create a tab for some reason
    } else {
        resolve(result); // tab created!
    }
}
