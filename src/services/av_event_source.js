import MusicControl from 'react-native-music-control';
import _ from 'lodash';

const validEvents = ['play', 'pause', 'stop', 'previousTrack', 'nextTrack', 'close'];

class MusicEventSource {

    constructor() {
        this.listeners = _.reduce(validEvents, (acc, item) => {
            acc[item] = [];
            return acc;
        }, {});
        this.initMusicControl();
    }

    addEventListener(type, fn) {
        if (validEvents.indexOf(type) < 0) {
            throw new Error(`invalid event type ${type}`);
        }

        this.listeners[type].push(fn);
    }

    removeEventListener(type, fn) {
        if (validEvents.indexOf(type) < 0) {
            throw new Error(`invalid event type ${type}`);
        }
        const index = this.listeners[type].indexOf(fn);

        index > -1 && this.listeners[type].splice(index, 1);
    }

    triggerEvent(type, data) {
        if (validEvents.indexOf(type) < 0) {
            throw new Error(`invalid event type ${type}`);
        }

        const listeners = this.listeners[type];
        _.forEach(listeners, (fn) => {
            try {
                fn(data);
            } catch (ex) {
                console.error('execute callback error', ex);
            }
        });
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
            this.triggerEvent('play');
        });

        // on iOS this event will also be triggered by the audio router change event.
        // This happens when headphones are unplugged or a bluetooth audio peripheral disconnects
        // from the device
        MusicControl.on('pause', ()=> {
            this.triggerEvent('pause');
        });

        MusicControl.on('stop', ()=> {
            this.triggerEvent('stop');
        });

        MusicControl.on('nextTrack', ()=> {
            this.triggerEvent('nextTrack');
        });

        MusicControl.on('previousTrack', ()=> {
            this.triggerEvent('previousTrack');
        });
    }
}

const singleton = new MusicEventSource();

export default singleton;
