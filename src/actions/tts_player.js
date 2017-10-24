import TTS from 'react-native-tts';
import { createAction } from 'redux-actions';
import i18n from '../shared/i18n';
import PlayerError from '../shared/player_error';
import {
    ERROR_CODES,
    PLAYER_STATES,
    actionTypes
} from '../constants/tts_player';
import TTSApi from '../services/tts_api';

const setState = createAction(actionTypes.SET_STATE);
const setPlayingItem = createAction(actionTypes.SET_PLAYINGITEM);
const setUtteranceId = createAction(actionTypes.SET_UTTERANCEID);
const setPlayingIndex = createAction(actionTypes.SET_PLAYINGINDEX);

const playIndex = (index) => (dispatch, getState) => {
    const { playingList } = getState().ttsPlayer;
    if (index < 0 || index >= playingList.length) {
        return Promise.reject(new PlayerError(ERROR_CODES.WRONG_INDEX));
    }
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
            return null;
        } else {
            console.log(ex);
            throw ex;
        }
    });
};

export const play = (item) => (dispatch, getState) => {
    dispatch(setState(PLAYER_STATES.PLAYING));
    dispatch(setPlayingItem(item));
    dispatch(setPlayingIndex(-1));
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
        dispatch(setState(PLAYER_STATES.PAUSD));
    }).catch((ex) => {
        dispatch(setState(PLAYER_STATES.PAUSD));
    });
};

export const stop = () => (dispatch, getState) => {
    // reset the playing item and index when it is stopped.
    dispatch(setState(PLAYER_STATES.STOPPING));
    return TTSApi.stop().then((res) => {
        dispatch(setState(PLAYER_STATES.STOPPED));
        dispatch(setPlayingItem(null));
        dispatch(setPlayingIndex(-1));
        return res;
    }).catch((ex) => {
        dispatch(setState(PLAYER_STATES.STOPPED));
        dispatch(setPlayingItem(null));
        dispatch(setPlayingIndex(-1));
        throw ex;
    });
};
