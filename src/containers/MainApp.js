import React, { PureComponent } from 'react';
import { View } from 'react-native';
import {
    Container,
    Content,
    Footer,
    FooterTab,
    Spinner
} from 'native-base';
import Drawer from 'react-native-drawer';
import { connect } from 'react-redux';
import RNExitApp from 'react-native-exit-app';
import DeviceLocker from 'react-native-device-locker';
import i18n from '../shared/i18n';
import { OPTION_TYPES } from '../constants/side_bar';
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
import AppHeader from '../components/AppHeader';
import SideBar from '../components/SideBar';
import ContentGroupEditor from '../components/ContentGroupEditor';
import style from './styles/main_app';

class AppContainer extends PureComponent {

    constructor(props) {
        super(props);
        // use this flag to make sure the auto play is triggered once after the app is opened.
        this.autoPlayTriggered = false;
        this.state = {
            groupEditorVisible: false
        };
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

    bindDrawer = (drawer) => {
        this.drawer = drawer;
    }

    closeDrawer = () => {
        this.drawer && this.drawer.close();
    }

    openDrawer = () => {
        this.drawer && this.drawer.open();
    }

    handleSlideBarPress = (item) => {
        if (item.type === OPTION_TYPES.ADD) {
            this.setState({ groupEditorVisible: true });
        }
    }

    handleGroupEditorClose = () => {
        this.setState({ groupEditorVisible: false });
    }

    renderDrawer = () => {
        // TODO: read url from active playing group
        return (<SideBar active={OPTION_TYPES.ALL} onPress={this.handleSlideBarPress} />);
    }

    renderLoading = () => {
        return (
            <Container>
                <Content>
                    <Spinner />
                </Content>
            </Container>
        );
    }

    renderTitle = () => {
        // TODO: read title from active playing group
        return i18n.t('app.all_items');
    }

    renderMain = () => {
        const { play, pause, resume } = this.props;
        return (
            <View style={style.main}>
                <Drawer
                    ref={this.bindDrawer}
                    closedDrawerOffset={-3}
                    content={this.renderDrawer()}
                    openDrawerOffset={0.3}
                    panCloseMask={0.2}
                    style={{ drawer: style.drawer }}
                    tapToClose={true}
                    type='overlay'
                    tweenHandler={(ratio) => ({ main: { opacity: (2 - ratio) / 2 } })}
                    onClose={this.closeDrawer}>
                    <Container>
                        <AppHeader title={this.renderTitle()} onMenuClick={this.openDrawer}/>
                        <Content>
                            <ContentList
                                onPlay={play}
                                onPause={pause}
                                onResume={resume} />
                        </Content>
                        <Footer>
                            <FooterTab>
                                <TTSPlayer />
                            </FooterTab>
                        </Footer>
                    </Container>
                </Drawer>
                <ContentGroupEditor
                    visible={this.state.groupEditorVisible}
                    onClose={this.handleGroupEditorClose}/>
            </View>
        );
    }

    render = () => {
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
