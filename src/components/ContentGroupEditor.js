import React, { PureComponent } from 'react';
import Modal from 'react-native-modal';
import {
    Container,
    Content,
    Body,
    Button,
    Footer,
    FooterTab,
    Header,
    Text,
    Title
} from 'native-base';
import style from './styles/content_group_editor';

class ContentGroupEditor extends PureComponent {

    render() {
        const { visible, onClose } = this.props;
        return (
            <Modal
                isVisible={visible}
                onBackButtonPress={onClose}
                onBackdropPress={onClose} >
                <Container>
                    <Header>
                        <Body>
                            <Title>HAHAHAHA</Title>
                        </Body>
                    </Header>
                    <Content>
                        <Text>ABCDEFG</Text>
                    </Content>
                    <Footer style={style.footer}>
                        <Button block light onPress={onClose}>
                            <Text>Cancel</Text>
                        </Button>
                        <Button
                            block
                            info
                            style={style.confirmButton}
                            onPress={onClose}>
                            <Text>Create</Text>
                        </Button>
                    </Footer>
                </Container>
            </Modal>
        );
    }
}

export default ContentGroupEditor;
