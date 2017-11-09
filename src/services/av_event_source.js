import MusicControl from 'react-native-music-control';
import _ from 'lodash';
import EventEmitter from 'wolfy87-eventemitter';

class MusicEventSource extends EventEmitter {

    constructor() {
        super();
        this.initMusicControl();
    }

    initMusicControl() {
        // basic
        MusicControl.enableControl('play', true);
        MusicControl.enableControl('pause', true);
        MusicControl.enableControl('stop', true);
        // previous and next
        MusicControl.enableControl('nextTrack', true);
        MusicControl.enableControl('previousTrack', true);
        //
        MusicControl.enableControl('seek', false); // Android only
        MusicControl.enableControl('skipForward', false);
        MusicControl.enableControl('skipBackward', false);
        MusicControl.enableControl('closeNotification', true, {when: 'always'}); // Android only
        MusicControl.on('play', ()=> {
            this.emit('play');
        });

        // on iOS this event will also be triggered by the audio router change event.
        // This happens when headphones are unplugged or a bluetooth audio peripheral disconnects
        // from the device
        MusicControl.on('pause', ()=> {
            this.emit('pause');
        });

        MusicControl.on('stop', ()=> {
            this.emit('stop');
        });

        MusicControl.on('nextTrack', ()=> {
            this.emit('nextTrack');
        });

        MusicControl.on('previousTrack', ()=> {
            this.emit('previousTrack');
        });
    }
}

const singleton = new MusicEventSource();

export default singleton;
