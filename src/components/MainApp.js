import React, { PureComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { connect } from 'react-redux';
import { fetchList } from '../actions/content_list';
import style from './styles/main_app';
import ContentList from './ContentList';
import TTSPlayer from './TTSPlayer';

class AppContainer extends PureComponent {

    componentDidMount() {
        this.props.fetchList();
    }

    render() {
        const { loading, store } = this.props;
        if (loading) {
            return (
                <ActivityIndicator animating={true} size='large' style={style.loading} />
            );
        } else {
            return (
                <View style={style.main}>
                    <ContentList />
                    <TTSPlayer />
                </View>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        loading: !state.contentList.canPlay
    };
};

const mapActionsToProps = {
    fetchList
};

export default connect(mapStateToProps, mapActionsToProps)(AppContainer);
