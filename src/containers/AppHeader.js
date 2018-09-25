import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    Body,
    Button,
    Header,
    Icon,
    Left,
    Right,
    Title
} from 'native-base';

class AppHeader extends PureComponent {

    static propTypes = {
        title: PropTypes.node,

        onMenuClick: PropTypes.func
    };

    render() {
        const { title, onMenuClick } = this.props;
        return (
            <Header>
                <Left>
                    <Button transparent onPress={onMenuClick}>
                        <Icon name="menu" />
                    </Button>
                </Left>
                <Body>
                    <Title>{title}</Title>
                </Body>
                <Right/>
            </Header>
        );
    }
}

export default AppHeader;
