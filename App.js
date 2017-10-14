import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { parseString } from 'react-native-xml2js';
import TTS from 'react-native-tts';
import _ from 'lodash';

const FEED_LIST = ['https://feeds.feedburner.com/TheNewsLens'];

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.renderListItem = this.renderListItem.bind(this);
  }

  componentDidMount() {
    this.fetchFeeds();
    this.dumpTTSVoices();
  }

  dumpTTSVoices() {
    TTS.voices().then((data) => {
      console.log(data);
    });
  }

  convertToFeedItem(url, rssItem) {
    const link = rssItem.link[0] || _.get(rssItem, 'feedburner:origLink[0]');
    return {
      key: `${url}$${link}`,
      sourceURL: url,
      categories: rssItem.category,
      title: rssItem.title.join(', '),
      description: rssItem.description.join(', '),
      pubDate: rssItem.pubDate[0],
      link: link
    };
  }

  addXMLFeed(url, xml) {
    const newItems = [...this.state.items];
    const channels = _.get(xml, 'rss.channel');
    _.forEach(channels, (channel) => {
      _.forEach(channel.item, (item) => {
        newItems.push(this.convertToFeedItem(url, item));
      });
    });

    this.setState({ items: newItems });
  }

  fetchFeeds() {
    FEED_LIST.forEach((url) => {
      fetch(url).then((response) => {
        return response.text();
      }).then((text) => {
        return new Promise((resolve, reject) => {
          parseString(text, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      }).then((xml) => {
        this.addXMLFeed(url, xml);
      });
    });
  }

  renderListItem({item, index}) {
    return (<Text style={styles.listItem}>{item.title}</Text>);
  }

  render() {
    const { items } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Items Count: {items.length}
        </Text>
        <FlatList
          data={items}
          renderItem={this.renderListItem}
          style={styles.list} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    flexGrow: 0,
    flexShrink: 0
  },
  list: {
    flexGrow: 1,
    flexShrink: 1
  },

  listItem: {
    borderBottomColor: '#888888',
    borderBottomWidth: 2,
    fontSize: 20
  }
});
