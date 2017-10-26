import React, { PureComponent } from 'react';
import {
    Text
} from 'react-native';
import { connect } from 'react-redux';
import { setUtteranceId, setPlayingIndex } from '../actions/tts_player';
import style from './styles/tts_player';

class TTSPlayer extends PureComponent {

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
        playingItem: state.ttsPlayer.playingItem
    };
};

const mapActionsToProps = {
    setUtteranceId,
    setPlayingIndex
};

export default connect(mapStateToProps, mapActionsToProps)(TTSPlayer);
