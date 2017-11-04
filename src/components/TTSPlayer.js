import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { PLAYER_STATES } from '../constants/tts_player';
import {
    play,
    playNextItem,
    playPreviousItem,
    pause,
    resume,
    stop
} from '../actions/tts_player';
import avEventSource from '../services/av_event_source';
import NotificationHelper from '../services/notification_helper';
import style from './styles/tts_player';

class TTSPlayer extends PureComponent {

    constructor(props) {
        super(props);
        this.handlePlay = ::this.handlePlay;
    }

    componentDidMount() {
        const {
            pause,
            playNextItem,
            playPreviousItem,
            stop
        } = this.props;
        avEventSource.addEventListener('play', this.handlePlay);
        // Have no idea to handle pause or playNextItem on a headset with single button pressed.
        // UX needed...  :'(
        avEventSource.addEventListener('pause', playNextItem);
        avEventSource.addEventListener('stop', stop);
        // TODO: use action from actions/tts_player.js
        avEventSource.addEventListener('nextTrack', playNextItem);
        avEventSource.addEventListener('previousTrack', playPreviousItem);
    }

    handlePlay() {
        const {
            play,
            playerState,
            resume
        } = this.props;
        if (playerState === PLAYER_STATES.PAUSED) {
            resume();
        } else {
            play();
        }
    }

    render() {
        const { playingItem } = this.props;
        const title = playingItem ? playingItem.title : 'empty';
        return (
            <Text style={style.player}>{title}</Text>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        playingItem: state.ttsPlayer.playingItem,
        playerState: state.ttsPlayer.state
    };
};

const mapActionsToProps = {
    pause,
    play,
    playNextItem,
    playPreviousItem,
    resume,
    stop
};

export default connect(mapStateToProps, mapActionsToProps)(TTSPlayer);
