import _ from 'lodash';

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
            return;
        }

        this._runner.fetch(task.url).then((obj) => {
            try {
                this._runner.process(obj, task);
            } finally {
                // We have to continue fetch no matter it is failed or not.
                setTimeout(this._fetchNext);
            }
        }).catch((ex) => {
            task.reject(ex);
            // We have to continue fetch no matter it is failed or not.
            setTimeout(this._fetchNext);
        });
    }

    trigger() {
        if (this.running) {
            return;
        }

        this.running = true;
        this._fetchNext();
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
