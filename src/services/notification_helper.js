import MusicControl from 'react-native-music-control';
import _ from 'lodash';

class NotificationHelper {

    setPlaying(item, index, count) {
        const stringLength = item.title.length + (item.text ? item.text.length : 0);
        MusicControl.setNowPlaying({
            title: `(${index + 1}/${count}) - ${item.title}`,
            artist: 'TTS',
            // (Seconds)
            duration: (1 + stringLength) / 7,
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
            elapsedTime: textCount / 7,
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

    onNotificationClosed(fn) {
        // TODO: rewrite this as a good event handler model.
        MusicControl.on('closeNotification', () => {
            console.log('close it....');
            fn();
        });
    }

}

const singleton = new NotificationHelper();

export default singleton;
