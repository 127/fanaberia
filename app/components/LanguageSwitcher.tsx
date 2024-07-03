import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { localeFlagDictionary } from '~/utils/utils.common';
import { useFetcher } from '@remix-run/react';
import i18n from '~/i18n';

const langUrl = '/api/v1/locale';

const LanguageSwitcher = ({ selectedLocale }: { selectedLocale: string }) => {
  // const { t } = useTranslation("common");
  const fetcher = useFetcher();

  const toggleLang = (locale: string) =>
    fetcher.submit({ locale }, { method: 'post', action: langUrl });

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">{`${localeFlagDictionary[selectedLocale][0]} ${localeFlagDictionary[selectedLocale][1]}`}</Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={[selectedLocale]}>
        {i18n.supportedLngs.map((lang) => (
          <DropdownItem
            key={lang}
            className="text-center"
            onClick={() => toggleLang(lang)}>
            {`${localeFlagDictionary[lang][0]} ${localeFlagDictionary[lang][1]}`}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
