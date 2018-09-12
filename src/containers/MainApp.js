import React, { PureComponent } from 'react';
import {
    Container,
    Content,
    Spinner
} from 'native-base';
import { connect } from 'react-redux';
import RNExitApp from 'react-native-exit-app';
import DeviceLocker from 'react-native-device-locker';
import { fetchList } from '../actions/content_list';
import {
    initTTSApiListeners,
    play,
    pause,
    resume
} from '../actions/tts_player';
import ContentList from '../components/ContentList';
import TTSPlayer from '../components/TTSPlayer';
import TTSApi from '../services/tts_api';
import NotificationHelper from '../services/notification_helper';
import AppHeader from './AppHeader';

class AppContainer extends PureComponent {

    constructor(props) {
        super(props);
        // use this flag to make sure the auto play is triggered once after the app is opened.
        this.autoPlayTriggered = false;
    }

    componentDidMount() {
        this.props.fetchList();
        NotificationHelper.onNotificationClosed(() => {
            TTSApi.close();
            NotificationHelper.close();
            RNExitApp.exitApp();
        });
    }

    componentDidUpdate(prevProps) {
        const {
            canPlay,
            contentList,
            initTTSApiListeners,
            play
        } = this.props;

        if (!prevProps.canPlay && canPlay && !this.autoPlayTriggered) {
            this.autoPlayTriggered = true;
            // once canPlay is true, we always have one playable content.
            initTTSApiListeners();
            play(contentList[0]);
        }
    }

    componentWillUnmount() {
        DeviceLocker.releaseAll();
        TTSApi.close();
        NotificationHelper.close();
    }

    renderLoading() {
        return (
            <Container>
                <Content>
                    <Spinner />
                </Content>
            </Container>
        );
    }

    renderMain() {
        const { play, pause, resume } = this.props;
        return (
            <Container>
                <AppHeader title='All Items'/>
                <Content>
                    <ContentList
                        onPlay={play}
                        onPause={pause}
                        onResume={resume} />
                    <TTSPlayer />
                </Content>
            </Container>
        );
    }

    render() {
        return this.props.canPlay ? this.renderMain() : this.renderLoading();
    }
}

const mapStateToProps = (state) => {
    return {
        canPlay: state.contentList.canPlay,
        contentList: state.contentList.list,
        playingItem: state.ttsPlayer.playingItem
    };
};

const mapActionsToProps = {
    fetchList,
    initTTSApiListeners,
    play,
    pause,
    resume
};

export default connect(mapStateToProps, mapActionsToProps)(AppContainer);
