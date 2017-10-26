import { createAction } from 'redux-actions';
import _ from 'lodash';
import i18n from '../shared/i18n';
import {
    ACTION_TYPES,
    DEFAULT_FEED_LIST,
    DOWNLOAD_STATES
} from '../constants/content_list';
import RSSDownloader from '../services/rss_downloader';
import ContentDownloader from '../services/content_downloader';

const setState = createAction(ACTION_TYPES.SET_DOWNLOADER_STATE);
const addContentList = createAction(ACTION_TYPES.ADD_CONTENT_LIST);
const setContentText = createAction(ACTION_TYPES.SET_CONTENT_TEXT);

const fetchContent = (feed, list) => (dispatch, getState) => {
    return Promise.all(_.map(list, (item) => {
        ContentDownloader.download({ link: item.link, lang: feed.lang }).then((data) => {
            dispatch(setContentText({
                key: item.key,
                text: data.text,
                lang: data.lang
            }));
            return data;
        }).catch((ex) => {
            console.error('download content error, from', item.link, feed.name, feed.url);
            // eat the error to prevent app halt
        });
    }));
};

export const fetchList = (feeds = DEFAULT_FEED_LIST) => (dispatch, getState) => {
    // push feeds to RSS downloader. The thread count is controlled by RSS Downloader.
    return Promise.all(_.map(feeds, (feed) => {
        RSSDownloader.download(feed.url).then((list) => {
            dispatch(addContentList({
                feed,
                list
            }));
            dispatch(fetchContent(feed, list));
            return list;
        }).catch((ex) => {
            console.error('download list error', feed.name, feed.url, feed.type);
            // eat the error to prevent app halt
        });
    }));
};
