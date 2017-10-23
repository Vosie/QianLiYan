import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from './main/store';
import TTSPlayer from './components/TTSPlayer';
import { play } from './actions/tts_player';

const TEST_ITEM = {
    key: 'link',
    sourceURL: 'url',
    categories: ['測試'],
    title: '這是一個測試的標題',
    description: '這是一個測試的描述。\n它需要第二句話。',
    text: '這是一個測試的描述。\n它需要第二句話。',
    pubDate: '2017-10-10T11:12:00',
    link: 'link'
};

const mainStore = createReduxStore();

setTimeout(() => {
    console.log('dispatch test item');
    mainStore.dispatch(play(TEST_ITEM));
}, 3000);

const Main = (props) => {
    return (
        <Provider store={mainStore}>
            <TTSPlayer />
        </Provider>
    );
};

export default Main;
