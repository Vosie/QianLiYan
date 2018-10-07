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
import style from './styles/side_bar';
import AddRSSMenu from './AddRSSMenu';
import AllRSSMenu from './AllRSSMenu';

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
        switch (item.type) {
            case OPTION_TYPES.ADD:
                return (<AddRSSMenu onPress={onPress} />);
            case OPTION_TYPES.ALL:
                return (<AllRSSMenu active={active === OPTION_TYPES.ALL} onPress={onPress} />);
            default:
                return (
                    <ListItem
                        key={item.url}
                        button
                        selected={item.url === active}
                        onPress={onPress} >
                        <Left style={style.itemRight} />
                        <Body>
                            <Text>{item.name}</Text>
                        </Body>
                        <Right style={style.itemRight}>
                            <Icon
                                type='MaterialCommunityIcons'
                                name='delete-sweep'
                                style={style.itemIcon} />
                        </Right>
                    </ListItem>
                );
        }
    }

    render() {
        return (
            <Container style={style.sideBar}>
                <Header>
                    <Left/>
                    <Body>
                        <Title>{i18n.t('app.app_name')}</Title>
                    </Body>
                    <Right>
                        <Icon type='Ionicons' name='md-settings' style={style.sideBarSettings} />
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
