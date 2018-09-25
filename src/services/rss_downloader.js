import _ from 'lodash';
import i18n from '../shared/i18n';
import { fetchXML } from '../shared/fetcher';
import BaseDownloader from './base_downloader';

class RSSRunner {

    fetch() {
        return fetchXML.apply(null, arguments);
    }

    process(xml, task) {
        task.resolve(this.convertToRSSItems(task.url, xml));
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
            played: false,
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
}

const singleton = new BaseDownloader(new RSSRunner());

// We should use throttling to prevent overwhelming requesting.
singleton.throttle = () => {
    return Math.random() * 2000 + 1000;
};

export default singleton;
