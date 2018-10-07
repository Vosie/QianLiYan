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
import { OPTION_TYPES } from '../constants/side_bar';
import { FEED_TYPE } from '../constants/content_list';
import i18n from '../shared/i18n';
import style from './styles/side_bar';
import AddGroupMenu from './AddGroupMenu';
import AllGroupMenu from './AllGroupMenu';

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

    handlePress(item) {
        const { onPress } = this.props;
        onPress && onPress(item);
    }

    renderListItem = ({ item }) => {
        const { active, onPress } = this.props;
        switch (item.type) {
            case OPTION_TYPES.ADD:
                return (<AddGroupMenu onPress={onPress} />);
            case OPTION_TYPES.ALL:
                return (<AllGroupMenu active={active === OPTION_TYPES.ALL} onPress={onPress} />);
            default:
                return (
                    <ListItem
                        key={item.url}
                        button
                        selected={item.url === active}
                        onPress={this.handlePress.bind(this, item)} >
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

    render = () => {
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
