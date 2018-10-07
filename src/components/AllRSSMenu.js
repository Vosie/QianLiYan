import React, { PureComponent } from 'react';
import {
    Body,
    ListItem,
    Text
} from 'native-base';
import i18n from '../shared/i18n';
import style from './styles/side_bar';

class AllRSSMenu extends PureComponent {
    render() {
        const { active, onPress } = this.props;
        return (
            <ListItem
                button
                selected={active}
                onPress={onPress} >
                <Body>
                    <Text>{i18n.t('app.all_items')}</Text>
                </Body>
            </ListItem>
        );
    }
}

export default AllRSSMenu;
