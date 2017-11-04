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
const setUtteranceId = createAction(ACTION_TYPES.SET_UTTERANCEID);
const setPlayingIndex = createAction(ACTION_TYPES.SET_PLAYINGINDEX);

const playIndex = (index) => (dispatch, getState) => {
    const { playingList, playingItem } = getState().ttsPlayer;
    if (index < 0 || index >= playingList.length) {
        return Promise.reject(new PlayerError(ERROR_CODES.WRONG_INDEX));
    }
    // update the notification
    NotificationHelper.updatePlayback(playingItem, playingList, index);
    dispatch(setPlayingIndex(index));
    // We need to think if we should put the separator back because it may
    // affect the reading speed.
    return TTSApi.play(playingList[index]);
};

const readToEnd = (dispatch, getState) => {
    return dispatch(playNextIndex()).then(() => {
        if (getState().ttsPlayer.state !== PLAYER_STATES.PLAYING) {
            throw new PlayerError(ERROR_CODES.STATE_MISMATCHED);
        }
        return readToEnd(dispatch, getState);
    }).catch((ex) => {
        if (ex.code === ERROR_CODES.WRONG_INDEX) {
            // it plays to end. we should capture this error.
            dispatch(setContentPlayed(getState().ttsPlayer.playingItem));
            return null;
        } else {
            console.error(ex);
            throw ex;
        }
    });
};

const findPlayable = (items) => {
    return _.find(items, (item) => {
        return !item.played && item.text;
    });
};

export const autoPlay = () => (dispatch, getState) => {
    const items = getState().contentList.list;
    const playable = findPlayable(items);

    if (!playable) {
        return Promise.resolve();
    }

    return dispatch(play(playable)).then(() => {
        return dispatch(autoPlay());
    });
};

export const play = (item) => (dispatch, getState) => {
    const playerState = getState().ttsPlayer.state;
    // current playing item had been removed. We just play next playable.
    if (playerState === PLAYER_STATES.PLAYING) {
        return dispatch(stop()).then(() => {
            dispatch(playItem(item));
        }).catch((ex) => {
            debugger;
        });
    } else {
        return dispatch(playItem(item));
    }
};

const playItem = (item) => (dispatch, getState) => {
    const contentList = getState().contentList.list;
    const itemForPlay = item || findPlayable(contentList);
    const itemIndex = _.findIndex(contentList, ['key', itemForPlay.key]);
    // check if it is in the list
    if (itemIndex < 0) {
        console.warn('the item had been removed from list', item);
        return Promise.reject(new PlayerError(ERROR_CODES.UNKNOWN_CONTENT));
    }
    // update states
    dispatch(setState(PLAYER_STATES.PLAYING));
    dispatch(setPlayingItem(itemForPlay));
    dispatch(setPlayingIndex(-1));
    // update notification
    NotificationHelper.setPlaying(itemForPlay, itemIndex, contentList.length);
    // start to play
    return TTSApi.play(i18n.t('tts_player.tts.play_title', { title: item.title })).then(() => {
        if (getState().ttsPlayer.state !== PLAYER_STATES.PLAYING) {
            throw new PlayerError(ERROR_CODES.STATE_MISMATCHED);
        }

        return TTSApi.play(i18n.t('tts_player.tts.play_content', {content: ''})).then(() => {
            if (getState().ttsPlayer.state !== PLAYER_STATES.PLAYING) {
                throw new PlayerError(ERROR_CODES.STATE_MISMATCHED);
            }
            return readToEnd(dispatch, getState);
        });
    }).catch((ex) => {
        if (ex.code === ERROR_CODES.STATE_MISMATCHED) {
            // someone tries to stop the playing. We should accept it.
            return null;
        }
        console.error('unable to speak', ex);
        throw ex;
    });
};

export const playNextIndex = () => (dispatch, getState) => {
    const { playingIndex } = getState().ttsPlayer;
    return dispatch(playIndex(playingIndex + 1));
};

export const playPreviousIndex = () => (dispatch, getState) => {
    const { playingIndex } = getState().ttsPlayer;
    return dispatch(playIndex(playingIndex - 1));
};

export const resume = () => (dispatch, getState) => {
    const { playingIndex, playingItem } = getState().ttsPlayer;

    dispatch(setState(PLAYER_STATES.PLAYING));
    const hintText = i18n.t('tts_player.tts.resume_playing', { title: playingItem.title });

    return TTSApi.play(hintText).then(() => {
        if (getState().ttsPlayer.state !== PLAYER_STATES.PLAYING) {
            throw new PlayerError(ERROR_CODES.STATE_MISMATCHED);
        }
        // resume playing at the start of paused index.
        return playIndex(playingIndex).then(() => {
            if (getState().ttsPlayer.state !== PLAYER_STATES.PLAYING) {
                throw new PlayerError(ERROR_CODES.STATE_MISMATCHED);
            }
            return readToEnd(dispatch, getState);
        });
    }).catch((ex) => {
        console.error('unable to speak', ex);
        throw ex;
    });
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
    const itemIndex = _.findIndex(contentList, ['key', playingItem.key]);
    if (itemIndex < 0) {
        // current playing item had been removed. We just play next playable.
        dispatch(play());
    } else if (itemIndex === contentList.length - 1) {
        // the current index is the last one. We don't have others.
        TTSApi.play(i18n.t('tts_player.tts.end_of_list'));
    } else {
        // the current index can move next.
        dispatch(play(contentList[itemIndex + 1]));
    }
};

export const playPreviousItem = () => (dispatch, getState) => {
    const contentList = getState().contentList.list;
    const playingItem = getState().ttsPlayer.playingItem;
    const itemIndex = _.findIndex(contentList, ['key', playingItem.key]);
    if (itemIndex < 0) {
        return dispatch(play());
    } else if (itemIndex === 0) {
        // the current index is the first one. We cannot move to previous one.
        TTSApi.play(i18n.t('tts_player.tts.start_of_list'));
    } else {
        // the current index can move next.
        return dispatch(play(contentList[itemIndex - 1]));
    }
};
