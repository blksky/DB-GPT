import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en, english } from './locales/en';
import { chinese, zh } from './locales/zh';
import { traditionalChinese, zh_tw } from './locales/zh-tw';

export const languages = [english, chinese, traditionalChinese].sort((a, b) => a.name.localeCompare(b.name));

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en,
      zh,
      'zh-TW': zh_tw,
    },
  });

export default i18n;
