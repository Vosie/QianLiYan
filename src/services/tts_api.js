import TTS from 'react-native-tts';

class TTSApi {

    constructor() {
        this.handleTTSCancelled = ::this.handleTTSCancelled;
        this.handleTTSStopped = ::this.handleTTSStopped;
        this._playMap = {};
        this.initEventListeners();
    }

    initEventListeners() {
        TTS.addEventListener('tts-cancel', this.handleTTSCancelled);
        TTS.addEventListener('tts-finish', this.handleTTSStopped);
    }

    uninitEventListeners() {
        TTS.removeEventListener('tts-cancel', this.handleTTSCancelled);
        TTS.removeEventListener('tts-finish', this.handleTTSStopped);
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
