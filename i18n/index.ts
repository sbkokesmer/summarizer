import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en';
import es from './translations/es';
import fr from './translations/fr';
import de from './translations/de';
import it from './translations/it';
import tr from './translations/tr';
import ja from './translations/ja';
import ko from './translations/ko';
import zh from './translations/zh';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  tr: { translation: tr },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
