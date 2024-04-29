import React from "react";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Logo } from "~/assets/Logo";
import { UNAUTHORIZED_INDEX } from "~/utils/utils.common";

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  return (
    <footer>
      <hr className="border-gray-200 sm:mx-auto dark:border-gray-700" />
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to={UNAUTHORIZED_INDEX} className="flex items-center">
              <Logo className="me-2" />
              <span className="self-center text-sm font-semibold whitespace-nowrap dark:text-white">
                {t("brand")}
              </span>
            </Link>
            <div className="flex mt-4 sm:justify-start sm:mt-0 pt-6">
              {/* <Link
                to="https://tg.me/"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
              >
                <SocialsTgIcon />
                <span className="sr-only">Telegram channel</span>
              </Link> */}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                {t("footer.label.resources")}
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link
                    to={`/${i18n.language}/pages/faq`}
                    className="hover:underline"
                  >
                    {t("nav.label.faq")}
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    to={`/${i18n.language}/pages/support`}
                    className="hover:underline"
                  >
                    {t("nav.label.support")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${i18n.language}/pages/contacts`}
                    className="hover:underline"
                  >
                    {t("nav.label.contacts")}
                  </Link>
                </li>
              </ul>
            </div>
            {/* <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                {t("footer.label.follow")}
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">12</li>
              </ul>
            </div> */}
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                {t("footer.label.legal")}
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link
                    to={`/${i18n.language}/pages/privacy`}
                    className="hover:underline"
                  >
                    {t("footer.label.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${i18n.language}/pages/terms`}
                    className="hover:underline"
                  >
                    {t("footer.label.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023 {t("brand")}. {t("copyright")}
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
