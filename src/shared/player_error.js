import i18n from './i18n';

class PlayerError extends Error {
    constructor(code, message, extra) {
        super();
        this.code = code;
        this.message = message || i18n.t(`errors.${code}`);
        this.extraError = extra;
    }
}

export default PlayerError;
