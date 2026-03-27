import { createContext, useContext } from "react";

interface LocaleContextValue {
  locale: string;
  /** Returns a locale-prefixed path. e.g. localePath('/login') → '/pt-br/login' */
  localePath: (path: string) => string;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  localePath: (path) => path,
});

export const useLocale = () => useContext(LocaleContext);
