import _ from 'lodash';
import i18n from '../shared/i18n';
import { ACTION_TYPES, PLAYER_STATES } from '../constants/tts_player';
import { mapReducerActions } from './reducer_utils';

const initState = {
    state: PLAYER_STATES.STOPPED,
    playingItem: null,
    playingList: [],
    playingIndex: -1,
    utteranceId: null
};

const setPlayingItem = (state, payload) => {
    if (null === payload) {
        return {
            ...state,
            playingItem: null,
            playingList: [],
            playingIndex: -1
        };
    }
    const separator = i18n.t('tts_player.sentence_separator');
    // split by separator
    // We need to think if we should put the separator back because it may
    // affect the reading speed.
    const sentences = payload.text.split(separator);
    return {
        ...state,
        playingItem: _.cloneDeep(payload),
        playingList: sentences,
        playingIndex: -1
    };
};

const type2StateMap = {
    [ACTION_TYPES.SET_STATE]: 'state',
    [ACTION_TYPES.SET_UTTERANCEID]: 'utteranceId',
    [ACTION_TYPES.SET_PLAYINGINDEX]: 'playingIndex'
};

const type2FuncMap = {
    [ACTION_TYPES.SET_PLAYINGITEM]: setPlayingItem
};

export default mapReducerActions(type2StateMap, type2FuncMap, initState);
