import { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { LocaleContext } from "@/contexts/LocaleContext";
import i18next from "@/i18n";

interface LocaleLayoutProps {
  locale: string;
  prefix: string; // "" for en, "/pt-br" for pt-BR
}

const LocaleLayout = ({ locale, prefix }: LocaleLayoutProps) => {
  useEffect(() => {
    i18next.changeLanguage(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      localePath: (path: string) => {
        if (!prefix) return path;
        return path === "/" ? prefix + "/" : `${prefix}${path}`;
      },
    }),
    [locale, prefix]
  );

  return (
    <LocaleContext.Provider value={value}>
      <Outlet />
    </LocaleContext.Provider>
  );
};

export default LocaleLayout;
