import React, { PureComponent } from 'react';
import {
    Body,
    Icon,
    ListItem,
    Text
} from 'native-base';
import i18n from '../shared/i18n';
import { OPTION_TYPES } from '../constants/side_bar';
import style from './styles/side_bar';

class AddGroupMenu extends PureComponent {

    handlePress = () => {
        const { onPress } = this.props;
        onPress && onPress({ type: OPTION_TYPES.ADD });
    }

    render() {
        return (
            <ListItem button onPress={this.handlePress}>
                <Body>
                    <Text>
                        <Icon type='Ionicons' name='md-add' style={style.itemIcon} />
                        {' '}
                        {i18n.t('app.add_rss')}
                    </Text>
                </Body>
            </ListItem>
        );
    }
}

export default AddGroupMenu;
