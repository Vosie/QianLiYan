import React, { PureComponent } from 'react';
import {
    Body,
    ListItem,
    Text
} from 'native-base';
import i18n from '../shared/i18n';
import { OPTION_TYPES } from '../constants/side_bar';
import style from './styles/side_bar';

class AllGroupMenu extends PureComponent {

    handlePress = () => {
        const { onPress } = this.props;
        onPress && onPress({ type: OPTION_TYPES.ALL });
    }

    render() {
        const { active } = this.props;
        return (
            <ListItem
                button
                selected={active}
                onPress={this.handlePress} >
                <Body>
                    <Text>{i18n.t('app.all_items')}</Text>
                </Body>
            </ListItem>
        );
    }
}

export default AllGroupMenu;
