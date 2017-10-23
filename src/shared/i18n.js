import i18n from 'react-native-i18n';
import en from './locales/en';
import zhTW from './locales/zh-TW';

i18n.fallbacks = true;
i18n.translations = {
  en,
  'zh-TW': zhTW
};

export default i18n;
