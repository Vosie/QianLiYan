import _ from 'lodash';
import extractText from '../unfluff/unfluff';
import i18n from '../shared/i18n';
import { fetchText } from '../shared/fetcher';
import BaseDownloader from './base_downloader';

class ContentRunner {

    fetch(url) {
        return fetchText(url.link).then((html) => (extractText(html, url.lang)));
    }

    process(json, task) {
        task.resolve({ text: json.text, lang: json.lang || task.url.lang });
    }
}

const singleton = new BaseDownloader(new ContentRunner());

// We should use throttling to prevent overwhelming requesting.
singleton.throttle = () => {
    return Math.random() * 5000 + 1000;
};

export default singleton;
