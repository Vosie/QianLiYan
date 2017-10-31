import React, { PureComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { connect } from 'react-redux';
import { fetchList } from '../actions/content_list';
import { autoPlay } from '../actions/tts_player';
import style from './styles/main_app';
import ContentList from './ContentList';
import TTSPlayer from './TTSPlayer';

class AppContainer extends PureComponent {

    constructor(props) {
        super(props);
        // use this flag to make sure the auto play is triggered once after the app is opened.
        this.autoPlayTriggered = false;
    }

    componentDidMount() {
        this.props.fetchList();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.canPlay && this.props.canPlay && !this.autoPlayTriggered) {
            this.autoPlayTriggered = true;
            this.props.autoPlay();
        }
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
        canPlay: state.contentList.canPlay
    };
};

const mapActionsToProps = {
    autoPlay,
    fetchList
};

export default connect(mapStateToProps, mapActionsToProps)(AppContainer);
