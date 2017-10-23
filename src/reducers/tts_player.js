import _ from 'lodash';
import i18n from '../shared/i18n';
import { actionTypes, states } from '../constants/tts_player';
import { mapReducerActions } from './reducer_utils';

const initState = {
    state: states.STOPPED,
    playingItem: null,
    playingList: [],
    playingIndex: -1,
    utteranceId: null
};

const setPlayingItem = (state, payload) => {
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
    [actionTypes.SET_STATE]: 'state',
    [actionTypes.SET_UTTERANCEID]: 'utteranceId',
    [actionTypes.SET_PLAYINGINDEX]: 'playingIndex'
};

const type2FuncMap = {
    [actionTypes.SET_PLAYINGITEM]: setPlayingItem
};

export default mapReducerActions(type2StateMap, type2FuncMap, initState);
