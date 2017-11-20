import _ from 'lodash';
import DeviceLocker from 'react-native-device-locker';

class BaseDownloader {

    constructor(runner) {
        this._queue = [];
        this._runner = runner;
        this.running = false;

        this._fetchNext = ::this._fetchNext;
    }

    _fetchNext() {
        const task = this._queue.shift();

        if (!task) {
            this.running = false;
            DeviceLocker.releaseWakeLock(this.deviceLock).then(() => {
                console.log('lock released', this.deviceLock);
                this.deviceLock = null;
            }).catch((ex) => {
                console.error('release lock failed', ex);
            });
            return;
        }

        this._runner.fetch(task.url).then((obj) => {
            try {
                this._runner.process(obj, task);
            } finally {
                // We have to continue fetch no matter it is failed or not.
                setTimeout(this._fetchNext, this.throttle ? this.throttle() : 0);
            }
        }).catch((ex) => {
            task.reject(ex);
            // We have to continue fetch no matter it is failed or not.
            setTimeout(this._fetchNext, this.throttle ? this.throttle() : 0);
        });
    }

    trigger() {
        if (this.running) {
            return;
        }

        this.running = true;
        DeviceLocker.requestWakeLock(DeviceLocker.PARTIAL_WAKE_LOCK).then((id) => {
            this.deviceLock = id;
            console.log('request wake lock successfully', id);
            this._fetchNext();
        }).catch((ex) => {
            console.log('request wake lock failed', ex);
            this._fetchNext();
        });
    }

    download(url) {
        return new Promise((resolve, reject) => {
            this._queue.push({
                url,
                resolve,
                reject
            });
            this.trigger();
        });
    }
}

export default BaseDownloader;
