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

// This is an fast prototype. We should refactor it to leverage redux.
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
    MusicControl.resetNowPlaying();
    this.uninitTTS();
  }

  initTTS() {
    TTS.addEventListener('tts-start', this.handleTTSStarted);
    TTS.addEventListener('tts-cancel', this.handleTTSStopped);
    TTS.addEventListener('tts-finish', this.handleTTSStopped);
  }

  uninitTTS() {
    TTS.stop();
    TTS.removeEventListener('tts-start', this.handleTTSStarted);
    TTS.removeEventListener('tts-cancel', this.handleTTSStopped);
    TTS.removeEventListener('tts-finish', this.handleTTSStopped);
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
      this.forceNext();
    });

    // on iOS this event will also be triggered by the audio router change event.
    // This happens when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
    MusicControl.on('pause', ()=> {
      console.log('trying to stop it.');
      this.forceNext();
    });

    MusicControl.on('stop', ()=> {
      this.forceNext();
    });

    MusicControl.on('nextTrack', ()=> {
      this.forceNext();
    });

    MusicControl.on('previousTrack', ()=> {
      this.setState({
        currentIndex: this.state.currentIndex - 2
      }, () => {
        this.forceNext();
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

  forceNext() {
    TTS.stop();
    this.setState({ playingUtterance: -1 }, () => {
      this.handleTTSStopped({ utteranceId: -1 });
    });
  }

  handleTTSStarted(utteranceId) {
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
        // It would be nice to delay for next playing. But we don't lock anything in this app.
        // Once we do it, the app will be put in low priority which will stopped to run.
        this.play(items[nextIndex]);
      });
    } else {
      this.setState({
        playingUtterance: null,
        systemUtterance: null,
        ttsState: MusicControl.STATE_STOPPED,
      });
      TTS.speak('所有新聞已報讀完畢');
    }
  }

  play(item) {
    MusicControl.setNowPlaying({
      title: item.title,
      artist: 'TTS',
      duration: 1 + (item.title.length + item.description.length) / 7, // (Seconds)
      description: item.description,
      state: MusicControl.STATE_PLAYING,
      speed: 1
    });
    TTS.speak(`標題：${item.title}。`);
    const lines = item.text.split('。');
    TTS.speak('本文：');
    _.forEach(lines, (line, index) => {
      const promise = TTS.speak(line);
      if (index === lines.length - 1) {
        promise.then((utteranceId) => {
          this.setState({ playingUtterance: utteranceId });
        }).catch((err) => {
          this.forceNext();
          console.error('unable to read news', err, `標題：${item.title}。本文：${item.text}`);
        });
      }
    });
  }

  convertToFeedItem(url, rssItem) {
    const link = rssItem.link[0] || _.get(rssItem, 'feedburner:origLink[0]');
    return {
      key: `${link}`,
      sourceURL: url,
      categories: rssItem.category,
      title: rssItem.title.join(', '),
      description: rssItem.description.join(', '),
      pubDate: rssItem.pubDate[0],
      link: link
    };
  }

  handleDataInserted() {
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
    const newItems = [];
    const channels = _.get(xml, 'rss.channel');
    _.forEach(channels, (channel) => {
      _.forEach(channel.item, (item) => {
        newItems.push(this.convertToFeedItem(url, item));
      });
    });
    this.fetchContent(newItems);
  }

  fetchSingleItem(item) {
    const url = `https://qianliyan.herokuapp.com/extract?url=${item.link}&lang=zh-TW`;
    return fetch(url).then((response) => {
      return response.text()
    }).then((text) => {
      item.text = JSON.parse(text).text;
      return item.text;
    });
  }

  fetchContent(newItems) {
    if (newItems.length < 2) {
      console.error('The size should not be less then 2: ', newItems);
      return;
    }
    const first = newItems[0];
    const second = newItems[1];
    const others = [...newItems];
    others.splice(0, 2);
    const firstBatch = [this.fetchSingleItem(first), this.fetchSingleItem(second)];
    const firstPromise = Promise.all(firstBatch).then(() => {
      return new Promise((resolve, reject) => {
        this.setState({
          items: [
            ...this.state.items,
            first,
            second
          ]
        }, () => {
          this.handleDataInserted();
          resolve();
        });
      });
    });

    const chained = _.reduce(others, (previous, item) => {
      return previous.then(() => {
        return this.fetchSingleItem(item).then(() => {
          return new Promise((resolve, reject) => {
            this.setState({
              items: [
                ...this.state.items,
                item
              ]
            }, () => {
              resolve();
            });
          });
        });
      });
    }, firstPromise);
    return chained;
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
    return (<Text key={item.link} style={styles.listItem}>{item.title}</Text>);
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
