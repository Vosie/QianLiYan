import { createActionMap } from './utils';

const actionList = [
    'SET_STATE',
    'SET_PLAYINGITEM',
    'SET_PLAYINGINDEX',
    'SET_UTTERANCEID'
];
const stateList = ['PLAYING', 'STOPPING', 'STOPPED', 'PAUSING', 'PAUSED'];

export const actionTypes = createActionMap(actionList, 'tts_player.action');
export const states = createActionMap(stateList, 'tts_player.state');

export const ERROR_CODES = {
    WRONG_INDEX: 1001
};
