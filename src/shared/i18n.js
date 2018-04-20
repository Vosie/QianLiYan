import i18n from 'react-native-i18n';
import en from './locales/en';
import zhTW from './locales/zh-TW';

i18n.fallbacks = true;
i18n.translations = {
    en,
    // In some android devices, we will not have zh-TW for Taiwan Chinese. It gives us "zh-Hant-TW".
    'zh-Hant-TW': zhTW,
    'zh-TW': zhTW
};

export default i18n;
