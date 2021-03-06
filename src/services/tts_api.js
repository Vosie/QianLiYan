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

        reject && reject({ type: 'cancelled', text, id });
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

        resolve && resolve(text, id);
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
            task.reject && task.reject({
                type: 'cancelled',
                text: task.text,
                id: task.id
            });
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
                reject && reject(ex);
                this.emit('error', ex);
            });
        } catch (ex) {
            reject && reject(ex);
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

    playList(list, key, sentenceIndexKey) {
        return new Promise((resolve, reject) => {
            _.forEach(list, (text, index) => {
                const id = { key, [sentenceIndexKey]: index };
                if (this._playingCount >= MAXIMUM_PLAYING_IN_TTS) {
                    const task = { text, id };
                    if (index === list.length - 1) {
                        task.resolve = resolve;
                        task.reject = reject;
                    }
                    this._taskQueue.push(task);
                } else if (index === list.length - 1) {
                    this._ttsSpeak(text, id, resolve, reject);
                } else {
                    this._ttsSpeak(text, id);
                }
            });
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
