export const UNAUTHORIZED_INDEX = "/";
export const AUTHORIZED_USER_INDEX = "/";
export const AUTHORIZED_ADMIN_INDEX = "/warp";
export const AUTHENTICATION_FAILURE_PATHS = {
  admin: "/warp/sign-in",
  user: "/auth/sign-in",
};
export const SIGNUP_USER_PATH = "/auth/sign-up";

export const localeFlagDictionary: { [key: string]: string[] } = {
  en: ["🇬🇧", "English"],
  es: ["🇪🇸", "Español"],
  ru: ["🇷🇺", "Русский"],
  // "us": "🇺🇸", // Соединенные Штаты
  // "gb": "🇬🇧", // Великобритания
  // "de": "🇩🇪", // Германия
  // "fr": "🇫🇷", // Франция
  // "es": "🇪🇸", // Испания
  // "it": "🇮🇹", // Италия
  // "ru": "🇷🇺", // Россия
  // "cn": "🇨🇳", // Китай
  // "jp": "🇯🇵", // Япония
  // "br": "🇧🇷", // Бразилия
  // "in": "🇮🇳", // Индия
  // "ca": "🇨🇦", // Канада
  // "au": "🇦🇺", // Австралия
  // "mx": "🇲🇽", // Мексика
  // "kr": "🇰🇷", // Южная Корея
  // "za": "🇿🇦", // Южно-Африканская Республика
  // "se": "🇸🇪", // Швеция
  // "no": "🇳🇴", // Норвегия
  // "fi": "🇫🇮", // Финляндия
  // "dk": "🇩🇰", // Дания
  // "ch": "🇨🇭", // Швейцария
  // "nl": "🇳🇱", // Нидерланды
  // "be": "🇧🇪", // Бельгия
  // "at": "🇦🇹", // Австрия
  // "pl": "🇵🇱", // Польша
};

/**
 * Icon component props
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * The width of icon component
   */
  width?: number | string;
  /**
   * The height of icon component
   */
  height?: number | string;
  /**
   * The color of icon component
   */
  fill?: string;
}

export const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
