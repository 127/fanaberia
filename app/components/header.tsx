import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Divider,
} from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Logo } from "~/assets/Logo";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { UNAUTHORIZED_INDEX } from "~/utils/utils.common";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { t, i18n } = useTranslation("common");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <Navbar
      maxWidth="xl"
      isBordered
      isBlurred={false}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="md:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={
            isMenuOpen ? t("nav.label.close.menu") : t("nav.label.open.menu")
          }
        />
      </NavbarContent>

      <NavbarContent className="md:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link to="/" className="flex flex-row text-foreground items-center">
            <Logo width={30} height={30} className="me-2 text-foreground" />
            <span className="font-bold text-inherit">{t("brand")}</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-4 justify-center">
        <NavbarBrand>
          <Link
            to={UNAUTHORIZED_INDEX}
            className="flex flex-row text-foreground items-center"
          >
            <Logo width={30} height={30} className="me-2" />
            <span className="font-bold text-inherit">{t("brand")}</span>
          </Link>
        </NavbarBrand>

        <NavbarItem>
          <Link color="foreground" to={UNAUTHORIZED_INDEX}>
            {t("nav.label.home")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" to={`/${i18n.language}/posts`}>
            {t("nav.label.blog")}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden md:flex">
          <DarkModeSwitcher isDarkMode={isDarkMode} />
        </NavbarItem>
        <NavbarItem className="hidden md:block">
          <LanguageSwitcher selectedLocale={i18n.language} />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <NavbarMenuItem
          key="mnu-home"
          className=" flex flex-row justify-between"
        >
          <Link color="foreground" to={UNAUTHORIZED_INDEX} onClick={toggleMenu}>
            {t("nav.label.home")}
          </Link>
          <span>
            <DarkModeSwitcher isDarkMode={isDarkMode} />
          </span>
        </NavbarMenuItem>
        <Divider />
        <NavbarMenuItem>
          <Link
            color="foreground"
            to={`/${i18n.language}/posts`}
            onClick={toggleMenu}
          >
            {t("nav.label.blog")}
          </Link>
        </NavbarMenuItem>
        <Divider />
        <NavbarMenuItem key="mnu-sing-in">
          <Link
            color="foreground"
            className="w-full"
            to="/auth/sign-in"
            onClick={toggleMenu}
          >
            {t("sign.in.label")}
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem key="mnu-sign-up">
          <Link
            color="warning"
            className="w-full"
            to="/auth/sign-up"
            onClick={toggleMenu}
            reloadDocument
          >
            {t("sign.up.label")}
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};
export default Header;
