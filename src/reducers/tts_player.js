import _ from 'lodash';
import i18n from '../shared/i18n';
import { ACTION_TYPES, PLAYER_STATES } from '../constants/tts_player';
import { mapReducerActions } from './reducer_utils';

const initState = {
    state: PLAYER_STATES.STOPPED,
    playingItem: null,
    playingSentenceList: [],
    playingSentenceIndex: -1
};

const setPlayingItem = (state, payload) => {
    if (null === payload) {
        return {
            ...state,
            playingItem: null,
            playingSentenceList: [],
            playingSentenceIndex: -1
        };
    }

    return {
        ...state,
        playingItem: _.cloneDeep(payload.item),
        playingSentenceList: payload.sentences,
        playingSentenceIndex: -1
    };
};

const type2StateMap = {
    [ACTION_TYPES.SET_STATE]: 'state',
    [ACTION_TYPES.SET_PLAYING_SENTENCE_INDEX]: 'playingSentenceIndex'
};

const type2FuncMap = {
    [ACTION_TYPES.SET_PLAYINGITEM]: setPlayingItem
};

export default mapReducerActions(type2StateMap, type2FuncMap, initState);
