import _ from 'lodash';
import i18n from '../shared/i18n';
import { fetchJSON } from '../shared/fetcher';
import BaseDownloader from './base_downloader';

class ContentRunner {

    fetch(item) {
        // This part should be changed to embed unfluff code.
        const url = `https://qianliyan.herokuapp.com/extract?url=${item.link}&lang=${item.lang}`;
        return fetchJSON(url);
    }

    process(json, task) {
        task.resolve({ text: json.text, lang: json.lang || task.url.lang });
    }
}

const singleton = new BaseDownloader(new ContentRunner());

export default singleton;
