import _ from 'lodash';

export const createActionMap = (list, prefix) => {
    return _.reduce(list, (acc, item) => {
        acc[item] = `${prefix}.${item}`;
        return acc;
    }, {});
};
