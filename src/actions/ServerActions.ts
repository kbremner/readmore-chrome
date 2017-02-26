import {default as IActions, IArticle } from './IActions';

class ServerActions implements IActions {
    next(accessToken: string): Promise<IArticle> {
        return get(`$baseUri/api/pocket/next?xAccessToken=${accessToken}`);
    }

    performAction(actionUrl: string): Promise<{}> {
        return get(actionUrl);
    }
}

function get(url: string) {
    return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if(xhr.status === 200) {
                    var result = JSON.parse(xhr.responseText);
                    resolve(result);
                } else if(xhr.status === 204) {
                    resolve({}); // no content
                } else {
                    reject(new Error(xhr.statusText));
                }
            }
        }
    });
}

export default ServerActions;