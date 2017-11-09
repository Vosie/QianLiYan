import TTS from 'react-native-tts';
import EventEmitter from 'wolfy87-eventemitter';
import _ from 'lodash';

const MAXIMUM_PLAYING_IN_TTS = 10;

class TTSApi extends EventEmitter {

    constructor() {
        super();
        this.handleTTSStarted = ::this.handleTTSStarted;
        this.handleTTSCancelled = ::this.handleTTSCancelled;
        this.handleTTSStopped = ::this.handleTTSStopped;
        this._playMap = {};
        this._playingCount = 0;
        this._taskQueue = [];
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

        reject(text, id, 'cancelled');
        delete this._playMap[utteranceId];
        this.emit('cancelled', text, id);
        this._playingCount--;
        this.nextTask();
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
        this._playingCount--;
        this.nextTask();
    }

    nextTask() {
        const task = this._taskQueue.shift();
        if (!task) {
            return;
        }

        this._ttsSpeak(task.text, task.id, task.resolve, task.reject);
    }

    clearQueue() {
        _.forEach(this._taskQueue, (task) => {
            task.reject(task.text, task.id, 'cancelled');
        });
        this._taskQueue = [];
    }

    _ttsSpeak(text, id, resolve, reject) {
        this._playingCount++;
        try {
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
        } catch (ex) {
            reject(ex);
            this.emit('error', ex);
        }
    }

    // id is an optional argument.
    play(text, id) {
        return new Promise((resolve, reject) => {
            if (this._playingCount >= MAXIMUM_PLAYING_IN_TTS) {
                this._taskQueue.push({ text, id, resolve, reject });
            } else {
                this._ttsSpeak(text, id, resolve, reject);
            }
        });
    }

    stop() {
        return TTS.stop();
    }

    close() {
        this.clearQueue();
        this.stop();
        this.uninitEventListeners();
    }

}

const singleton = new TTSApi();

export default singleton;
