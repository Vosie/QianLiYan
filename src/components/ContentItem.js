import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import style from './styles/content_item';

class ContentItem extends PureComponent {
    render() {
        const {
            index,
            item,
            playing
        } = this.props;
        const compStyle = [index % 2 ? style.odd : style.even];
        if (playing) {
            compStyle.push(style.playing);
        }
        return (<Text key={item.link} style={compStyle}>{item.title}</Text>);
    }
}


export default ContentItem;
