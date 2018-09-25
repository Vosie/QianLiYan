import React, { PureComponent } from "react";
import { Container, Content, Text } from "native-base";

class SideBar extends PureComponent {

    render() {
        const style = { backgroundColor: "white" };
        return (
            <Container style={style}>
                <Content>
                    <Text>This is a SideBar.</Text>
                </Content>
            </Container>
        );
    }
}

export default SideBar;
