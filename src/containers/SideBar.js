import React, { PureComponent } from 'react';
import {
    Container,
    Content,
    Body,
    Header,
    Icon,
    Left,
    ListItem,
    Right,
    Text,
    Title
} from 'native-base';
import { FlatList } from 'react-native';
import _ from 'lodash';
import { FEED_TYPE } from '../constants/content_list';
import i18n from '../shared/i18n';

export const OPTION_TYPES = {
    ADD: 'add_button',
    ALL: 'all_items'
};

// remove this after implemented
export const DEFAULT_FEED_LIST = [{
    type: OPTION_TYPES.ALL,
    url: OPTION_TYPES.ALL
}, {
    type: FEED_TYPE.RSS,
    name: '關鍵新聞網',
    lang: 'zh',
    url: 'https://feeds.feedburner.com/TheNewsLens'
}, {
    type: FEED_TYPE.RSS,
    name: '明日科學',
    lang: 'zh',
    url: 'https://tomorrowsci.com/feed/'
}, {
    type: OPTION_TYPES.ADD,
    url: OPTION_TYPES.ADD
}];
class SideBar extends PureComponent {

    renderListItem = ({ item }) => {
        const { active, onPress } = this.props;
        const name = item.type === OPTION_TYPES.ALL ? i18n.t('app.all_items')
                                                    : item.name;
        const iconStyle = {
            fontSize: 18
        };
        return item.type === OPTION_TYPES.ADD ? (
            <ListItem key={item.url} button onPress={onPress}>
                <Body>
                    <Text>
                        <Icon type='Ionicons' name='md-add' style={iconStyle} />
                        {' '}
                        {i18n.t('app.add_rss')}
                    </Text>
                </Body>
            </ListItem>
        ) : (
            <ListItem
                key={item.url}
                button
                selected={item.url === active}
                onPress={onPress} >
                <Body>
                    <Text>{name}</Text>
                </Body>
            </ListItem>
        );
    }

    render() {
        const style = { backgroundColor: 'white' };
        const iconStyle = {
            color: 'white'
        };
        return (
            <Container style={style}>
                <Header>
                    <Left/>
                    <Body>
                        <Title>{i18n.t('app.app_name')}</Title>
                    </Body>
                    <Right>
                        <Icon type='Ionicons' name='md-settings' style={iconStyle} />
                    </Right>
                </Header>
                <Content>
                    <FlatList
                        data={DEFAULT_FEED_LIST}
                        keyExtractor={(item) => (item.url)}
                        renderItem={this.renderListItem} />
                </Content>
            </Container>
        );
    }
}

export default SideBar;
