import { createActionMap } from './utils';

const actionList = [
    'ADD_CONTENT_LIST',
    'SET_CONTENT_PLAYED',
    'SET_CONTENT_TEXT',
    'SET_DOWNLOADER_STATE'
];
const downloadStateList = ['FETCHING_LIST', 'FETCHING_CONTENT', 'DONE'];

export const ACTION_TYPES = createActionMap(actionList, 'content_list.action');
export const DOWNLOAD_STATES = createActionMap(downloadStateList, 'content_list.state');

export const FEED_TYPE = {
    RSS: 'rss'
};

export const DEFAULT_FEED_LIST = [{
    type: FEED_TYPE.RSS,
    name: '明日科學',
    lang: 'zh',
    url: 'https://tomorrowsci.com/feed/'
}, {
    type: FEED_TYPE.RSS,
    name: '關鍵新聞網',
    lang: 'zh',
    url: 'https://feeds.feedburner.com/TheNewsLens'
}];

// We cannot use tomorrowsci now, because it prevents us to download the html if we do not enable
// cookies. We may need to enable it after we enable another downloader.

export const MINIMUM_BUFFER_SIZE = 2;
