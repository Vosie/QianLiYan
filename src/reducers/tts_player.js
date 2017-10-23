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
    const separator = i18n.t('tts_player.sentence_seperator');
    // split by separator and put the separator back to line.
    const sentences = payload.text.split(separator);
    const playingList = _.map(sentences, (line) => {
        return `${line}${separator}`;
    });
    return {
        ...state,
        playingItem: _.cloneDeep(payload),
        playingList: playingList,
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
