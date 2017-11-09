import { createActionMap } from './utils';

const actionList = [
    'SET_STATE',
    'SET_PLAYED',
    'SET_PLAYINGITEM',
    'SET_PLAYING_SENTENCE_INDEX',
    'SET_UTTERANCEID'
];
const stateList = ['PLAYING', 'STOPPING', 'STOPPED', 'PAUSING', 'PAUSED'];
const playingMode = ['LOOP', 'SINGLE', 'SINGLE_REPEAT', 'SHUFFLE', 'RANDOM'];

export const ACTION_TYPES = createActionMap(actionList, 'tts_player.action');
export const PLAYER_STATES = createActionMap(stateList, 'tts_player.state');
export const PLAYING_MODE = createActionMap(playingMode, 'tts_player.playing_mode');

export const ERROR_CODES = {
    WRONG_INDEX: 1001,
    STATE_MISMATCHED: 1002,
    UNKNOWN_CONTENT: 1003
};
