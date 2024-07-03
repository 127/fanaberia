// stub localisations t funciton
import en from '../../public/locales/en/common.json';
import es from '../../public/locales/es/common.json';
import i18n from '../../app/i18n';
import ru from '../../public/locales/ru/common.json';
const translationsCache = { en, ru, es };
export const t = (key: string, lang?: string) => {
  const effectiveLang = i18n.supportedLngs.includes(lang) ? lang : i18n.fallbackLng;
  const languageTranslations = translationsCache[effectiveLang];

  return languageTranslations[key] || key;
};
