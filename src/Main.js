import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from './main/store';
import MainApp from './components/MainApp';
import ContentList from './components/ContentList';
import TTSPlayer from './components/TTSPlayer';

const mainStore = createReduxStore();

const Main = (props) => {
    return (
        <Provider store={mainStore}>
            <MainApp/>
        </Provider>
    );
};

export default Main;
