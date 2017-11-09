import TTS from 'react-native-tts';
import EventEmitter from 'browser-event-emitter';

// TODO, try to implement the playing queue here.

class TTSApi extends EventEmitter {

    constructor() {
        this.handleTTSStarted = ::this.handleTTSStarted;
        this.handleTTSCancelled = ::this.handleTTSCancelled;
        this.handleTTSStopped = ::this.handleTTSStopped;
        this._playMap = {};
        this.initEventListeners();
    }

    initEventListeners() {
        TTS.addEventListener('tts-start', this.handleTTSStarted);
        TTS.addEventListener('tts-cancel', this.handleTTSCancelled);
        TTS.addEventListener('tts-finish', this.handleTTSStopped);
    }

    uninitEventListeners() {
        TTS.removeEventListener('tts-start', this.handleTTSStarted);
        TTS.removeEventListener('tts-cancel', this.handleTTSCancelled);
        TTS.removeEventListener('tts-finish', this.handleTTSStopped);
    }

    handleTTSStarted({ utteranceId }) {
        if (!this._playMap[utteranceId]) {
            return;
        }
        const { id, text } = this._playMap[utteranceId];
        this.emit('start', text, id);
    }

    handleTTSCancelled({ utteranceId }) {
        if (!this._playMap[utteranceId]) {
            return;
        }
        const {
            id,
            reject,
            text
        } = this._playMap[utteranceId];

        reject(text, id);
        delete this._playMap[utteranceId];
        this.emit('cancelled', text, id);
    }

    handleTTSStopped({ utteranceId }) {
        if (!this._playMap[utteranceId]) {
            return;
        }
        const {
            id,
            resolve,
            text
        } = this._playMap[utteranceId];

        resolve(text, id);
        delete this._playMap[utteranceId];
        this.emit('stopped', text, id);
    }

    // id is an optional argument.
    play(text, id) {
        return new Promise((resolve, reject) => {
            TTS.speak(text).then((utteranceId) => {
                this._playMap[utteranceId] = {
                    id,
                    reject,
                    resolve,
                    text
                };
            }).catch((ex) => {
                reject(ex);
                this.emit('error', ex);
            });
        });
    }

    stop() {
        return TTS.stop();
    }

    close() {
        this.stop();
        this.uninitEventListeners();
    }

}

const singleton = new TTSApi();

export default singleton;
