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
import MusicControl from 'react-native-music-control';

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
    this.initMusicControl();
  }

  initMusicControl() {
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('seek', false) // Android only
    MusicControl.enableControl('skipForward', true)
    MusicControl.enableControl('skipBackward', true)
    MusicControl.on('play', ()=> {
      console.log('play');
    })

    // on iOS this event will also be triggered by the audio router change event.
    // This happens when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
    MusicControl.on('pause', ()=> {
      console.log('pause');
    });

    MusicControl.on('stop', ()=> {
      console.log('stop');
    });

    MusicControl.on('nextTrack', ()=> {
      console.log('nextTrack');
    });

    MusicControl.on('previousTrack', ()=> {
      console.log('previousTrack');
    });
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

    MusicControl.setNowPlaying({
      title: newItems[0].title,
      artist: 'TTS',
      duration: 294, // (Seconds)
      description: newItems[0].description
    });

    this.setState({ items: newItems }, () => {
      MusicControl.setPlayback({
        state: MusicControl.STATE_PLAYING,
        speed: 1,
        elapsedTime: 103,
        bufferedTime: 200
      })

      MusicControl.enableControl('play', true)
      MusicControl.enableControl('pause', true)
      MusicControl.enableControl('stop', false)
      MusicControl.enableControl('nextTrack', true)
      MusicControl.enableControl('previousTrack', true)
    });
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
