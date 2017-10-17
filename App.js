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
import RNExitApp from 'react-native-exit-app';

const FEED_LIST = ['https://feeds.feedburner.com/TheNewsLens'];

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    this.state = {
      autoPlay: true,
      currentIndex: -1,
      items: [],
      playingUtterance: null,
      systemUtterance: null,
      ttsState: MusicControl.STATE_STOPPED
    };
    this.renderListItem = this.renderListItem.bind(this);
    this.handleTTSStarted = this.handleTTSStarted.bind(this);
    this.handleTTSStopped = this.handleTTSStopped.bind(this);
  }

  componentDidMount() {
    this.fetchFeeds();
    this.initTTS();
    this.initMusicControl();
  }

  componentWillUnmount() {

  }

  initTTS() {
    TTS.addEventListener('tts-start', this.handleTTSStarted);
    TTS.addEventListener('tts-cancel', this.handleTTSStopped);
    TTS.addEventListener('tts-finish', this.handleTTSStopped);
  }

  initMusicControl() {
    // basic
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    // previous and next
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    //
    MusicControl.enableControl('seek', false) // Android only
    MusicControl.enableControl('skipForward', false)
    MusicControl.enableControl('skipBackward', false)
    MusicControl.on('play', ()=> {
      console.log('play');
      TTS.stop();
    })

    // on iOS this event will also be triggered by the audio router change event.
    // This happens when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
    MusicControl.on('pause', ()=> {
      console.log('trying to stop it.');
      TTS.stop();
    });

    MusicControl.on('stop', ()=> {
      TTS.stop();
    });

    MusicControl.on('nextTrack', ()=> {
      TTS.stop();
    });

    MusicControl.on('previousTrack', ()=> {
      this.setState({
        currentIndex: this.state.currentIndex - 1
      }, () => {
        TTS.stop();
      });
    });

    MusicControl.on('closeNotification', () => {
      this.setState({
        autoPlay: false
      }, () => {
        TTS.stop();
        RNExitApp.exitApp();
      });
    });
  }

  handleTTSStarted(utteranceId) {
    const { currentIndex, items } = this.state;
    if (currentIndex < 0 || currentIndex >= items.length) {
      // if no playing item found, it is playing system voice.
      return;
    }

    const playingItem = items[currentIndex];

    MusicControl.setNowPlaying({
      title: playingItem.title,
      artist: 'TTS',
      duration: 1 + (playingItem.title.length + playingItem.description.length) / 7, // (Seconds)
      description: playingItem.description,
      ttsState: MusicControl.STATE_PLAYING,
      speed: 1
    });
    console.log('playing size: ' + (playingItem.title.length + playingItem.description.length));
  }

  handleTTSStopped({ utteranceId }) {
    const {
      autoPlay,
      currentIndex,
      items,
      playingUtterance,
      systemUtterance
    } = this.state;
    if (playingUtterance !== utteranceId && systemUtterance !== utteranceId) {
      return;
    }

    if (!autoPlay) {
      this.setState({
        playingUtterance: null,
        systemUtterance: null,
        ttsState: MusicControl.STATE_STOPPED,
      });
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < items.length) {
      this.setState({
        currentIndex: nextIndex
      }, () => {
        this.play(items[nextIndex]);
      });
    } else {
      this.setState({
        playingUtterance: null,
        systemUtterance: null,
        ttsState: MusicControl.STATE_STOPPED,
      });
    }
  }

  play(item) {
    TTS.speak(`標題：${item.title}。描述：${item.description}`).then((utteranceId) => {
      this.setState({ playingUtterance: utteranceId });
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

  handleDataInserted(newItems) {
    const { items, ttsState } = this.state;

    if (ttsState !== MusicControl.STATE_STOPPED) {
      return;
    }

    const firstItem = items[0];

    TTS.speak('開始報讀新聞.').then((utteranceId) => {
      this.setState({ systemUtterance: utteranceId });
    });
  }

  addXMLFeed(url, xml) {
    const newItems = [...this.state.items];
    const channels = _.get(xml, 'rss.channel');
    _.forEach(channels, (channel) => {
      _.forEach(channel.item, (item) => {
        newItems.push(this.convertToFeedItem(url, item));
      });
    });

    this.setState({ items: newItems }, (utteranceId) => {
      this.handleDataInserted(newItems);
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
