import { createAction } from 'redux-actions';
import _ from 'lodash';
import i18n from '../shared/i18n';
import PlayerError from '../shared/player_error';
import {
    ACTION_TYPES,
    ERROR_CODES,
    PLAYER_STATES
} from '../constants/tts_player';
import TTSApi from '../services/tts_api';
import NotificationHelper from '../services/notification_helper';
import { setContentPlayed } from './content_list';

const setState = createAction(ACTION_TYPES.SET_STATE);
const setPlayingItem = createAction(ACTION_TYPES.SET_PLAYINGITEM);
const setPlayingSentenceIndex = createAction(ACTION_TYPES.SET_PLAYING_SENTENCE_INDEX);

// TODO update playingSentenceIndex with TTSApi listener
// TODO update playing state: pause, stop, resume, etc with TTSApi listener

export const play = (item) => (dispatch, getState) => {
    const playerState = getState().ttsPlayer.state;
    // If the state is playing, we should stop it gracefully and then play.
    if (playerState === PLAYER_STATES.PLAYING) {
        return dispatch(stop()).then(() => {
            return dispatch(playItem(item));
        });
    } else {
        return dispatch(playItem(item));
    }
};

const playItem = (item) => (dispatch, getState) => {
    if (!item) {
        console.warn('no one can be played');
        return TTSApi.play(i18n.t('tts_player.tts.no_playable')).then(() => {
            throw new PlayerError(ERROR_CODES.UNKNOWN_CONTENT);
        });
    }
    const contentList = getState().contentList.list;
    const itemIndex = _.findIndex(contentList, ['key', item.key]);
    // check if it is in the list
    if (itemIndex < 0) {
        console.warn('the item had been removed from list', item);
        return Promise.reject(new PlayerError(ERROR_CODES.UNKNOWN_CONTENT));
    }
    const separator = i18n.t('tts_player.sentence_separator');
    // split by separator
    // We need to think if we should put the separator back because it may
    // affect the reading speed.
    const sentences = item.text.split(separator);
    // update states
    dispatch(setState(PLAYER_STATES.PLAYING));
    dispatch(setPlayingItem({ item: item, sentences, itemIndex }));
    // update notification
    NotificationHelper.setPlaying(item, itemIndex, contentList.length);
    // start to play
    const titleText = i18n.t('tts_player.tts.play_title', { title: item.title });
    const contentLabel = i18n.t('tts_player.tts.play_content', {content: ''});
    TTSApi.play(titleText, { key: item.key, sentenceIndex: 'title' });
    TTSApi.play(contentLabel, { key: item.key, sentenceIndex: 'content' });
    dispatch(playSentences(sentences, item.key, 0));
};

const playSentences = (sentences, key, startIndex) => (dispatch, getState) => {
    let lastPromise;
    for (let i = startIndex; i < sentences.length; i++) {
        const ttsID = { key, sentenceIndex: i };
        lastPromise = TTSApi.play(sentences[i], ttsID);
    }

    // We only handle the lastPromise that means we may lost when tts_player doesn't notified us at
    // any exception or unexpected situation.
    lastPromise.then(() => {
        const contentList = getState().contentList.list;
        const itemIndex = _.findIndex(contentList, ['key', key]);
        if (contentList[itemIndex + 1]) {
            return dispatch(playItem(contentList[itemIndex + 1]));
        } else {
            return TTSApi.play(i18n.t('tts_player.tts.end_of_list'));
        }
    }).catch((ex) => {
        if (ex === 'cancelled') {
            return 'cancelled';
        } else {
            throw ex;
        }
    });
    // We just give
    return lastPromise;
};

export const resume = () => (dispatch, getState) => {
    const {
        playingItem,
        playingSentenceIndex,
        playingSentenceList
    } = getState().ttsPlayer;

    dispatch(setState(PLAYER_STATES.PLAYING));
    const hintText = i18n.t('tts_player.tts.resume_playing', { title: playingItem.title });
    TTSApi.play(hintText);

    return dispatch(playSentences(playingSentenceList, playingItem.key, playingSentenceIndex));
};

export const pause = () => (dispatch, getState) => {
    // We only set the state to pausing or paused but not reset others.
    dispatch(setState(PLAYER_STATES.PAUSING));
    return TTSApi.stop().then((res) => {
        dispatch(setState(PLAYER_STATES.PAUSED));
    }).catch((ex) => {
        dispatch(setState(PLAYER_STATES.PAUSED));
    });
};

export const stop = () => (dispatch, getState) => {
    // reset the playing item and index when it is stopped.
    dispatch(setState(PLAYER_STATES.STOPPING));
    TTSApi.clearQueue();
    return TTSApi.stop().then((res) => {
        dispatch(setState(PLAYER_STATES.STOPPED));
        dispatch(setPlayingItem(null));
        return res;
    }).catch((ex) => {
        dispatch(setState(PLAYER_STATES.STOPPED));
        dispatch(setPlayingItem(null));
        throw ex;
    });
};

export const playNextItem = () => (dispatch, getState) => {
    const contentList = getState().contentList.list;
    const playingItem = getState().ttsPlayer.playingItem;
    const itemIndex = playingItem ? _.findIndex(contentList, ['key', playingItem.key]) : -1;
    if (itemIndex < 0 && contentList[0]) {
        return dispatch(play(contentList[0]));
    } else if (itemIndex < 0 && !contentList[0]) {
        return TTSApi.play(i18n.t('tts_player.tts.no_playable'));
    } else if (itemIndex === contentList.length - 1) {
        // the current index is the last one. We don't have others.
        return dispatch(play(contentList[0]));;
    } else {
        // the current index can move next.
        return dispatch(play(contentList[itemIndex + 1])).catch((ex) => {
            // consume errors
            console.log('play next item error', ex);
        });
    }
};

export const playPreviousItem = () => (dispatch, getState) => {
    const contentList = getState().contentList.list;
    const playingItem = getState().ttsPlayer.playingItem;
    const itemIndex = playingItem ? _.findIndex(contentList, ['key', playingItem.key]) : -1;
    if (itemIndex < 0 && contentList[0]) {
        return dispatch(play(contentList[0]));
    } else if (itemIndex < 0 && !contentList[0]) {
        return TTSApi.play(i18n.t('tts_player.tts.no_playable'));
    } else if (itemIndex === 0) {
        // the current index is the first one. We cannot move to previous one.
        return dispatch(play(contentList[contentList.length]));
    } else {
        // the current index can move next.
        return dispatch(play(contentList[itemIndex - 1])).catch((ex) => {
            // consume errors
            console.log('play next item error', ex);
        });
    }
};
