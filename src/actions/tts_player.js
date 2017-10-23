import TTS from 'react-native-tts';
import { createAction } from 'redux-actions';
import PlayerError from '../shared/player_error';
import {
    ERROR_CODES,
    actionTypes,
    states
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
    // We need to think if we should put the seperator back because it may
    // affect the reading speed.
    return TTSApi.play(playingList[index]);
};

const readToEnd = (dispatch, getState) => {
    return dispatch(playNextIndex()).then(() => {
        if (getState().ttsPlayer.state === states.PLAYING) {
            return readToEnd(dispatch, getState);
        } else {
            return null;
        }
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
    dispatch(setState(states.PLAYING));
    dispatch(setPlayingItem(item));
    dispatch(setPlayingIndex(-1));
    return TTSApi.play(`標題：${item.title}。`).then(() => {
        return TTSApi.play('本文：').then(() => {
            return readToEnd(dispatch, getState);
        });
    }).catch((ex) => {
        console.error('unable to speak', ex);
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

export const pause = () => (dispatch, getState) => {};
export const stop = () => (dispatch, getState) => {};
