import { parseString } from 'react-native-xml2js';
// fetch url as text
export const fetchText = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', (e) => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(e);
            }
        });
        xhr.open('GET', url);
        xhr.send();
    });
};
// fetch url as text and parsed as XML object
export const fetchXML = (url) => {
    return fetchText(url).then((text) => {
        return new Promise((resolve, reject) => {
            parseString(text, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });
};
// fetch url as text and parsed as JSON object
export const fetchJSON = (url) => {
    return fetchText(url).then((text) => {
        return JSON.parse(text);
    });
};
