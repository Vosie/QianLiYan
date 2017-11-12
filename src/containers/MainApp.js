import React, { PureComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { connect } from 'react-redux';
import RNExitApp from 'react-native-exit-app';
import { fetchList } from '../actions/content_list';
import { initTTSApiListeners, play } from '../actions/tts_player';
import ContentList from '../components/ContentList';
import TTSPlayer from '../components/TTSPlayer';
import TTSApi from '../services/tts_api';
import NotificationHelper from '../services/notification_helper';
import style from './styles/main_app';

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
        TTSApi.close();
        NotificationHelper.close();
    }

    render() {
        const { canPlay, store } = this.props;
        if (!canPlay) {
            return (
                <ActivityIndicator animating={true} size='large' style={style.loading} />
            );
        } else {
            return (
                <View style={style.main}>
                    <ContentList />
                    <TTSPlayer />
                </View>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        canPlay: state.contentList.canPlay,
        contentList: state.contentList.list
    };
};

const mapActionsToProps = {
    fetchList,
    initTTSApiListeners,
    play
};

export default connect(mapStateToProps, mapActionsToProps)(AppContainer);
