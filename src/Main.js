import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from './main/store';
import MainApp from './containers/MainApp';

const mainStore = createReduxStore();

const Main = (props) => {
    return (
        <Provider store={mainStore}>
            <MainApp/>
        </Provider>
    );
};

export default Main;
