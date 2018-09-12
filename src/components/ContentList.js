import React, { PureComponent } from 'react';
import {
    Icon,
    Left,
    List,
    ListItem,
    Right,
    Text
} from 'native-base';
import _ from 'lodash';
import { connect } from 'react-redux';
import { PLAYER_STATES } from '../constants/tts_player';

class ContentList extends PureComponent {
    renderListItems() {
        const {
            contentList,
            playingItem,
            playerState,
            onPlay,
            onPause,
            onResume
        } = this.props;
        return _.map(contentList, (item) => {
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
        });
    }

    render() {
        return (
            <List>
                {this.renderListItems()}
            </List>
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
