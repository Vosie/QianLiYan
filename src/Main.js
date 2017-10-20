import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from './main/store';
import App from './App'

const mainStore = createReduxStore();

const Main = (props) => {
    return (
        <Provider store={mainStore}>
            <App/>
        </Provider>
    );
};

export default Main;
