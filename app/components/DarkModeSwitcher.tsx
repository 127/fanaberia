import { Switch } from "@nextui-org/react";
import { useEffect } from "react";
import { MoonIcon } from "~/assets/MoonIcon";
import { SunIcon } from "~/assets/SunIcon";
import { useTranslation } from "react-i18next";
import { useFetcher } from "@remix-run/react";

const darkClassName = "dark";
const darkUrl = "/api/v1/darkmode";

const DarkModeSwitcher = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { t } = useTranslation("common");
  const fetcher = useFetcher();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle(darkClassName, isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () =>
    fetcher.submit(
      { isDarkMode: !isDarkMode },
      { method: "post", action: darkUrl }
    );

  return (
    <Switch
      isSelected={!isDarkMode}
      onChange={toggleDarkMode}
      size="sm"
      color="success"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
    >
      {t("nav.label.theme")}
    </Switch>
  );
};

export default DarkModeSwitcher;
