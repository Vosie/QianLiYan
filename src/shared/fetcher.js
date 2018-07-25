import { parseString } from 'react-native-xml2js';
// fetch url as text
export const fetchText = (url) => (fetch(url).then((response) => (response.text())));

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
