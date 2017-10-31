import React, { PureComponent } from 'react';
import {
    FlatList,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import style from './styles/content_list';
import ContentItem from './ContentItem';

class ContentList extends PureComponent {

    constructor(props) {
        super(props);

        this.renderListItem = ::this.renderListItem;
    }

    renderListItem({ item, index }) {
        const { playingItem } = this.props;
        return (
            <ContentItem
                key={item.key}
                index={index}
                item={item}
                playing={playingItem && item.key === playingItem.key}/>
        );
    }

    render() {
        const { contentList } = this.props;
        return (
            <FlatList
              data={contentList}
              renderItem={this.renderListItem}
              style={style.list} />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        contentList: state.contentList.list,
        playingItem: state.ttsPlayer.playingItem
    };
};

const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(ContentList);
