import MusicControl from 'react-native-music-control';
import _ from 'lodash';

class NotificationHelper {

    setPlaying(item, index, count) {
        MusicControl.setNowPlaying({
            title: `(${index + 1}/${count}) - ${item.title}`,
            artist: 'TTS',
            duration: (1 + item.title.length + item.text.length) / 7, // (Seconds)
            description: item.description,
            state: MusicControl.STATE_PLAYING,
            speed: 1
        });
    }

    updatePlayback(item, playList, playingIndex) {
        let textCount = 0;
        for (let i = 0; i < playingIndex; i++) {
            textCount += playList[i].length;
        }

        MusicControl.updatePlayback({
            state: MusicControl.STATE_PLAYING,
            elapsedTime: (1 + item.title.length + item.text.length) / 7,
        });
    }

    pausePlayback() {
        MusicControl.updatePlayback({
            state: MusicControl.STATE_PAUSED,
        });
    }

    stopPlayback() {
        MusicControl.updatePlayback({
            state: MusicControl.STATE_STOPPED,
        });
    }

    close() {
        MusicControl.resetNowPlaying();
    }

}

const singleton = new NotificationHelper();

export default singleton;
