import _ from 'lodash';
import i18n from '../shared/i18n';
import { fetchXML } from '../shared/fetcher';

export class RSSDownloader {

    constructor() {
        this._queue = [];
        this.running = false;

        this._fetchNext = ::this._fetchNext;
    }

    _fetchNext() {
        const task = this._queue.shift();

        if (!task) {
            this.running = false;
            return;
        }

        fetchXML(task.url).then((xml) => {
            try {
                task.resolve(this.convertToRSSItems(task.url, xml));
            } finally {
                // We have to continue fetch no matter it is failed or not.
                this.setTimeout(this._fetchNext);
            }
        }).catch((ex) => {
            task.reject(ex);
            // We have to continue fetch no matter it is failed or not.
            this.setTimeout(this._fetchNext);
        });
    }

    convertToRSSItem(sourceURL, item) {
        const separator = i18n.t('rss.item_text_separator');
        const link = _.get(item, 'link[0]') || _.get(item, 'feedburner:origLink[0]');
        const description = item.description && item.description.length
                                ? item.description.join(separator) : null;

        return {
            key: `${sourceURL}::${link}`, // the unique key for this rss.
            title: item.title && item.title.length ?item.title.join(separator) : null,
            description,
            sourceURL,
            link,
            categories: item.category,
            pubDate: item.pubDate && item.pubDate.length ? item.pubDate[0] : null,
            text: null
        };
     }

    convertToRSSItems(url, xml) {
        return _.reduce(_.get(xml, 'rss.channel'), (acc, channel) => {
            return _.reduce(channel.item, (acc, item) => {
                acc.push(this.convertToRSSItem(url, item));
                return acc;
            }, acc);
        }, []);
    }

    trigger() {
        if (this.running) {
            return;
        }

        this.running = true;
        this._fetchNext();
    }

    download(url) {
        return new Promise((resolve, reject) => {
            this._queue.push({
                url,
                resolve,
                reject
            });
            this.trigger();
        });
    }
}

const singleton = new RSSDownloader();

export default singleton;
