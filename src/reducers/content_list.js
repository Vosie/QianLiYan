import _ from 'lodash';
import i18n from '../shared/i18n';
import { ACTION_TYPES, MINIMUM_BUFFER_SIZE } from '../constants/content_list';
import { mapReducerActions } from './reducer_utils';

const initState = {
    canPlay: false,
    downloaderState: [],
    list: []
};

const addContentList = (state, payload) => {
    return {
        ...state,
        list: [
            ...state.list,
            ...payload.list
        ]
    };
};

const setContentText = (state, payload) => {
    // clone the list to let purecomponent re-render.
    const list = [...state.list];

    const item = _.find(list, ['key', payload.key]);
    if (item) {
        item.text = payload.text;
        item.lang = payload.lang;
    }

    let counter = 0;
    const canPlay = !!_.find(list, (item) => {
        item.text && counter++;

        if (counter >= MINIMUM_BUFFER_SIZE) {
            return item;
        }
    });

    return {
        ...state,
        canPlay,
        list
    };
};

const setContentPlayed = (state, payload) => {
    // clone the list to let purecomponent re-render.
    const list = [...state.list];

    const itemIndex = _.findIndex(list, ['key', payload.key]);
    if (itemIndex > -1) {
        list.splice(itemIndex, 1, {
            ...list[itemIndex],
            played: true
        });
    }

    return {
        ...state,
        list
    };
};

const type2StateMap = {
    [ACTION_TYPES.SET_DOWNLOADER_STATE]: 'state'
};

const type2FuncMap = {
    [ACTION_TYPES.ADD_CONTENT_LIST]: addContentList,
    [ACTION_TYPES.SET_CONTENT_PLAYED]: setContentPlayed,
    [ACTION_TYPES.SET_CONTENT_TEXT]: setContentText
};

export default mapReducerActions(type2StateMap, type2FuncMap, initState);
