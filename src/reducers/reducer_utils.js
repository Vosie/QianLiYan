import _ from 'lodash';

export const updatePayloads = (state, action, map) => {
    if (map[action.type]) {
        if (map[action.type].indexOf('.') === -1) {
            return {
                ...state,
                [map[action.type]]: action.payload
            };
        } else {
            const dataPaths = map[action.type].split('.');
            const firstLevelKey = dataPaths[0];
            const firstLevelData = {...state[firstLevelKey]};
            _.set(firstLevelData, _.drop(dataPaths).join('.'), action.payload);

            return {
                ...state,
                [firstLevelKey]: firstLevelData
            };
        }
    } else {
        return false;
    }
};

export const mapReducerActions = (type2StateMap, type2FuncMap, initState) => (
    (state = initState, action) => {
        // use utils to update payload
        const update = updatePayloads(state, action, type2StateMap);
        if (update) {
            return update;
        } else if (type2FuncMap && type2FuncMap[action.type]) {
            return type2FuncMap[action.type](state, action.payload);
        } else {
            return state;
        }
    }
);
