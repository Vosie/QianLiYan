import TTS from 'react-native-tts';
import { createAction } from 'redux-actions';
import { actionTypes, states } from '../constants/tts_player';

const setState = createAction(actionTypes.SET_STATE);
const setPlayingItem = createAction(actionTypes.SET_PLAYINGITEM);
const setUtteranceId = createAction(actionTypes.SET_UTTERANCEID);
const setPlayingIndex = createAction(actionTypes.SET_PLAYINGINDEX);

const idMap = {};

TTS.addEventListener('tts-cancel', this.handleTTSStopped);
TTS.addEventListener('tts-finish', ({ utteranceId }) => {
    idMap[utteranceId] && idMap[utteranceId]();
});

const TTSPlay = (text) => {
    return new Promise((resolve, reject) => {
        TTS.speak(text).then((utteranceId) => {
            idMap[utteranceId] = resolve;
        }).catch((ex) => {
            reject(ex);
        });
    });
};

const playIndex = (index) => (dispatch, getState) => {
    const { playingList } = getState().ttsPlayer;
    if (index < 0 || index >= playingList.length) {
        return Promise.reject('wrong index number');
    }
    dispatch(setPlayingIndex(index));
    return TTSPlay(playingList[index]);
};

const readToEnd = (dispatch) => {
    dispatch(playNextIndex()).then(() => {
        readToEnd(dispatch);
    }).catch((ex) => {
        // capture the error
        console.log(ex);
    });
};

export const play = (item) => (dispatch, getState) => {
    dispatch(setState(states.PLAYING));
    dispatch(setPlayingItem(item));
    dispatch(setPlayingIndex(-1));
    return TTSPlay(`標題：${item.title}。`).then(() => {
        return TTS.speak('本文：').then(() => {
            readToEnd(dispatch);
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
