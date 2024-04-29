import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Form, Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Logo } from "~/assets/Logo";
import DarkModeSwitcher from "./DarkModeSwitcher";
import {
  AUTHORIZED_USER_INDEX,
  UNAUTHORIZED_INDEX,
} from "~/utils/utils.common";
import { UserIcon } from "~/assets/UserIcon";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC<{ userExists: boolean; isDarkMode: boolean }> = ({
  userExists,
  isDarkMode,
}) => {
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
        {userExists && (
          <NavbarItem>
            <Link
              className="text-primary dark:text-warning-500"
              to={AUTHORIZED_USER_INDEX}
            >
              {t("nav.label.courses.own")}
            </Link>
          </NavbarItem>
        )}
        {/* 
       <NavbarItem>
          <Link color="foreground" to="/chart">
            {t("nav.label.chart")}
          </Link>
        </NavbarItem> */}
        <NavbarItem>
          <Link color="foreground" to={`/${i18n.language}/posts`}>
            {t("nav.label.blog")}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {userExists ? (
          <div className="hidden md:block">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light">
                  <UserIcon />
                  {t("nav.label.profile")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="theme" className="text-center">
                  <DarkModeSwitcher isDarkMode={isDarkMode} />
                </DropdownItem>
                <DropdownItem key="logout">
                  <Form action="/auth/sign-out" method="post">
                    <Button type="submit" className="w-full">
                      {t("sign.out.label")}
                    </Button>
                  </Form>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : (
          <>
            <NavbarItem className="hidden md:flex">
              <Link to="/auth/sign-in">{t("sign.in.label")}</Link>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                color="warning"
                to="/auth/sign-up"
                variant="flat"
                reloadDocument
              >
                {t("sign.up.label")}
              </Button>
            </NavbarItem>
            <Divider orientation="vertical" className="hidden md:flex" />
            <NavbarItem className="hidden md:flex">
              <DarkModeSwitcher isDarkMode={isDarkMode} />
            </NavbarItem>
          </>
        )}
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
        {userExists && (
          <NavbarMenuItem>
            <Link
              color="foreground"
              to={AUTHORIZED_USER_INDEX}
              onClick={toggleMenu}
            >
              {t("nav.label.courses.own")}
            </Link>
          </NavbarMenuItem>
        )}
        {/* 
        <NavbarMenuItem
          key="mnu-home"
          className=" flex flex-row justify-between"
        >
          <Link color="foreground" to={homeUrl} onClick={toggleMenu}>
            {t("nav.label.courses")}
          </Link>
          <span>
            <DarkModeSwitcher />
          </span>
        </NavbarMenuItem>
        <Divider />
        {/* <NavbarMenuItem>
          <Link color="foreground" to="/chart" size="lg">
            {t("nav.label.chart")}
          </Link>
        </NavbarMenuItem> */}
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
        {userExists ? (
          <NavbarMenuItem key="mnu-sign-out" onClick={toggleMenu}>
            <Form action="/auth/sign-out" method="post">
              <Button
                type="submit"
                color="danger"
                className="w-full"
                size="lg"
                onClick={toggleMenu}
              >
                {t("sign.out.label")}
              </Button>
            </Form>
          </NavbarMenuItem>
        ) : (
          <>
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
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};
export default Header;
