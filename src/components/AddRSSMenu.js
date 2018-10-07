import React, { PureComponent } from 'react';
import {
    Body,
    Icon,
    ListItem,
    Text
} from 'native-base';
import i18n from '../shared/i18n';
import style from './styles/side_bar';

class AddRSSMenu extends PureComponent {

    render() {
        const { onPress } = this.props;
        return (
            <ListItem button onPress={onPress}>
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

export default AddRSSMenu;
