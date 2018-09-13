import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import {
    Icon,
    Left,
    ListItem,
    Right,
    Text
} from 'native-base';
import _ from 'lodash';
import { connect } from 'react-redux';
import { PLAYER_STATES } from '../constants/tts_player';

class ContentList extends PureComponent {
    renderListItem = ({ item }) => {
        const {
            playingItem,
            playerState,
            onPlay,
            onPause,
            onResume
        } = this.props;
        // the margin between left and right is too close. using `flex: 0` to remove extra space
        // at right.
        const rightStyle = { flex: 0 };
        const playing = playerState === PLAYER_STATES.PLAYING
                        && playingItem && item.key === playingItem.key;
        const iconName = `${playing ? 'pause' : 'play'}-circle${!item.text ? '-outline' : ''}`;
        // Only downloaded item can be played
        const onPress = !item.text ? (void 0) : () => {
            // We should read props from this again. The old one are bound at rendering. It may
            // not exactly the same as the time user presses a list item.
            const { playingItem, playerState } = this.props;
            if (playingItem && playingItem.key === item.key) {
                if (playerState === PLAYER_STATES.PLAYING) {
                    onPause(item);
                } else {
                    onResume(item);
                }
            } else {
                onPlay(item);
            }
        };
        return (
            <ListItem key={item.key} selected={playing} button onPress={onPress}>
                <Left>
                    <Text>{item.title}</Text>
                </Left>
                <Right style={rightStyle}>
                    <Icon name={iconName} type='MaterialCommunityIcons' />
                </Right>
            </ListItem>
        );
    }

    render() {
        const {
            contentList,
            playingItem,
            playerState
        } = this.props;
        const extraKey = `${playerState}-${playingItem && playingItem.key}`;
        return (
            <FlatList
                data={contentList}
                extraData={extraKey}
                renderItem={this.renderListItem} />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        contentList: state.contentList.list,
        playingItem: state.ttsPlayer.playingItem,
        playerState: state.ttsPlayer.state
    };
};

const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(ContentList);
