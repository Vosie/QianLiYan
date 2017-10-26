import { createActionMap } from './utils';

const contentStateList = ['FETCHING_CONTENT', 'DONE'];
export const CONTENT_STATES = createActionMap(stateList, 'tts_player.state');

export const FEED_TYPE = {
    RSS: 'rss'
};

export const FEED_LIST = [{
    type: FEED_TYPE.RSS,
    name: '關鍵新聞網',
    url: 'https://feeds.feedburner.com/TheNewsLens'
}, {
    type: FEED_TYPE.RSS,
    name: '明日科學',
    url: 'https://tomorrowsci.com/feed/'
}];
